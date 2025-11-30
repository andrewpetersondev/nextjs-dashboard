import type { AppErrorKey } from "@/shared/errors/registry/error-code.registry";

export type HttpResponsibility = "client" | "server" | "infrastructure";

export interface HttpErrorDefinition {
  readonly status: number;
  readonly responsibility: HttpResponsibility;
}

/**
 * HTTP transport mapping: AppErrorKey → HTTP status + responsibility.
 *
 * This is intentionally separate from the core APP_ERROR_MAP to keep
 * AppError transport-agnostic.
 */
export const HTTP_ERROR_MAP: Record<AppErrorKey, HttpErrorDefinition> = {
  applicationError: { responsibility: "server", status: 500 },
  conflict: { responsibility: "client", status: 409 },
  database: { responsibility: "infrastructure", status: 500 },
  domainError: { responsibility: "server", status: 500 },
  forbidden: { responsibility: "client", status: 403 },
  infrastructure: { responsibility: "infrastructure", status: 500 },
  integrity: { responsibility: "infrastructure", status: 500 },
  invalidCredentials: { responsibility: "client", status: 422 },
  missingFields: { responsibility: "client", status: 422 },
  notFound: { responsibility: "client", status: 404 },
  parse: { responsibility: "client", status: 400 },
  presentationError: { responsibility: "server", status: 500 },
  unauthorized: { responsibility: "client", status: 401 },
  unexpected: { responsibility: "server", status: 500 },
  unknown: { responsibility: "server", status: 500 },
  validation: { responsibility: "client", status: 422 },
} as const;
