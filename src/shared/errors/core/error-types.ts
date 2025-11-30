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
  /** @deprecated move authFields somewhere else */
  readonly authFields?: readonly string[];
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}
