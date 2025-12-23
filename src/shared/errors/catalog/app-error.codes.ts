import { APP_ERROR_LAYER } from "@/shared/errors/core/app-error.layers";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";
import { APP_ERROR_SEVERITY } from "@/shared/errors/core/app-error.severity";

/**
 * Canonical error code definitions organized by logical layer.
 *
 * Each error code defines:
 * - description: Human-readable description for logging/debugging
 * - layer: Logical application layer where this error originates
 * - retryable: Whether the operation that caused this error can be retried
 * - severity: Log level for this error type
 */
export const API_ERRORS = {
  conflict: {
    description: "Resource state conflict",
    layer: APP_ERROR_LAYER.API,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  not_found: {
    description: "Resource not found",
    layer: APP_ERROR_LAYER.API,
    retryable: false,
    severity: APP_ERROR_SEVERITY.INFO,
  },
  parse: {
    description: "Parsing input failed",
    layer: APP_ERROR_LAYER.API,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<"conflict" | "not_found" | "parse", AppErrorSchema>;

export const AUTH_ERRORS = {
  forbidden: {
    description: "Operation not allowed",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  invalid_credentials: {
    description: "Invalid credentials",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  unauthorized: {
    description: "Unauthorized",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<
  "forbidden" | "invalid_credentials" | "unauthorized",
  AppErrorSchema
>;

export const DOMAIN_ERRORS = {
  application_error: {
    description: "Application logic error",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  domain_error: {
    description: "Domain logic error",
    layer: APP_ERROR_LAYER.DOMAIN,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  presentation_error: {
    description: "Presentation layer error",
    layer: APP_ERROR_LAYER.UI,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
} as const satisfies Record<
  "application_error" | "domain_error" | "presentation_error",
  AppErrorSchema
>;

export const INFRASTRUCTURE_ERRORS = {
  database: {
    description: "Database operation failed",
    layer: APP_ERROR_LAYER.DB,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  integrity: {
    description: "Data integrity violation",
    layer: APP_ERROR_LAYER.DB,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
} as const satisfies Record<
  "database" | "infrastructure" | "integrity",
  AppErrorSchema
>;

export const SYSTEM_ERRORS = {
  unexpected: {
    description: "An unexpected error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  unknown: {
    description: "An unknown error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
} as const satisfies Record<"unexpected" | "unknown", AppErrorSchema>;

export const VALIDATION_ERRORS = {
  missing_fields: {
    description: "Required fields are missing",
    layer: APP_ERROR_LAYER.VALIDATION,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  validation: {
    description: "Validation failed",
    layer: APP_ERROR_LAYER.VALIDATION,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<"missing_fields" | "validation", AppErrorSchema>;
