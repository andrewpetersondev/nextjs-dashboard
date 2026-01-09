import type { AuthRouteType } from "@/modules/auth/domain/policies/evaluate-route-access.policy";

/**
 * Determines the route type based on flags.
 */
export function getRouteTypePolicy(flags: {
  isAdminRoute: boolean;
  isProtectedRoute: boolean;
  isPublicRoute: boolean;
}): AuthRouteType {
  if (flags.isAdminRoute) {
    return "admin";
  }
  if (flags.isProtectedRoute) {
    return "protected";
  }
  return "public";
}
