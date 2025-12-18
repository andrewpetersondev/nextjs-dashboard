import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/shared/domain/user/auth.roles";
import type { AppError } from "@/shared/errors/core/app-error";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Type guard to check if a value is a valid UserRole.
 *
 * @param role - The value to check.
 * @returns {boolean} - True if the value is a valid UserRole.
 */
export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

/**
 * Validates and converts an unknown value to a valid UserRole (Result-based).
 * Does not throw.
 */
export function toUserRole(role: unknown): Result<UserRole, AppError> {
  const value = typeof role === "string" ? role.trim().toUpperCase() : role;

  if (isUserRole(value)) {
    return Ok(value);
  }

  return Err(
    makeValidationError({
      cause: { role },
      message: "Invalid user role",
      metadata: {},
    }),
  );
}

/**
 * Throwing wrapper for call sites that expect exceptions on invalid input.
 */
export function parseUserRole(role: unknown): UserRole {
  const r = toUserRole(role);
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
export const normalizeUserRole = (role: unknown): UserRole => {
  const result = toUserRole(role);
  return result.ok ? result.value : GUEST_ROLE;
};
