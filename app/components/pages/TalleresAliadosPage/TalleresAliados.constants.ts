// app/components/pages/TalleresAliadosPage/TalleresAliados.constants.ts

/** Radio máximo de búsqueda de talleres cercanos, en kilómetros. */
export const RADIO_BUSQUEDA_KM = 10;

/**
 * Opciones que se le pasan a navigator.geolocation.getCurrentPosition.
 * El timeout es clave: sin él, si el dispositivo nunca responde, la
 * promesa queda colgada y el botón se queda en "Obteniendo tu ubicación..."
 * para siempre.
 */
export const OPCIONES_GEOLOCALIZACION: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

/** Tiempo máximo de espera de la petición al backend, en milisegundos. */
export const TIMEOUT_PETICION_MS = 12000;

/**
 * Opciones para navigator.geolocation.watchPosition (seguimiento en
 * vivo). maximumAge en 0 fuerza una lectura fresca en cada actualización
 * en vez de reusar una posición cacheada, a diferencia de
 * OPCIONES_GEOLOCALIZACION que sí acepta una posición reciente.
 */
export const OPCIONES_SEGUIMIENTO_EN_VIVO: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

/** Causas de error que la vista sabe distinguir y explicar. */
export type CausaError =
  | "sin-soporte"
  | "contexto-inseguro"
  | "permiso-denegado"
  | "ubicacion-no-disponible"
  | "tiempo-agotado"
  | "sin-conexion"
  | "servidor"
  | "desconocido";

/** Estado del flujo de geolocalización. */
export type EstadoGeo =
  | { tipo: "inactivo" }
  | { tipo: "cargando" }
  | { tipo: "con-resultados" }
  | { tipo: "sin-resultados" }
  | { tipo: "error"; causa: CausaError };

/** Todo lo que la pantalla puede tener que explicar cuando no hay tarjetas. */
export type ClaveMensaje =
  | CausaError
  | "sin-resultados"
  | "sin-coincidencias"
  | "sin-talleres";

export interface MensajeEstado {
  icono: string;
  titulo: string;
  texto: string;
  /** Texto del botón de acción. null = el estado no ofrece acción. */
  accion: string | null;
}

export const MENSAJES_ESTADO: Record<ClaveMensaje, MensajeEstado> = {
  // ---- Caso A: permisos ----
  "permiso-denegado": {
    icono: "📍",
    titulo: "La ubicación está bloqueada",
    texto:
      "Este navegador tiene bloqueado el permiso de ubicación para el sitio. Actívalo desde el candado de la barra de direcciones y vuelve a intentarlo, o busca el taller por nombre, barrio o ciudad.",
    accion: "Intentar de nuevo",
  },
  "ubicacion-no-disponible": {
    icono: "🛰️",
    titulo: "El dispositivo no entregó tu ubicación",
    texto:
      "El permiso está concedido, pero no se obtuvo una posición. Revisa que la ubicación del sistema o el GPS estén encendidos.",
    accion: "Intentar de nuevo",
  },
  "tiempo-agotado": {
    icono: "⏱️",
    titulo: "La ubicación tardó demasiado",
    texto:
      "La señal no llegó a tiempo. Intenta de nuevo con mejor recepción, o busca el taller por nombre, barrio o ciudad.",
    accion: "Intentar de nuevo",
  },
  "sin-soporte": {
    icono: "🧭",
    titulo: "Este navegador no entrega la ubicación",
    texto:
      "La búsqueda por cercanía no está disponible aquí. Usa el buscador por nombre, barrio o ciudad para encontrar un taller.",
    accion: null,
  },
  "contexto-inseguro": {
    icono: "🔒",
    titulo: "La ubicación necesita una conexión segura",
    texto:
      "Los navegadores solo entregan la ubicación en sitios HTTPS. Abre la aplicación desde su dirección https:// o desde localhost.",
    accion: null,
  },

  // ---- Caso B: conectividad ----
  "sin-conexion": {
    icono: "📡",
    titulo: "Sin conexión a internet",
    texto:
      "No hay red para consultar los talleres cercanos. Vuelve a intentarlo cuando recuperes la conexión.",
    accion: "Reintentar",
  },
  servidor: {
    icono: "🛠️",
    titulo: "El servicio de talleres no responde",
    texto:
      "La búsqueda por cercanía no está disponible en este momento. Intenta de nuevo en unos minutos.",
    accion: "Reintentar",
  },
  desconocido: {
    icono: "❓",
    titulo: "No se pudo completar la búsqueda",
    texto:
      "Algo falló al buscar talleres cercanos. Intenta de nuevo o busca el taller por nombre, barrio o ciudad.",
    accion: "Reintentar",
  },

  // ---- Caso C: sin resultados ----
  "sin-resultados": {
    icono: "🗺️",
    titulo: `No hay talleres a menos de ${RADIO_BUSQUEDA_KM} km`,
    texto:
      "Ningún taller aliado está dentro de ese radio desde tu ubicación actual. Puedes revisar la red completa y filtrar por marca.",
    accion: "Ver todos los talleres",
  },
  "sin-coincidencias": {
    icono: "🔎",
    titulo: "Ningún taller coincide con la búsqueda",
    texto:
      "Hay talleres disponibles, pero ninguno coincide con el texto escrito o la marca seleccionada.",
    accion: "Limpiar filtros",
  },
  "sin-talleres": {
    icono: "🏪",
    titulo: "Todavía no hay talleres registrados",
    texto:
      "La red de talleres aliados está vacía. Vuelve más tarde para ver los centros de reparación disponibles.",
    accion: null,
  },
};

export const TEXTO_BANNER_OFFLINE =
  "Sin conexión a internet. Estás viendo los talleres que se cargaron antes de perder la red.";

export const TEXTO_BOTON_CERCANOS = `📍 Ver talleres cerca de mí`;
export const TEXTO_BOTON_CERCANOS_CARGANDO = "Obteniendo tu ubicación...";
export const TEXTO_BOTON_VOLVER = "Volver a la vista normal";
export const TEXTO_CARGANDO_TALLERES = "Cargando talleres...";

// --- Ubicación en vivo sobre el mapa ---
export const TEXTO_BOTON_UBICACION_ENCENDER = "Mostrar mi ubicación en el mapa";
export const TEXTO_BOTON_UBICACION_APAGAR = "Dejar de compartir mi ubicación";
export const TEXTO_POPUP_ESTOY_AQUI = "Estás aquí";