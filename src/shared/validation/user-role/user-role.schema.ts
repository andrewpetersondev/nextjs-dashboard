import { z } from "zod";
import { USER_ROLES } from "@/shared/validation/user-role/user-role.constants";

// biome-ignore lint/nursery/useExplicitType: Zod does not make this easy
export const UserRoleEnumSchema = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
// biome-ignore lint/nursery/useExplicitType: Zod does not make this easy
export const UserRoleFormSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(UserRoleEnumSchema);
