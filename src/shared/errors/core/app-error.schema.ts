export const APP_ERROR_SEVERITIES = ["ERROR", "INFO", "WARN"] as const;

/**
 * Literal union of all supported error severities.
 */
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

/**
 * Literal union of all supported application layers.
 */
export type AppErrorLayer = (typeof APP_ERROR_LAYERS)[number];

/**
 * Schema representing the structure of an application-specific error.
 *
 * @remarks
 * This contract is transport-agnostic and mirrors the registry definition so changes stay in sync.
 */
export type AppErrorSchema = Readonly<{
  description: string;
  layer: AppErrorLayer;
  retryable: boolean;
  severity: Severity;
}>;
