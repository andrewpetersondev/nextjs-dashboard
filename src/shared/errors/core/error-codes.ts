// src/shared/errors/error-codes.ts

export type Severity = "ERROR" | "WARN" | "INFO";

/**
 * Logical ownership of an error code.
 *
 * - "CORE"       → generic, cross-cutting server errors (unexpected, unknown, etc.)
 * - "INFRA"      → infrastructure / integration boundaries (database, infrastructure, integrity)
 * - "HTTP"       → HTTP/client semantics (notFound, forbidden, conflict, parse)
 * - "AUTH"       → authentication / authorization semantics (invalidCredentials, unauthorized)
 * - "VALIDATION" → generic input validation semantics (422-style validation failures)
 */
export type AppErrorLayer = "CORE" | "INFRA" | "HTTP" | "AUTH" | "VALIDATION";

export interface AppErrorDefinition {
  /**
   * Logical ownership of this error code (INFRA, AUTH, VALIDATION, etc.).
   */
  readonly layer: AppErrorLayer;
  /**
   * Optional set of auth-related fields a UI might highlight for this error.
   * Only meaningful for certain auth/validation codes.
   */
  readonly authFields?: readonly string[];
  /**
   * Human-readable, canonical description for this error code.
   *
   * This is domain-facing; HTTP or transport layers may override the
   * final message shown to end users.
   */
  readonly description: string;

  /**
   * Should an automated caller reasonably retry this operation?
   */
  readonly retryable: boolean;

  /**
   * Diagnostic severity for this code.
   */
  readonly severity: Severity;
}

/**
 * Canonical, transport-agnostic error code registry.
 *
 * NOTE: No HTTP status, no "client/server/infrastructure" responsibility here.
 * Those live in adapter layers (e.g. HTTP, message-bus) that map from codes.
 */
export const APP_ERROR_MAP = {
  // HTTP/client semantics (domain meaning: conflict in state)
  conflict: {
    authFields: ["email", "username"] as const,
    description: "Resource state conflict",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  },

  // Infrastructure / integration boundaries
  database: {
    description: "Database operation failed",
    layer: "INFRA",
    retryable: false,
    severity: "ERROR",
  },
  forbidden: {
    description: "Operation not allowed",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: "INFRA",
    retryable: false,
    severity: "ERROR",
  },
  integrity: {
    description: "Data integrity violation",
    layer: "INFRA",
    retryable: false,
    severity: "ERROR",
  },
  invalidCredentials: {
    authFields: ["email", "username", "password"] as const,
    description: "Invalid credentials",
    layer: "AUTH",
    retryable: false,
    severity: "WARN",
  },

  // Core/server errors
  missingFields: {
    description: "missing.required.fields",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  },
  notFound: {
    description: "Resource not found",
    layer: "HTTP",
    retryable: false,
    severity: "INFO",
  },
  parse: {
    description: "Parsing input failed",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  },

  // Auth semantics (distinct from generic validation)
  unauthorized: {
    authFields: ["email", "password"] as const,
    description: "Invalid credentials",
    layer: "AUTH",
    retryable: false,
    severity: "WARN",
  },
  unexpected: {
    description: "An unexpected error occurred",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  },
  unknown: {
    description: "An unknown error occurred",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  },

  // Generic validation semantics
  validation: {
    description: "Validation failed",
    layer: "VALIDATION",
    retryable: false,
    severity: "WARN",
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

/**
 * Return the logical layer for a given error code.
 */
export function getAppErrorLayer(code: AppErrorKey): AppErrorLayer {
  return APP_ERROR_MAP[code].layer;
}

/**
 * Layer-based helpers for branching error-handling logic.
 *
 * These are intentionally shallow predicates over the canonical metadata.
 */

export function isInfraErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "INFRA";
}

export function isCoreErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "CORE";
}

export function isHttpErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "HTTP";
}

export function isAuthErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "AUTH";
}

export function isValidationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "VALIDATION";
}
