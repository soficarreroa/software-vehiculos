// app/components/pages/TalleresAliadosPage/TalleresAliados.service.ts

import { API_BASE_URL } from "@/app/lib/api/client";
import { Workshop } from "@/app/types/workshop";
import {
  CausaError,
  OPCIONES_GEOLOCALIZACION,
  RADIO_BUSQUEDA_KM,
  TIMEOUT_PETICION_MS,
} from "./TalleresAliados.constants";

/**
 * Error tipado del flujo de talleres cercanos. La vista nunca lee el
 * mensaje: lee `causa` y decide qué mostrar. Así el texto de UI vive
 * en un solo lugar (TalleresAliados.constants.ts).
 */
export class GeoError extends Error {
  constructor(
    public readonly causa: CausaError,
    mensaje?: string,
  ) {
    super(mensaje ?? causa);
    this.name = "GeoError";
  }
}

function estaOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export const talleresCercanosService = {
  /**
   * Envuelve getCurrentPosition en una promesa y traduce cada código de
   * error del navegador a una causa propia.
   *
   * Códigos del estándar: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE,
   * 3 = TIMEOUT.
   */
  obtenerUbicacion(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        reject(new GeoError("sin-soporte"));
        return;
      }

      // Chrome, Edge y Safari bloquean la geolocalización en http://
      // (salvo localhost). Sin este chequeo el navegador devuelve
      // PERMISSION_DENIED y el usuario busca un permiso que no existe.
      if (!window.isSecureContext) {
        reject(new GeoError("contexto-inseguro"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (posicion) => resolve(posicion.coords),
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new GeoError("permiso-denegado", error.message));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new GeoError("ubicacion-no-disponible", error.message));
              break;
            case error.TIMEOUT:
              reject(new GeoError("tiempo-agotado", error.message));
              break;
            default:
              reject(new GeoError("desconocido", error.message));
          }
        },
        OPCIONES_GEOLOCALIZACION,
      );
    });
  },

  /**
   * Consulta el estado del permiso SIN abrir el diálogo del navegador.
   * Sirve para mostrar de antemano que la ubicación está bloqueada.
   * No está soportado en todos los navegadores: devuelve "desconocido"
   * cuando no se puede saber.
   */
  async consultarPermiso(): Promise<PermissionState | "desconocido"> {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return "desconocido";
    }
    try {
      const resultado = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      return resultado.state;
    } catch {
      return "desconocido";
    }
  },

  /**
   * Pide al backend los talleres cercanos y devuelve solo los que están
   * dentro del radio. Todo fallo sale como GeoError con causa explícita.
   */
  async buscarCercanos(
    lat: number,
    lng: number,
    radioKm: number = RADIO_BUSQUEDA_KM,
  ): Promise<Workshop[]> {
    // Corte temprano: si el navegador ya sabe que no hay red, no se
    // gasta el tiempo de espera del fetch.
    if (estaOffline()) {
      throw new GeoError("sin-conexion");
    }

    const controlador = new AbortController();
    const temporizador = setTimeout(
      () => controlador.abort(),
      TIMEOUT_PETICION_MS,
    );

    try {
      const respuesta = await fetch(
        `${API_BASE_URL}/api/v1/talleres/cercanos?lat=${lat}&lng=${lng}`,
        { signal: controlador.signal },
      );

      if (!respuesta.ok) {
        throw new GeoError("servidor", `HTTP ${respuesta.status}`);
      }

      // Un body vacío o malformado también es un caso límite: si el
      // .json() revienta, se trata como fallo del servicio y no como
      // "no hay talleres".
      const datos: unknown = await respuesta.json().catch(() => null);

      if (!Array.isArray(datos)) {
        throw new GeoError("servidor", "Respuesta inesperada del servidor");
      }

      // Red de seguridad del radio. El backend ya recorta a
      // RADIO_MAXIMO_KM (talleres_aliados.py), pero ese valor está
      // duplicado aquí como RADIO_BUSQUEDA_KM: este filtro garantiza que
      // la pantalla nunca muestre algo que contradiga su propio texto.
      return (datos as Workshop[]).filter(
        (taller) =>
          typeof taller?.distancia_km === "number" &&
          taller.distancia_km <= radioKm,
      );
    } catch (error) {
      if (error instanceof GeoError) throw error;

      // AbortError = se agotó el TIMEOUT_PETICION_MS.
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new GeoError("tiempo-agotado", "La petición tardó demasiado");
      }

      // fetch lanza TypeError cuando la red falla. Puede ser que el
      // usuario se cayó de internet durante la petición, o que la API
      // no esté levantada: se distinguen con navigator.onLine.
      throw new GeoError(
        estaOffline() ? "sin-conexion" : "servidor",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      clearTimeout(temporizador);
    }
  },
};