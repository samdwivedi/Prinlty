export const USER_ROLES = {
  STUDENT: "STUDENT",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_COLORS = {
  STUDENT: "info",
  OPERATOR: "warning",
  ADMIN: "danger",
} as const;

export const JOB_STATUS = {
  PENDING: "PENDING",
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

export const JOB_STATUS_COLORS = {
  PENDING: "warning",
  QUEUED: "info",
  PROCESSING: "primary",
  COMPLETED: "success",
  CANCELLED: "secondary",
  FAILED: "danger",
} as const;

export const PRINTER_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  BUSY: "BUSY",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type PrinterStatus = typeof PRINTER_STATUS[keyof typeof PRINTER_STATUS];
