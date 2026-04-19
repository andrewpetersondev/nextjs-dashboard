import { z } from "zod";
import { USER_ROLES } from "@/shared/policies/user-role/user-role.constants";

export const UserRoleEnumSchema = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
export const UserRoleFormSchema = z
	.string()
	.trim()
	.toUpperCase()
	.pipe(UserRoleEnumSchema);
