// src/server/auth/logging/auth-logging.types.ts
import "server-only";
import type { LogOperationMetadata } from "@/shared/infrastructure/logging/core/logger.types";

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
  operationName: AuthOperation;
  layer: AuthLogLayer;
  kind: AuthLogKind;
  operationIdentifiers?: Record<string, string | number>;
  error?: unknown;
  errorSource?: AuthErrorSource;
  details?: Record<string, unknown>;
}

/**
 * Convenience alias – currently there is a single auth log payload shape.
 * If you ever need to truly specialize by layer, you can reintroduce
 * a discriminated union here without changing most call sites.
 */
export type AuthLogPayload = AuthLogBase;
