import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/features/auth/domain/auth.roles";

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
