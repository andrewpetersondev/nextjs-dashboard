export const AUTH_ROUTE_TYPES = {
  ADMIN: "admin",
  PROTECTED: "protected",
  PUBLIC: "public",
} as const;

/**
 * Supported route categories for authentication and authorization.
 */
export type AuthRouteType =
  (typeof AUTH_ROUTE_TYPES)[keyof typeof AUTH_ROUTE_TYPES];
