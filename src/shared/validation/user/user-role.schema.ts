import { z } from "zod";

// TODO: EXTRACT USER_ROLES, UserRole, ADMIN_ROLE, GUEST_ROLE, USER_ROLE TO user-role.constants.ts
export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLE = "ADMIN";
export const GUEST_ROLE = "GUEST";
export const USER_ROLE = "USER";

export const UserRoleEnum = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
export const UserRoleFormSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(UserRoleEnum);
