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
