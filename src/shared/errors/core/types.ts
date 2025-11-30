export type Severity = "ERROR" | "WARN" | "INFO";

/**
 * These layers do not seem to be well-structured. I thought the layers would be more like this: UI, API, DB, ACTION, SERVICE, REPO, DAL, etc.)
 * - CORE, AUTH, VALIDATION,  DOMAIN, HTTP, seem to be the most out of place.
 * - The biggest issue is how this is used in BaseError. maybe i should create another type for the BaseError?
 */
export type AppErrorLayer =
  | "CORE"
  | "INFRA"
  | "DOMAIN"
  | "APPLICATION"
  | "PRESENTATION"
  | "HTTP"
  | "AUTH"
  | "VALIDATION";

export interface AppErrorDefinition {
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}
