import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

/**
 * Validates and converts an unknown value to a valid UserRole (Result-based).
 * Does not throw.
 */
export function toUserRoleResult(role: unknown): Result<UserRole, AppError> {
  const value = typeof role === "string" ? role.trim().toUpperCase() : role;
  if (USER_ROLES.includes(value as UserRole)) {
    return { ok: true, value: value as UserRole };
  }
  return {
    error: new AppError("validation", {
      cause: { role },
      message: "Invalid user role",
    }),
    ok: false,
  };
}

/**
 * Throwing wrapper for call sites that expect exceptions on invalid input.
 */
export function toUserRole(role: unknown): UserRole {
  const r = toUserRoleResult(role);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}

/**
 * Validates and returns a user role, defaulting to guest if invalid.
 *
 * @param role - The role to validate.
 * @returns {UserRole} - A valid user role.
 */
export const getValidUserRole = (role: unknown): UserRole =>
  USER_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : (GUEST_ROLE as UserRole);
