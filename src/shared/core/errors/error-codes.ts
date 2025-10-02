/**
 * Canonical application error codes and their metadata.
 *
 * Single source of truth:
 * - Add new codes here (stable UPPER\_SNAKE\_CASE).
 * - Other modules (factories, mappers, logging, API shaping) derive from this.
 *
 * Rules:
 * - Do not remove or repurpose a code once in use (add a new one instead).
 * - Keep descriptions user-safe (no internal implementation detail or secrets).
 */
export const ERROR_CODES = {
  BAD_REQUEST: {
    category: "client",
    description: "Malformed or invalid request",
    httpStatus: 400,
    retryable: false,
    severity: "warn",
  },
  CONFIG: {
    category: "server",
    description: "Server configuration error",
    httpStatus: 500,
    retryable: false,
    severity: "critical",
  },
  CONFLICT: {
    category: "client",
    description: "Resource state conflict",
    httpStatus: 409,
    retryable: false,
    severity: "warn",
  },
  DEPENDENCY_FAILURE: {
    category: "dependency",
    description: "Upstream dependency failed",
    httpStatus: 502,
    retryable: true,
    severity: "error",
  },
  FORBIDDEN: {
    category: "client",
    description: "Operation not allowed",
    httpStatus: 403,
    retryable: false,
    severity: "warn",
  },
  INTEGRITY: {
    category: "server",
    description: "Data integrity violation",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  INTERNAL: {
    category: "server",
    description: "Internal server error",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  NOT_FOUND: {
    category: "client",
    description: "Resource not found",
    httpStatus: 404,
    retryable: false,
    severity: "info",
  },
  PARSE: {
    category: "client",
    description: "Parsing input failed",
    httpStatus: 400,
    retryable: false,
    severity: "warn",
  },
  PRECONDITION_FAILED: {
    category: "client",
    description: "Precondition not met",
    httpStatus: 412,
    retryable: false,
    severity: "warn",
  },
  RATE_LIMITED: {
    category: "client",
    description: "Too many requests",
    httpStatus: 429,
    retryable: true,
    severity: "warn",
  },
  RETRY_EXHAUSTED: {
    category: "server",
    description: "All retry attempts failed",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  SERIALIZATION: {
    category: "server",
    description: "Serialization failure",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  TIMEOUT: {
    category: "infrastructure",
    description: "Operation timed out",
    httpStatus: 504,
    retryable: true,
    severity: "error",
  },
  UNAUTHORIZED: {
    category: "client",
    description: "Authentication required or failed",
    httpStatus: 401,
    retryable: false,
    severity: "warn",
  },
  UNAVAILABLE: {
    category: "infrastructure",
    description: "Service temporarily unavailable",
    httpStatus: 503,
    retryable: true,
    severity: "error",
  },
  UNKNOWN: {
    category: "server",
    description: "An unknown error occurred",
    httpStatus: 500,
    retryable: false,
    severity: "error",
  },
  VALIDATION: {
    category: "client",
    description: "Input validation failed",
    httpStatus: 422,
    retryable: false,
    severity: "warn",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export type ErrorCodeMeta = (typeof ERROR_CODES)[ErrorCode];

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
