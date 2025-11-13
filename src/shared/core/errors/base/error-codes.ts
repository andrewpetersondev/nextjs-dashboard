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
  badRequest: {
    category: "client",
    description: "Malformed or invalid request",
    httpStatus: 400,
    name: "badRequest",
    retryable: false,
    severity: "warn",
  },
  cache: {
    category: "infrastructure",
    description: "Cache operation failed",
    httpStatus: 500,
    name: "cache",
    retryable: false,
    severity: "error",
  },
  config: {
    category: "server",
    description: "Server configuration error",
    httpStatus: 500,
    name: "config",
    retryable: false,
    severity: "critical",
  },
  conflict: {
    authFields: ["email", "username"] as const,
    category: "client",
    description: "Resource state conflict",
    httpStatus: 409,
    name: "conflict",
    retryable: false,
    severity: "warn",
  },
  crypto: {
    category: "infrastructure",
    description: "Cryptographic operation failed",
    httpStatus: 500,
    name: "crypto",
    retryable: false,
    severity: "error",
  },
  database: {
    category: "infrastructure",
    description: "Database operation failed",
    httpStatus: 500,
    name: "database",
    retryable: false,
    severity: "error",
  },
  dependencyFailure: {
    category: "dependency",
    description: "Upstream dependency failed",
    httpStatus: 502,
    name: "dependencyFailure",
    retryable: true,
    severity: "error",
  },
  domainViolation: {
    category: "domain",
    description: "Business rule violation",
    httpStatus: 422,
    name: "domainViolation",
    retryable: false,
    severity: "warn",
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
  internal: {
    category: "server",
    description: "Internal server error",
    httpStatus: 500,
    name: "internal",
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
  preconditionFailed: {
    category: "client",
    description: "Precondition not met",
    httpStatus: 412,
    name: "preconditionFailed",
    retryable: false,
    severity: "warn",
  },
  rateLimited: {
    category: "client",
    description: "Too many requests",
    httpStatus: 429,
    name: "rateLimited",
    retryable: true,
    severity: "warn",
  },
  retryExhausted: {
    category: "server",
    description: "All retry attempts failed",
    httpStatus: 500,
    name: "retryExhausted",
    retryable: false,
    severity: "error",
  },
  serialization: {
    category: "server",
    description: "Serialization failure",
    httpStatus: 500,
    name: "serialization",
    retryable: false,
    severity: "error",
  },
  timeout: {
    category: "infrastructure",
    description: "Operation timed out",
    httpStatus: 504,
    name: "timeout",
    retryable: true,
    severity: "error",
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
  unavailable: {
    category: "infrastructure",
    description: "Service temporarily unavailable",
    httpStatus: 503,
    name: "unavailable",
    retryable: true,
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
