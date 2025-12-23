export const APP_ERROR_SEVERITIES = ["ERROR", "INFO", "WARN"] as const;

export type Severity = (typeof APP_ERROR_SEVERITIES)[number];

export const APP_ERROR_SEVERITY: Readonly<{
  ERROR: Severity;
  INFO: Severity;
  WARN: Severity;
}> = {
  ERROR: "ERROR",
  INFO: "INFO",
  WARN: "WARN",
} as const;
