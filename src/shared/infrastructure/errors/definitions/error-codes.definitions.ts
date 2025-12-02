import type { AppErrorDefinition } from "@/shared/infrastructure/errors/core/error-definition.types";

/**
 * Canonical error code definitions organized by logical layer.
 *
 * Each error code defines:
 * - description: Human-readable description for logging/debugging
 * - layer: Logical application layer where this error originates
 * - retryable: Whether the operation that caused this error can be retried
 * - severity: Log level for this error type
 */

// ─────────────────────────────────────────────────────────────
// API / HTTP Transport
// ─────────────────────────────────────────────────────────────

export const API_ERRORS = {
  conflict: {
    description: "Resource state conflict",
    layer: "API",
    retryable: false,
    severity: "WARN",
  },
  notFound: {
    description: "Resource not found",
    layer: "API",
    retryable: false,
    severity: "INFO",
  },
  parse: {
    description: "Parsing input failed",
    layer: "API",
    retryable: false,
    severity: "WARN",
  },
} as const satisfies Record<string, AppErrorDefinition>;

// ─────────────────────────────────────────────────────────────
// Authentication / Security
// ─────────────────────────────────────────────────────────────

export const AUTH_ERRORS = {
  forbidden: {
    description: "Operation not allowed",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  },
  invalidCredentials: {
    description: "Invalid credentials",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  },
  unauthorized: {
    description: "Unauthorized",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  },
} as const satisfies Record<string, AppErrorDefinition>;

// ─────────────────────────────────────────────────────────────
// Domain / Business Logic
// ─────────────────────────────────────────────────────────────

export const DOMAIN_ERRORS = {
  applicationError: {
    description: "Application logic error",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  },
  domainError: {
    description: "Domain logic error",
    layer: "DOMAIN",
    retryable: false,
    severity: "ERROR",
  },
  presentationError: {
    description: "Presentation layer error",
    layer: "UI",
    retryable: false,
    severity: "ERROR",
  },
} as const satisfies Record<string, AppErrorDefinition>;

// ─────────────────────────────────────────────────────────────
// Infrastructure / Database
// ─────────────────────────────────────────────────────────────

export const INFRASTRUCTURE_ERRORS = {
  database: {
    description: "Database operation failed",
    layer: "DB",
    retryable: true,
    severity: "ERROR",
  },
  infrastructure: {
    description: "Infrastructure failure",
    layer: "INTERNAL",
    retryable: true,
    severity: "ERROR",
  },
  integrity: {
    description: "Data integrity violation",
    layer: "DB",
    retryable: false,
    severity: "ERROR",
  },
} as const satisfies Record<string, AppErrorDefinition>;

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

export const VALIDATION_ERRORS = {
  missingFields: {
    description: "Required fields are missing",
    layer: "VALIDATION",
    retryable: false,
    severity: "ERROR",
  },
  validation: {
    description: "Validation failed",
    layer: "VALIDATION",
    retryable: false,
    severity: "WARN",
  },
} as const satisfies Record<string, AppErrorDefinition>;

// ─────────────────────────────────────────────────────────────
// System / Catch-all
// ─────────────────────────────────────────────────────────────

export const SYSTEM_ERRORS = {
  unexpected: {
    description: "An unexpected error occurred",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  },
  unknown: {
    description: "An unknown error occurred",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  },
} as const satisfies Record<string, AppErrorDefinition>;
