// src/shared/errors/error-codes.ts

export type Severity = "error" | "warn" | "info";

/**
 * Logical ownership of an error code.
 *
 * - "core"       → generic, cross-cutting server errors (unexpected, unknown, etc.)
 * - "infra"      → infrastructure / integration boundaries (database, infrastructure, integrity)
 * - "http"       → HTTP/client semantics (notFound, forbidden, conflict, parse)
 * - "auth"       → authentication / authorization semantics (invalidCredentials, unauthorized)
 * - "validation" → generic input validation semantics (422-style validation failures)
 */
export type AppErrorLayer = "core" | "infra" | "http" | "auth" | "validation";

export interface AppErrorDefinition {
  /**
   * Logical ownership of this error code (infra, auth, validation, etc.).
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
    layer: "http",
    retryable: false,
    severity: "warn",
  },

  // Infrastructure / integration boundaries
  database: {
    description: "Database operation failed",
    layer: "infra",
    retryable: false,
    severity: "error",
  },
  forbidden: {
    description: "Operation not allowed",
    layer: "http",
    retryable: false,
    severity: "warn",
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: "infra",
    retryable: false,
    severity: "error",
  },
  integrity: {
    description: "Data integrity violation",
    layer: "infra",
    retryable: false,
    severity: "error",
  },
  invalidCredentials: {
    authFields: ["email", "username", "password"] as const,
    description: "Invalid credentials",
    layer: "auth",
    retryable: false,
    severity: "warn",
  },

  // Core/server errors
  missingFields: {
    description: "missing.required.fields",
    layer: "core",
    retryable: false,
    severity: "error",
  },
  notFound: {
    description: "Resource not found",
    layer: "http",
    retryable: false,
    severity: "info",
  },
  parse: {
    description: "Parsing input failed",
    layer: "http",
    retryable: false,
    severity: "warn",
  },

  // Auth semantics (distinct from generic validation)
  unauthorized: {
    authFields: ["email", "password"] as const,
    description: "Invalid credentials",
    layer: "auth",
    retryable: false,
    severity: "warn",
  },
  unexpected: {
    description: "An unexpected error occurred",
    layer: "core",
    retryable: false,
    severity: "error",
  },
  unknown: {
    description: "An unknown error occurred",
    layer: "core",
    retryable: false,
    severity: "error",
  },

  // Generic validation semantics
  validation: {
    description: "Validation failed",
    layer: "validation",
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
  return getAppErrorLayer(code) === "infra";
}

export function isCoreErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "core";
}

export function isHttpErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "http";
}

export function isAuthErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "auth";
}

export function isValidationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "validation";
}
