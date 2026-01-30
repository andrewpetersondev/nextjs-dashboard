import {
  AUTH_ROUTE_TYPES,
  type AuthRouteType,
} from "@/modules/auth/domain/constants/auth-policy.constants";

/**
 * Determines the route type based on boolean flags.
 *
 * @param flags - Object containing route classification flags.
 * @returns The determined `AuthRouteType`.
 */
export function getRouteTypePolicy(flags: {
  isAdminRoute: boolean;
  isProtectedRoute: boolean;
  isPublicRoute: boolean;
}): AuthRouteType {
  if (flags.isAdminRoute) {
    return AUTH_ROUTE_TYPES.ADMIN;
  }
  if (flags.isProtectedRoute) {
    return AUTH_ROUTE_TYPES.PROTECTED;
  }
  return AUTH_ROUTE_TYPES.PUBLIC;
}
