// src/server/auth/logging/auth-logging.types.ts
import "server-only";

export type AuthLogLayer =
  | "action"
  | "service"
  | "infrastructure.repository"
  | "infrastructure.dal";

export type AuthOperation =
  | "login"
  | "signup"
  | "demoUser"
  | "withTransaction"
  | "insertUser"
  | "getUserByEmail"
  | "logout";

/**
 * Common `kind` values used across layers.
 * Layer-specific unions below narrow these further.
 */
export type AuthLogKindCommon =
  | "start"
  | "success"
  | "validation"
  | "exception"
  | "auth-invariant"
  | "not_found"
  | "duplicate";

/* -------------------------- Layer-specific kinds -------------------------- */

export type AuthActionKind = "start" | "validation" | "success" | "failure";

export type AuthServiceKind =
  | "validation"
  | "auth-invariant"
  | "success"
  | "exception";

export type AuthRepoKind = "start" | "success" | "exception" | "not_found";

export type AuthDalKind = "success" | "not_found" | "duplicate" | "error";

/* ----------------------------- Base log shape ----------------------------- */

export interface AuthLogBase {
  /** High-level auth operation (login/signup/...) */
  operation: AuthOperation;
  /** Layer from which the log originates */
  layer: AuthLogLayer;
  /** Business identifiers (email, userId, etc.) */
  identifiers?: Record<string, string | number>;
  /** TODO: MAYBE CHANGE LATER */
  [key: string]: unknown;
}

/* ------------------------- Layered payload shapes ------------------------- */

export interface AuthActionLog extends AuthLogBase {
  layer: "action";
  kind: AuthActionKind;
}

export interface AuthServiceLog extends AuthLogBase {
  layer: "service";
  kind: AuthServiceKind;
}

export interface AuthRepoLog extends AuthLogBase {
  layer: "infrastructure.repository";
  kind: AuthRepoKind;
  error?: unknown;
}

export interface AuthDalLog extends AuthLogBase {
  layer: "infrastructure.dal";
  kind: AuthDalKind;
  details?: Record<string, unknown>;
}

/**
 * Convenient union for any auth log payload.
 */
export type AuthLogPayload =
  | AuthActionLog
  | AuthServiceLog
  | AuthRepoLog
  | AuthDalLog;
