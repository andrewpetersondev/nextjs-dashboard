import { ROLES } from "./roles";

/**
 * Union type for user roles derived from centralized ROLES.
 */
export type AuthRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * List of allowed user roles derived from centralized ROLES.
 * @readonly
 */
export const AUTH_ROLES = Object.values(ROLES) as readonly AuthRole[];
