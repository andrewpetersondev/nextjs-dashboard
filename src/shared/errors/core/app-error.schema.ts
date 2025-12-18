export type Severity = "ERROR" | "WARN" | "INFO";

/**
 * Represents the distinct layers in an application where an error can occur.
 *
 * @remarks
 * This type is useful for categorizing errors based on the layer of the application architecture
 * they originate from, helping to organize error handling and debugging processes.
 *
 * @typeParam T - The specific error code or details that can be associated with the layer, if needed.
 */
export type AppErrorLayer =
  | "DOMAIN" // Business rules & domain logic
  | "API" // HTTP transport & API interface
  | "UI" // Presentation & UI components
  | "DB" // Database & Persistence
  | "SECURITY" // Authentication & Authorization
  | "VALIDATION" // Input validation
  | "INTERNAL"; // System, panic, & unexpected errors

/**
 * Schema representing the structure of an application-specific error.
 *
 * @remarks
 * This interface is used as a contract to define the properties of a standardized error
 * within the application. It includes metadata such as error description, layer, severity,
 * and whether the error is retryable.
 */
export interface AppErrorSchema {
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}
