export type Severity = "ERROR" | "WARN" | "INFO";

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
