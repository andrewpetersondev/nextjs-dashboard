import type { z } from "zod";
import { APP_ERROR_LAYER } from "@/shared/errors/core/app-error.layers";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";
import { APP_ERROR_SEVERITY } from "@/shared/errors/core/app-error.severity";
import {
  ConflictErrorMetadataSchema,
  InfrastructureErrorMetadataSchema,
  IntegrityErrorMetadataSchema,
  UnexpectedErrorMetadataSchema,
  UnknownErrorMetadataSchema,
  ValidationErrorMetadataSchema,
} from "@/shared/errors/core/error-metadata.value";

/**
 * Single source of truth for Error Definitions and their Metadata Schemas.
 * This prevents "Shotgun Surgery" when adding new error types.
 */
export const APP_ERROR_DEFINITIONS = {
  application_error: {
    description: "Application logic error",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  conflict: {
    description: "Resource state conflict",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: ConflictErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  database: {
    description: "Database operation failed",
    layer: APP_ERROR_LAYER.POSTGRES,
    metadataSchema: InfrastructureErrorMetadataSchema,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  domain_error: {
    description: "Domain logic error",
    layer: APP_ERROR_LAYER.DOMAIN,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  forbidden: {
    description: "Operation not allowed",
    layer: APP_ERROR_LAYER.SECURITY,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: InfrastructureErrorMetadataSchema,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  integrity: {
    description: "Data integrity violation",
    layer: APP_ERROR_LAYER.POSTGRES,
    metadataSchema: IntegrityErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  invalid_credentials: {
    description: "Invalid credentials",
    layer: APP_ERROR_LAYER.SECURITY,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  missing_fields: {
    description: "Required fields are missing",
    layer: APP_ERROR_LAYER.VALIDATION,
    metadataSchema: ValidationErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  not_found: {
    description: "Resource not found",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.INFO,
  },
  parse: {
    description: "Parsing input failed",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  presentation_error: {
    description: "Presentation layer error",
    layer: APP_ERROR_LAYER.UI,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  unauthorized: {
    description: "Unauthorized",
    layer: APP_ERROR_LAYER.SECURITY,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  unexpected: {
    description: "An unexpected error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: UnexpectedErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  unknown: {
    description: "An unknown error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  validation: {
    description: "Validation failed",
    layer: APP_ERROR_LAYER.VALIDATION,
    metadataSchema: ValidationErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<
  string,
  AppErrorSchema & { metadataSchema: z.ZodType }
>;

export type AppErrorKey = keyof typeof APP_ERROR_DEFINITIONS;

export type AppErrorMeta = (typeof APP_ERROR_DEFINITIONS)[AppErrorKey];

export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(Object.keys(APP_ERROR_DEFINITIONS).map((k) => [k, k])),
) as { [K in AppErrorKey]: K };

export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_DEFINITIONS[code];
}

/**
 * Automatically derived mapping of Metadata types by Error Key.
 */
export type AppErrorMetadataValueByCode = {
  [K in AppErrorKey]: z.infer<
    (typeof APP_ERROR_DEFINITIONS)[K]["metadataSchema"]
  >;
};
