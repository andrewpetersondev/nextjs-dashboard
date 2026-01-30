import {
  AUTH_ROUTE_TYPES,
  type AuthRouteType,
} from "@/modules/auth/domain/constants/auth-route.constants";

/**
 * Route classification flags used to determine an `AuthRouteType`.
 *
 * @remarks
 * This policy is intentionally strict: exactly one flag must be `true`.
 * Silent fallbacks would mask upstream routing bugs and cause authorization drift.
 */
export type AuthRouteTypeFlags = Readonly<{
  isAdminRoute: boolean;
  isProtectedRoute: boolean;
  isPublicRoute: boolean;
}>;

/**
 * Determines the route type based on boolean flags.
 *
 * @param flags - Object containing route classification flags.
 * @returns The determined `AuthRouteType`.
 * @throws Error
 * Thrown when the flags are inconsistent (e.g. multiple true) or underspecified (none true).
 */
export function getRouteTypePolicy(flags: AuthRouteTypeFlags): AuthRouteType {
  const trueCount: number = [
    flags.isAdminRoute,
    flags.isProtectedRoute,
    flags.isPublicRoute,
  ].filter((v: boolean) => v).length;

  if (trueCount !== 1) {
    throw new Error(
      "Invalid route type flags: exactly one of isAdminRoute/isProtectedRoute/isPublicRoute must be true.",
    );
  }

  if (flags.isAdminRoute) {
    return AUTH_ROUTE_TYPES.ADMIN;
  }
  if (flags.isProtectedRoute) {
    return AUTH_ROUTE_TYPES.PROTECTED;
  }
  return AUTH_ROUTE_TYPES.PUBLIC;
}
