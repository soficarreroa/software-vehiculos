import type {
  AnalisisDanosResponse,
  EstimacionResponse,
} from "@/app/types/cotizacionResultado";

/** Datos de ejemplo con la forma EXACTA del backend. Solo para desarrollo/demo. */

const svg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'>" +
  "<rect width='1280' height='720' fill='#334155'/>" +
  "<rect x='140' y='300' width='1000' height='260' rx='60' fill='#64748b'/>" +
  "<text x='640' y='650' font-family='Arial' font-size='36' fill='#cbd5e1' text-anchor='middle'>Foto de ejemplo</text>" +
  "</svg>";

export const FOTO_DEMO = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const ANALISIS_DEMO: AnalisisDanosResponse = {
  imagen: "demo.jpg",
  tipos_detectados: ["abolladura", "rayon"],
  mensaje: null,
  danos_detectados: [
    {
      tipo_dano: "abolladura",
      clase_yolo: "dent",
      confianza: 0.87,
      ubicacion: { x1: 700, y1: 330, x2: 1000, y2: 500 },
      ancho: 300,
      alto: 170,
      tiene_contorno: true,
      area_relativa: 0.055,
      severidad: "moderado",
      etiqueta_costo: "abolladura_moderado",
    },
    {
      tipo_dano: "rayon",
      clase_yolo: "scratch",
      confianza: 0.72,
      ubicacion: { x1: 180, y1: 380, x2: 420, y2: 470 },
      ancho: 240,
      alto: 90,
      tiene_contorno: true,
      area_relativa: 0.023,
      severidad: "leve",
      etiqueta_costo: "rayon_leve",
    },
    {
      tipo_dano: "grieta",
      clase_yolo: "crack",
      confianza: 0.41,
      ubicacion: { x1: 500, y1: 420, x2: 600, y2: 480 },
      ancho: 100,
      alto: 60,
      tiene_contorno: false,
      area_relativa: 0.006,
      severidad: "leve",
      etiqueta_costo: "grieta_leve",
    },
  ],
};

const rango = (minimo_cop: number, maximo_cop: number) => ({ minimo_cop, maximo_cop });

export const ESTIMACION_DEMO: EstimacionResponse = {
  vehiculo_id: 1,
  marca: "Mazda",
  modelo: "3",
  marca_csv: "Mazda",
  modelo_csv: "3",
  anio_detectado: null,
  coincidencia_modelo: "exacta",
  moneda: "COP",
  desglose: [
    {
      pieza: "Puerta",
      pieza_original: "Puerta",
      piezas_originales: ["Puerta"],
      es_categoria_generica: false,
      severidad: "moderado",
      danos: [{ indice_dano: 0, tipo_dano: "abolladura", confianza: 0.87, severidad: "moderado", pieza_original: "Puerta" }],
      precios: {
        economico: rango(450000, 700000),
        multimarca: rango(600000, 900000),
        concesionario: rango(950000, 1400000),
      },
      establecimientos_sin_precio: [],
      estimado: true,
    },
    {
      pieza: "Bumper delantero",
      pieza_original: "Bumper delantero",
      piezas_originales: ["Bumper delantero"],
      es_categoria_generica: false,
      severidad: "leve",
      danos: [{ indice_dano: 1, tipo_dano: "rayon", confianza: 0.72, severidad: "leve", pieza_original: "Bumper delantero" }],
      precios: {
        economico: rango(200000, 350000),
        multimarca: rango(280000, 450000),
        concesionario: rango(500000, 750000),
      },
      establecimientos_sin_precio: [],
      estimado: true,
    },
  ],
  totales: {
    economico: { minimo_cop: 650000, maximo_cop: 1050000, completo: true, piezas_no_estimadas: [] },
    multimarca: { minimo_cop: 880000, maximo_cop: 1350000, completo: true, piezas_no_estimadas: [] },
    concesionario: { minimo_cop: 1450000, maximo_cop: 2150000, completo: true, piezas_no_estimadas: [] },
  },
  danos_no_estimados: [
    {
      indice_dano: 2,
      tipo_dano: "grieta",
      severidad: "leve",
      pieza_original: null,
      motivo: "El daño no tiene asignación de pieza.",
    },
  ],
  danos_ignorados: [],
  piezas_sin_precio: [],
  advertencias: ["1 daño(s) no se pudieron estimar. Los totales no incluyen esos daños."],
  nota:
    "Los valores son aproximados y corresponden a estimaciones de referencia. El monto final depende de la inspección física del vehículo y de la cotización del establecimiento.",
};
