export const ERROR_MESSAGES = {
  ANALISIS_ERROR: "No se pudo analizar la foto. Intenta de nuevo.",
} as const;

// tipo_dano que devuelve el backend -> texto para mostrar
export const NOMBRE_TIPO_DANO: Record<string, string> = {
  abolladura: "Abolladura",
  rayon: "Rayón",
  grieta: "Grieta",
  vidrio_roto: "Vidrio roto",
  luz_rota: "Luz rota",
  llanta_baja: "Llanta baja",
};

export const NOMBRE_SEVERIDAD: Record<string, string> = {
  leve: "Leve",
  moderado: "Moderado",
  grave: "Grave",
};

export const COLOR_SEVERIDAD: Record<string, "success" | "warning" | "error"> = {
  leve: "success",
  moderado: "warning",
  grave: "error",
};

// tipo_dano que detecta la foto -> etiqueta de daño de la cotización (ETIQUETAS_DANOS).
// Se usa solo para SUGERIR; el usuario decide qué etiqueta activar en cada pieza.
// null = no hay etiqueta equivalente en la cotización.
export const ETIQUETA_COTIZACION: Record<string, string | null> = {
  rayon: "Rayon",
  abolladura: "Abolladura",
  grieta: "Rotura",
  vidrio_roto: "Rotura",
  luz_rota: "Rotura",
  llanta_baja: null,
};

// Piezas que el estimador de precios (POST /api/v1/cotizaciones/estimar) sabe cotizar.
export const PIEZAS_ESTIMABLES = [
  "Bumper delantero",
  "Bumper trasero",
  "Guardabarros",
  "Puerta",
  "Capó",
] as const;

// Daños que ya identifican su propia pieza: no hace falta que el usuario la asigne.
// Hoy el catálogo de estimación no tiene precios para estas piezas.
export const PIEZA_PROPIA: Record<string, string> = {
  vidrio_roto: "Vidrio",
  luz_rota: "Luz",
  llanta_baja: "Llanta",
};

export type Establecimiento = "economico" | "multimarca" | "concesionario";

export const ESTABLECIMIENTOS: { valor: Establecimiento; nombre: string; descripcion: string }[] = [
  { valor: "economico", nombre: "Económico", descripcion: "Talleres de barrio con repuestos alternativos" },
  { valor: "multimarca", nombre: "Multimarca", descripcion: "Talleres especializados en varias marcas" },
  { valor: "concesionario", nombre: "Concesionario", descripcion: "Taller oficial de la marca con repuestos originales" },
];
