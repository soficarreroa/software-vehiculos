"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CausaError, OPCIONES_SEGUIMIENTO_EN_VIVO } from "./TalleresAliados.constants";
import { mapearErrorGeolocalizacion } from "./TalleresAliados.service";

interface Coords {
  lat: number;
  lng: number;
}

interface UbicacionEnVivo {
  /** Última posición conocida. null mientras no se activa o no llega la primera lectura. */
  posicion: Coords | null;
  /** true mientras el seguimiento está encendido. */
  activo: boolean;
  /** Causa del último fallo. Se limpia en cuanto llega una lectura buena. */
  causaError: CausaError | null;
  /** Enciende el seguimiento si está apagado, y viceversa. */
  alternar: () => void;
}

/**
 * Sigue la posición del usuario en vivo con watchPosition, a diferencia de
 * talleresCercanosService.obtenerUbicacion(), que es una sola lectura.
 * Nunca pide permiso por su cuenta: solo arranca cuando se llama a
 * alternar() (por ejemplo, desde un clic del usuario).
 */
export function useUbicacionEnVivo(): UbicacionEnVivo {
  const [posicion, setPosicion] = useState<Coords | null>(null);
  const [activo, setActivo] = useState(false);
  const [causaError, setCausaError] = useState<CausaError | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const detener = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setActivo(false);
    setPosicion(null);
  }, []);

  const iniciar = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setCausaError("sin-soporte");
      return;
    }
    if (!window.isSecureContext) {
      setCausaError("contexto-inseguro");
      return;
    }

    setCausaError(null);
    setActivo(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCausaError(null);
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => {
        const causa = mapearErrorGeolocalizacion(error);
        setCausaError(causa);
        // Un permiso denegado es definitivo: no tiene sentido seguir
        // "activo" esperando una lectura que no va a llegar. Un timeout
        // o una posición no disponible sí pueden ser pasajeros, así que
        // ahí se deja el seguimiento encendido y la última posición
        // conocida en pantalla mientras el navegador reintenta solo.
        if (causa === "permiso-denegado") {
          detener();
        }
      },
      OPCIONES_SEGUIMIENTO_EN_VIVO,
    );
  }, [detener]);

  const alternar = useCallback(() => {
    if (activo) {
      detener();
    } else {
      iniciar();
    }
  }, [activo, detener, iniciar]);

  // Si la página se desmonta con el seguimiento activo, se libera el GPS.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { posicion, activo, causaError, alternar };
}