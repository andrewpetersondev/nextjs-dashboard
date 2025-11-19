import type { UserRole } from "@/features/auth/lib/auth.roles";
import { USER_ROLES } from "@/features/auth/lib/auth.roles";
import { BaseError } from "@/shared/errors/base-error";
import type { Result } from "@/shared/result/result";

/**
 * Validates and converts an unknown value to a valid UserRole (Result-based).
 * Does not throw.
 */
export function toUserRoleResult(role: unknown): Result<UserRole, BaseError> {
  const value = typeof role === "string" ? role.trim().toUpperCase() : role;
  if (USER_ROLES.includes(value as UserRole)) {
    return { ok: true, value: value as UserRole };
  }
  return {
    error: new BaseError("validation", {
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
