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
 * Registry of all available Application Error Keys.
 * Using a constant object ensures type safety and IDE autocompletion across the project.
 */
export const APP_ERROR_KEYS = {
  conflict: "conflict",
  database: "database",
  forbidden: "forbidden",
  infrastructure: "infrastructure",
  integrity: "integrity",
  invalid_credentials: "invalid_credentials",
  missing_fields: "missing_fields",
  not_found: "not_found",
  parse: "parse",
  unauthorized: "unauthorized",
  unexpected: "unexpected",
  unknown: "unknown",
  validation: "validation",
} as const;

export type AppErrorKey = keyof typeof APP_ERROR_KEYS;

/**
 * Metadata associated with an error definition in the registry.
 */
export type AppErrorDefinition = AppErrorSchema & {
  readonly metadataSchema: z.ZodType;
};

/**
 * Single source of truth for Error Definitions and their Metadata Schemas.
 * Maps each AppErrorKey to its architectural layer, severity, and validation schema.
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const APP_ERROR_DEFINITIONS = {
  [APP_ERROR_KEYS.conflict]: {
    description: "Resource state conflict",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: ConflictErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  [APP_ERROR_KEYS.database]: {
    description: "Database operation failed",
    layer: APP_ERROR_LAYER.INFRASTRUCTURE,
    metadataSchema: InfrastructureErrorMetadataSchema,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.forbidden]: {
    description: "Operation not allowed",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  [APP_ERROR_KEYS.infrastructure]: {
    description: "Infrastructure failure",
    layer: APP_ERROR_LAYER.INFRASTRUCTURE,
    metadataSchema: InfrastructureErrorMetadataSchema,
    retryable: true,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.integrity]: {
    description: "Data integrity violation",
    layer: APP_ERROR_LAYER.INFRASTRUCTURE,
    metadataSchema: IntegrityErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.invalid_credentials]: {
    description: "Invalid credentials",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  [APP_ERROR_KEYS.missing_fields]: {
    description: "Required fields are missing",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: ValidationErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.not_found]: {
    description: "Resource not found",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.INFO,
  },
  [APP_ERROR_KEYS.parse]: {
    description: "Parsing input failed",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  [APP_ERROR_KEYS.unauthorized]: {
    description: "Unauthorized",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
  [APP_ERROR_KEYS.unexpected]: {
    description: "An unexpected error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: UnexpectedErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.unknown]: {
    description: "An unknown error occurred",
    layer: APP_ERROR_LAYER.INTERNAL,
    metadataSchema: UnknownErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.ERROR,
  },
  [APP_ERROR_KEYS.validation]: {
    description: "Validation failed",
    layer: APP_ERROR_LAYER.API,
    metadataSchema: ValidationErrorMetadataSchema,
    retryable: false,
    severity: APP_ERROR_SEVERITY.WARN,
  },
} as const satisfies Record<AppErrorKey, AppErrorDefinition>;

export type AppErrorMeta = (typeof APP_ERROR_DEFINITIONS)[AppErrorKey];

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
