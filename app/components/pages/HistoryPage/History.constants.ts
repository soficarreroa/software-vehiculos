export const FILTER_DEFAULT = 'Todos';

export const REPORT_STATUS = {
  WAITING: 'En espera',
  REPAIRED: 'Reparado',
  CANCELLED: 'Cancelado',
} as const;

export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
export type PillColor = 'success' | 'warning' | 'error';

export const STATUS_PILL_COLOR: { [key in ReportStatus]: PillColor } = {
  [REPORT_STATUS.REPAIRED]: 'success',
  [REPORT_STATUS.WAITING]: 'warning',
  [REPORT_STATUS.CANCELLED]: 'error',
};

// Configuraciones de paginación
export const ROWS_PER_PAGE = 10;

// Mensajes estáticos
export const ERROR_MESSAGES = {
  LOAD_ERROR: 'Error cargando el historial',
  NO_REPORTS: 'No hay informes disponibles',
  DOWNLOAD_ERROR: 'Error al descargar el PDF',
} as const;