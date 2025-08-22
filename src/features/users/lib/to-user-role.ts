import { AUTH_ROLES, type AuthRole } from "@/shared/auth/roles";
import { validateEnum } from "@/shared/validation/enum";

/**
 * Validates and converts a value to a UserRole
 * @param role - The role value to validate
 * @returns A validated UserRole
 * @throws {ValidationError} If the role is invalid
 */
export const toUserRole = (role: unknown): AuthRole => {
  return validateEnum(role, AUTH_ROLES, "UserRole");
};
