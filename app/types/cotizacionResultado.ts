/**
 * Contrato real del backend (software-vehiculos-api):
 *  - POST /api/v1/analisis/danos        -> AnalisisDanosResponse
 *  - POST /api/v1/cotizaciones/estimar  -> EstimacionResponse
 */

export type Severidad = "leve" | "moderado" | "grave";
export type TipoEstablecimiento = "economico" | "multimarca" | "concesionario";

export interface CajaDano {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DanoDetectado {
  tipo_dano: string;
  clase_yolo: string;
  confianza: number;
  ubicacion: CajaDano;
  ancho: number;
  alto: number;
  tiene_contorno: boolean;
  area_relativa: number;
  severidad: Severidad | null;
  etiqueta_costo: string | null;
}

export interface AnalisisDanosResponse {
  imagen: string;
  tipos_detectados: string[];
  danos_detectados: DanoDetectado[];
  /** Presente cuando la foto es válida pero no tiene daños. */
  mensaje: string | null;
}

/* ---------------------------- /cotizaciones/estimar ---------------------------- */

export interface DanoParaEstimar {
  tipo_dano: string;
  severidad: Severidad | null;
  confianza: number;
}

export interface AsignacionPieza {
  indice_dano: number;
  pieza: string;
}

export interface EstimacionRequest {
  vehiculo_id: number;
  danos: DanoParaEstimar[];
  asignaciones: AsignacionPieza[];
}

export interface RangoPrecio {
  minimo_cop: number;
  maximo_cop: number;
}

export type PreciosPorEstablecimiento = Record<TipoEstablecimiento, RangoPrecio | null>;

export interface DanoAsociado {
  indice_dano: number;
  tipo_dano: string | null;
  confianza: number | null;
  severidad: string | null;
  pieza_original: string | null;
}

export interface DesglosePieza {
  pieza: string;
  pieza_original: string;
  piezas_originales: string[];
  es_categoria_generica: boolean;
  severidad: string;
  danos: DanoAsociado[];
  precios: PreciosPorEstablecimiento;
  establecimientos_sin_precio: string[];
  estimado: boolean;
}

export interface TotalEstablecimiento {
  minimo_cop: number | null;
  maximo_cop: number | null;
  completo: boolean;
  piezas_no_estimadas: string[];
}

export type TotalesEstimacion = Record<TipoEstablecimiento, TotalEstablecimiento>;

export interface DanoNoEstimado {
  indice_dano: number;
  tipo_dano: string | null;
  severidad: string | null;
  pieza_original: string | null;
  motivo: string;
}

export interface DanoIgnorado {
  indice_dano: number;
  tipo_dano: string | null;
  confianza: number;
  pieza_original: string | null;
  motivo: string;
}

export interface EstimacionResponse {
  vehiculo_id: number;
  marca: string | null;
  modelo: string | null;
  marca_csv: string | null;
  modelo_csv: string | null;
  anio_detectado: number | null;
  coincidencia_modelo: "exacta" | "modelo_base" | null;
  moneda: string;
  desglose: DesglosePieza[];
  totales: TotalesEstimacion;
  danos_no_estimados: DanoNoEstimado[];
  danos_ignorados: DanoIgnorado[];
  piezas_sin_precio: unknown[];
  advertencias: string[];
  nota: string;
}

/* ------------------------------ Errores de la pantalla ------------------------------ */

export type TipoErrorResultado =
  | "formato"        // 415 / 400: archivo no soportado o no es imagen
  | "demasiado_grande" // 413
  | "foto_poco_clara"  // 422: borrosa, oscura, etc.
  | "sin_danos"        // 200 sin daños detectados
  | "servicio"         // 503 / 500: modelo o catálogo no disponible
  | "red"              // sin conexión
  | "desconocido";

export interface ErrorResultado {
  tipo: TipoErrorResultado;
  mensaje: string;
}

/* ------------------- Puente con el presupuesto de CotizacionPage ------------------- */

/** Pieza elegida por el usuario y los tipos de daño de la foto que la afectan. */
export interface HallazgoFoto {
  pieza: string;
  tipos: string[];
}

export interface ResultadoAgregar {
  /** Nombres de las piezas del catálogo que se agregaron al presupuesto. */
  agregadas: string[];
  /** Piezas que no existen en el catálogo del vehículo (hay que agregarlas a mano). */
  sinCatalogo: string[];
  /** Piezas con varias coincidencias en el catálogo (hay que elegir la exacta a mano). */
  ambiguas: string[];
}

/** Pieza del catálogo del vehículo (GET /vehiculos/{id}/piezas-disponibles). */
export interface PiezaCatalogo {
  id: number;
  nombre: string;
  precio_repuesto: number | null;
  precio_mano_obra: number | null;
  precio_pintura: number | null;
  moneda: string | null;
}

/**
 * Pieza sin rango en el estimador (otra categoría, o vehículo fuera del catálogo de
 * precios) que se cotiza con el precio de catálogo de la base de datos.
 */
export interface ExtraCatalogo {
  id: number;
  nombre: string;
  indices: number[];
  valor: number;
}
