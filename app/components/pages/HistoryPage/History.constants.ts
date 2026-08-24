export enum ReportStatus {
  WAITING = "En espera",
  REPAIRED = "Reparado",
  CANCELLED = "Cancelado",
}

export const FILTER_DEFAULT = "Todos";

// Mapeo con nombres de variantes estándar (útil si Pill usa 'warning', 'success', etc.)
export const STATUS_PILL_COLOR: Record<ReportStatus, string> = {
  [ReportStatus.WAITING]: "warning",
  [ReportStatus.REPAIRED]: "success",
  [ReportStatus.CANCELLED]: "danger",
};

export const STATUS_MAP: Record<string, ReportStatus> = {
  "En espera": ReportStatus.WAITING,
  "Reparado": ReportStatus.REPAIRED,
  "Cancelado": ReportStatus.CANCELLED,
  "Pendiente": ReportStatus.WAITING,
  "Completado": ReportStatus.REPAIRED,
};

export const ERROR_MESSAGES = {
  LOAD_ERROR: "Ocurrió un error al cargar el historial de reportes.",
  NO_REPORTS: "No se encontraron reportes disponibles.",
  UNKNOWN_VEHICLE: "Vehículo desconocido",
  NO_DESCRIPTION: "Sin descripción",
  DEFAULT_PLATE: "---",
} as const;

export const LOCALE_CONFIG = {
  CODE: "es-CO",
} as const;