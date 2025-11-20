// src/shared/errors/error-codes.ts

export type Severity = "error" | "warn" | "info";

export interface AppErrorDefinition {
  readonly authFields?: readonly string[];
  readonly category: string;
  readonly description: string;
  readonly httpStatus: number;
  readonly retryable: boolean;
  readonly severity: Severity;
}

export const APP_ERROR_MAP = {
  conflict: {
    authFields: ["email", "username"] as const,
    category: "client",
    description: "Resource state conflict",
    httpStatus: 409,
    retryable: false,
    severity: "warn",
  },
  database: {
    category: "infrastructure",
    description: "Database operation failed",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  forbidden: {
    category: "client",
    description: "Operation not allowed",
    httpStatus: 403,
    retryable: false,
    severity: "warn",
  },
  infrastructure: {
    category: "infrastructure",
    description: "Infrastructure failure",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  integrity: {
    category: "server",
    description: "Data integrity violation",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  invalidCredentials: {
    authFields: ["email", "username", "password"] as const,
    category: "client",
    description: "validation.failed",
    httpStatus: 422,
    retryable: false,
    severity: "warn",
  },
  missingFields: {
    category: "server",
    description: "missing.required.fields",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  notFound: {
    category: "client",
    description: "Resource not found",
    httpStatus: 404,
    retryable: false,
    severity: "info",
  },
  parse: {
    category: "client",
    description: "Parsing input failed",
    httpStatus: 400,
    retryable: false,
    severity: "warn",
  },
  unauthorized: {
    authFields: ["email", "password"] as const,
    category: "client",
    description: "Invalid credentials",
    httpStatus: 401,
    retryable: false,
    severity: "warn",
  },
  unexpected: {
    category: "server",
    description: "An unexpected error occurred",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  unknown: {
    category: "server",
    description: "An unknown error occurred",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  validation: {
    authFields: ["email", "username", "password"] as const,
    category: "client",
    description: "Validation failed",
    httpStatus: 422,
    retryable: false,
    severity: "warn",
  },
} as const satisfies Record<string, AppErrorDefinition>;

export type AppErrorKey = keyof typeof APP_ERROR_MAP;
export type AppErrorMeta = (typeof APP_ERROR_MAP)[AppErrorKey];
export type AppCode = AppErrorKey;

export const APP_CODE_TO_META: Record<AppCode, AppErrorMeta> = APP_ERROR_MAP;

/**
 * Return metadata for a code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
