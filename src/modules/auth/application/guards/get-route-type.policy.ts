import type { AuthRouteType } from "@/modules/auth/application/guards/evaluate-route-access.policy";

/**
 * Determines the route type based on flags.
 */
export function getRouteType(flags: {
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
