import { z } from "zod";

export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";

export const userRoleEnum = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
export const userRoleSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(userRoleEnum);
