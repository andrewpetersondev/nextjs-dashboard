import "server-only";
import type { ConflictError } from "@/shared/core/errors/domain/domain-errors";

/**
 * Auth-specific conflict codes.
 * These are domain-level and independent of the underlying database.
 */
export type AuthConflictCode =
  | "auth.email_conflict"
  | "auth.username_conflict"
  | "auth.generic_conflict";

export interface AuthConflictDetails {
  readonly code: AuthConflictCode;
  readonly message: string;
  readonly field?: "email" | "username";
}

/**
 * Map a low-level ConflictError (from infra) into an auth-domain conflict.
 *
 * Responsibilities:
 * - Interpret infra context (e.g. constraint name) in auth terms.
 * - Produce stable, domain-level codes/messages.
 * - Keep all DB/constraint-name knowledge at the boundary (here), not in infra.
 */
export function mapConflictErrorToAuthConflict(
  error: ConflictError,
): AuthConflictDetails {
  const context = error.context ?? {};
  const constraint = String(
    (context as Record<string, unknown>).constraint ?? "",
  );

  // NOTE:
  //  - We still *use* constraint names, but only at the auth domain boundary.
  //  - If constraints change, we update this one mapper instead of infra.
  if (constraint.includes("email")) {
    return {
      code: "auth.email_conflict",
      field: "email",
      message: "Email already in use",
    };
  }

  if (constraint.includes("username")) {
    return {
      code: "auth.username_conflict",
      field: "username",
      message: "Username already taken",
    };
  }

  // Fallback: generic auth conflict
  return {
    code: "auth.generic_conflict",
    message: "A conflicting account already exists",
  };
}
