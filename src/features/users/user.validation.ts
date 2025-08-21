import { USER_ROLES, type UserRole } from "@/features/users/user.types";

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

/**
 * Type guard to check if a value is a valid UserRole
 * @param value - The value to check
 * @returns True if the value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}
