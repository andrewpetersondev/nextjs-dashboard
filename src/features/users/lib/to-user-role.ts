import type { UserRole } from "@/features/auth/domain/roles";
import { USER_ROLES } from "@/features/auth/domain/roles";
import { ValidationError } from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";

/**
 * Validates and converts an unknown value to a valid UserRole (Result-based).
 * Does not throw.
 */
export function toUserRoleResult(
  role: unknown,
): Result<UserRole, ValidationError> {
  const value = typeof role === "string" ? role.trim().toUpperCase() : role;
  if (USER_ROLES.includes(value as UserRole)) {
    return { data: value as UserRole, success: true };
  }
  return {
    error: new ValidationError("Invalid user role", { role }),
    success: false,
  };
}

/**
 * Throwing wrapper for call sites that expect exceptions on invalid input.
 */
export function toUserRole(role: unknown): UserRole {
  const r = toUserRoleResult(role);
  if (r.success) {
    return r.data;
  }
  throw r.error;
}
