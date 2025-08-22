/**
 * List of allowed user roles.
 * @readonly
 */
export const AUTH_ROLES = ["admin", "user", "guest"] as const;

/**
 * Union type for user roles.
 * @example
 * const role: UserRole = "admin";
 */
export type AuthRole = (typeof AUTH_ROLES)[number];
