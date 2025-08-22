import { AUTH_ROLES, type AuthRole } from "@/shared/auth/roles";

/**
 * Type guard to check if a value is a valid UserRole
 * @param value - The value to check
 * @returns True if the value is a valid UserRole
 */
export function isUserRole(value: unknown): value is AuthRole {
  return typeof value === "string" && AUTH_ROLES.includes(value as AuthRole);
}
