import { USER_ROLES, type UserRole } from "@/features/users/types";
import { validateEnum } from "@/shared/validation/enum";

/**
 * Validates and converts a value to a UserRole
 * @param role - The role value to validate
 * @returns A validated UserRole
 * @throws {ValidationError} If the role is invalid
 */
export const toUserRole = (role: unknown): UserRole => {
  return validateEnum(role, USER_ROLES, "UserRole");
};
