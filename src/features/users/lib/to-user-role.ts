import type { AuthRole } from "@/features/auth/domain/roles";
import { AUTH_ROLES } from "@/features/auth/domain/roles";
import { ValidationError } from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";

/**
 * Validates and converts an unknown value to a valid AuthRole (Result-based).
 * Does not throw.
 */
export function toUserRoleResult(
  role: unknown,
): Result<AuthRole, ValidationError> {
  const value = typeof role === "string" ? role.trim().toLowerCase() : role;
  if (AUTH_ROLES.includes(value as AuthRole)) {
    return { data: value as AuthRole, success: true };
  }
  return {
    error: new ValidationError("Invalid user role", { role }),
    success: false,
  };
}

/**
 * Throwing wrapper for call sites that expect exceptions on invalid input.
 */
export function toUserRole(role: unknown): AuthRole {
  const r = toUserRoleResult(role);
  if (r.success) {
    return r.data;
  }
  throw r.error;
}
