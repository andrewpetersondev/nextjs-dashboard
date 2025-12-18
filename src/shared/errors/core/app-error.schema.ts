export const APP_ERROR_SEVERITIES = ["ERROR", "INFO", "WARN"] as const;

export type Severity = (typeof APP_ERROR_SEVERITIES)[number];

/**
 * Represents the distinct layers in an application where an error can occur.
 *
 * @remarks
 * This type is useful for categorizing errors based on the layer of the application architecture
 * they originate from, helping to organize error handling and debugging processes.
 */
export const APP_ERROR_LAYERS = [
  "API",
  "DB",
  "DOMAIN",
  "INTERNAL",
  "SECURITY",
  "UI",
  "VALIDATION",
] as const;

export type AppErrorLayer = (typeof APP_ERROR_LAYERS)[number];

/**
 * Schema representing the structure of an application-specific error.
 *
 * @remarks
 * This interface is the canonical contract for all error-code definitions.
 * It is intentionally transport-agnostic and does not include HTTP status or
 * protocol-specific information.
 */
export interface AppErrorSchema {
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}
