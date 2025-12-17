export type Severity = "ERROR" | "WARN" | "INFO";

/**
 * Logical layers of the application where errors occur.
 */
export type AppErrorLayer =
  | "DOMAIN" // Business rules & domain logic
  | "API" // HTTP transport & API interface
  | "UI" // Presentation & UI components
  | "DB" // Database & Persistence
  | "SECURITY" // Authentication & Authorization
  | "VALIDATION" // Input validation
  | "INTERNAL"; // System, panic, & unexpected errors

export interface AppErrorDefinition {
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}
