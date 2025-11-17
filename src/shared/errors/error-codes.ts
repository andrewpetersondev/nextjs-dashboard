/**
 * Canonical application error codes and their metadata.
 *
 * Single source of truth:
 * - Add new codes here (stable UPPER_SNAKE_CASE).
 * - Other modules (factories, mappers, logging, API shaping) derive from this.
 *
 * Rules:
 * - Do not remove or repurpose a code once in use (add a new one instead).
 * - Keep descriptions user-safe (no internal implementation detail or secrets).
 */

export const ERROR_CODES = {
  conflict: {
    authFields: ["email", "username"] as const,
    category: "client",
    description: "Resource state conflict",
    httpStatus: 409,
    name: "conflict",
    retryable: false,
    severity: "warn",
  },
  database: {
    category: "infrastructure",
    description: "Database operation failed",
    httpStatus: 500,
    name: "database",
    retryable: false,
    severity: "error",
  },
  forbidden: {
    category: "client",
    description: "Operation not allowed",
    httpStatus: 403,
    name: "forbidden",
    retryable: false,
    severity: "warn",
  },
  infrastructure: {
    category: "infrastructure",
    description: "Infrastructure failure",
    httpStatus: 500,
    name: "infrastructure",
    retryable: false,
    severity: "error",
  },
  integrity: {
    category: "server",
    description: "Data integrity violation",
    httpStatus: 500,
    name: "integrity",
    retryable: false,
    severity: "error",
  },
  invalidCredentials: {
    authFields: ["email", "username", "password"] as const,
    category: "client",
    description: "validation.failed",
    httpStatus: 422,
    name: "invalidCredentials",
    retryable: false,
    severity: "warn",
  },
  missingFields: {
    category: "server",
    description: "missing.required.fields",
    httpStatus: 500,
    name: "missingFields",
    retryable: false,
    severity: "error",
  },
  notFound: {
    category: "client",
    description: "Resource not found",
    httpStatus: 404,
    name: "notFound",
    retryable: false,
    severity: "info",
  },
  parse: {
    category: "client",
    description: "Parsing input failed",
    httpStatus: 400,
    name: "parse",
    retryable: false,
    severity: "warn",
  },
  unauthorized: {
    authFields: ["email", "password"] as const,
    category: "client",
    description: "Invalid credentials",
    httpStatus: 401,
    name: "unauthorized",
    retryable: false,
    severity: "warn",
  },
  unexpected: {
    category: "server",
    description: "An unexpected error occurred",
    httpStatus: 500,
    name: "unexpected",
    retryable: false,
    severity: "error",
  },
  unknown: {
    category: "server",
    description: "An unknown error occurred",
    httpStatus: 500,
    name: "unknown",
    retryable: false,
    severity: "error",
  },

  validation: {
    authFields: ["email", "username", "password"] as const,
    category: "client",
    description: "Validation failed",
    httpStatus: 422,
    name: "validation",
    retryable: false,
    severity: "warn",
  },
} as const;

export type Category = ErrorCodeMeta["category"];

export type ErrorCode = keyof typeof ERROR_CODES;

export type ErrorCodeMeta = (typeof ERROR_CODES)[ErrorCode];

// Derive a stable Severity union from metadata values
export type Severity = ErrorCodeMeta["severity"];

/**
 * Return metadata for a code (throws if invalid in strict usage contexts).
 */
export function getErrorCodeMeta(code: ErrorCode): ErrorCodeMeta {
  return ERROR_CODES[code];
}

/**
 * Safe lookup returning undefined for unknown inputs (e.g. external/raw sources).
 */
export function tryGetErrorCodeMeta(code: string): ErrorCodeMeta | undefined {
  return (ERROR_CODES as Record<string, ErrorCodeMeta | undefined>)[code];
}

/**
 * Narrow an arbitrary string to ErrorCode if present.
 */
export function isErrorCode(code: string): code is ErrorCode {
  return Object.hasOwn(ERROR_CODES, code);
}

/**
 * List all canonical error codes.
 */
export const ALL_ERROR_CODES: readonly ErrorCode[] = Object.freeze(
  Object.keys(ERROR_CODES) as ErrorCode[],
);
