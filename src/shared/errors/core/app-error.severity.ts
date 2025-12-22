/**
 * Represents the distinct severities used to classify application errors.
 *
 * @remarks
 * This type helps standardize log levels for errors across the codebase.
 */
export const APP_ERROR_SEVERITIES = ["ERROR", "INFO", "WARN"] as const;

/**
 * Literal union of all supported error severities.
 */
export type Severity = (typeof APP_ERROR_SEVERITIES)[number];

/**
 * Object map of error severities for stable, property-based access.
 *
 * @remarks
 * Prefer using this object to reference severities (e.g., `APP_ERROR_SEVERITY.ERROR`)
 * to avoid stringly-typed values and enable auto-complete.
 */
export const APP_ERROR_SEVERITY: Readonly<{
  ERROR: Severity;
  INFO: Severity;
  WARN: Severity;
}> = {
  ERROR: "ERROR",
  INFO: "INFO",
  WARN: "WARN",
} as const;
