import type { Severidad, TipoEstablecimiento } from "@/app/types/cotizacionResultado";

/** Tipos de daño que devuelve el modelo -> texto para el usuario. */
export const ETIQUETAS_DANO: Record<string, string> = {
  grieta: "Grieta",
  abolladura: "Abolladura",
  vidrio_roto: "Vidrio roto",
  luz_rota: "Luz rota",
  rayon: "Rayón",
  llanta_baja: "Llanta baja",
};

export const ETIQUETAS_SEVERIDAD: Record<Severidad, string> = {
  leve: "Leve",
  moderado: "Moderado",
  grave: "Grave",
};

export const COLOR_SEVERIDAD: Record<Severidad, "success" | "warning" | "error"> = {
  leve: "success",
  moderado: "warning",
  grave: "error",
};

/** Piezas con precio en el catálogo del backend (PIEZAS_ESTIMABLES). */
export const PIEZAS_ESTIMABLES = [
  "Bumper delantero",
  "Bumper trasero",
  "Guardabarros",
  "Puerta",
  "Capó",
] as const;

export const ESTABLECIMIENTOS: { clave: TipoEstablecimiento; etiqueta: string; descripcion: string }[] = [
  { clave: "economico", etiqueta: "Económico", descripcion: "Talleres de barrio y servicios de bajo costo" },
  { clave: "multimarca", etiqueta: "Multimarca", descripcion: "Talleres especializados en varias marcas" },
  { clave: "concesionario", etiqueta: "Concesionario", descripcion: "Servicio oficial de la marca" },
];

export const MAX_MB = 10;
