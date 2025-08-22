import { USER_ROLES, type UserRole } from "@/features/users/types";

/**
 * Type guard to check if a value is a valid UserRole
 * @param value - The value to check
 * @returns True if the value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}
