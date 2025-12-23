export const APP_ERROR_SEVERITY = {
  ERROR: "ERROR",
  INFO: "INFO",
  WARN: "WARN",
} as const;

export type AppErrorSeverity = keyof typeof APP_ERROR_SEVERITY;
