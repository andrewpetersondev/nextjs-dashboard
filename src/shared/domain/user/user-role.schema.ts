import { z } from "zod";
import { USER_ROLES } from "@/shared/domain/user/user-role.types";

const userRoleEnum = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
export const userRoleSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(userRoleEnum);
