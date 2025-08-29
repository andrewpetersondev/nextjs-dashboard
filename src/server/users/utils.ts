import "server-only";

import { AUTH_ROLES, type AuthRole } from "@/shared/auth/types";

/**
 * Validates and returns a user role, defaulting to "guest" if invalid.
 *
 * @param role - The role to validate.
 * @returns {AuthRole} - A valid user role.
 */
export const getValidUserRole = (role: unknown): AuthRole =>
  AUTH_ROLES.includes(role as AuthRole) ? (role as AuthRole) : "guest";
