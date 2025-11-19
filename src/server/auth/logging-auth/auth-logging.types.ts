// src/server/auth/logging/auth-logging.types.ts
import "server-only";
import type { LogOperationMetadata } from "@/shared/logging/logger.types";

export type AuthLogLayer =
  | "action"
  | "service"
  | "infrastructure.repository"
  | "infrastructure.dal";

export type AuthOperation =
  | "login"
  | "signup"
  | "demoUser"
  | "demoUserCounter"
  | "withTransaction"
  | "insertUser"
  | "getUserByEmail"
  | "logout";

/**
 * Single, unified set of logical kinds across all layers.
 *
 * Layers may only use a subset in practice, but the envelope is the same.
 */
export type AuthLogKind =
  | "start"
  | "success"
  | "validation"
  | "failure"
  | "exception"
  | "auth-invariant"
  | "not_found"
  | "duplicate"
  | "error";

/**
 * Where an error originated, when applicable.
 */
export type AuthErrorSource =
  | "action"
  | "service"
  | "infrastructure.repository"
  | "infrastructure.dal"
  | "unknown";

/* ----------------------------- Base log shape ----------------------------- */

export interface AuthLogBase
  extends LogOperationMetadata,
    Record<string, unknown> {
  /** High-level auth operation (login/signup/...) */
  operationName: AuthOperation;
  /** Layer from which the log originates */
  layer: AuthLogLayer;
  /** Logical kind (start/success/error/etc.) */
  kind: AuthLogKind;
  /** Business identifiers (email, userId, etc.) */
  operationIdentifiers?: Record<string, string | number>;
  /**
   * Optional error payload (BaseError, safe error shape, or something else).
   * Only set when this log represents an error-ish condition.
   */
  error?: unknown;
  /**
   * Where the error came from. Useful when a higher layer logs an error
   * that originated from a lower layer (DAL, repo, etc.).
   */
  errorSource?: AuthErrorSource;
  /**
   * Layer- or operation-specific details (e.g. DAL pg metadata, validation info).
   */
  details?: Record<string, unknown>;
}

/**
 * Convenience alias – currently there is a single auth log payload shape.
 * If you ever need to truly specialize by layer, you can reintroduce
 * a discriminated union here without changing most call sites.
 */
export type AuthLogPayload = AuthLogBase;
