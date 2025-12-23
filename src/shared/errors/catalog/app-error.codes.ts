import { APP_ERROR_LAYER } from "@/shared/errors/core/app-error.layers";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";
import { APP_ERROR_SEVERITY } from "@/shared/errors/core/app-error.severity";

export const APP_ERROR_DEFINITIONS = {
  application_error: {
    description: "Application logic error",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  conflict: {
    description: "Resource state conflict",
    layer: APP_ERROR_LAYER.API,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  database: {
    description: "Database operation failed",
    layer: APP_ERROR_LAYER.POSTGRES,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  domain_error: {
    description: "Domain logic error",
    layer: APP_ERROR_LAYER.DOMAIN,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  forbidden: {
    description: "Operation not allowed",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: APP_ERROR_LAYER.INTERNAL,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  integrity: {
    description: "Data integrity violation",
    layer: APP_ERROR_LAYER.POSTGRES,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  invalid_credentials: {
    description: "Invalid credentials",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  missing_fields: {
    description: "Required fields are missing",
    layer: APP_ERROR_LAYER.VALIDATION,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
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
  presentation_error: {
    description: "Presentation layer error",
    layer: APP_ERROR_LAYER.UI,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  unauthorized: {
    description: "Unauthorized",
    layer: APP_ERROR_LAYER.SECURITY,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
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
  validation: {
    description: "Validation failed",
    layer: APP_ERROR_LAYER.VALIDATION,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<string, AppErrorSchema>;
