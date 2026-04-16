export const FILTER_DEFAULT = 'All';

export const REPORT_STATUS = {
  WAITING: 'Waiting',
  REPAIRED: 'Repaired',
  CANCELLED: 'Cancelled',
} as const;

type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
type PillColor = 'success' | 'warning' | 'error';

export const STATUS_PILL_COLOR: { [key in ReportStatus]: PillColor } = {
  [REPORT_STATUS.REPAIRED]: 'success',
  [REPORT_STATUS.WAITING]: 'warning',
  [REPORT_STATUS.CANCELLED]: 'error',
};