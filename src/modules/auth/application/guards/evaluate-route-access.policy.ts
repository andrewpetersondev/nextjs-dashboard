import type { AuthJwtTransport } from "@/modules/auth/infrastructure/serialization/auth-jwt.transport";
import { ADMIN_ROLE } from "@/shared/domain/user/user-role.types";

export type AuthRouteType = "admin" | "protected" | "public";

export type AuthRouteAccessDecision =
  | Readonly<{ allowed: true }>
  | Readonly<{
      allowed: false;
      reason: "not_authenticated" | "not_authorized";
      redirectTo: "login" | "dashboard";
    }>;

/**
 * Pure function that determines route access based on claims and route type.
 * No side effects - just policy logic.
 */
export function evaluateRouteAccess(
  routeType: AuthRouteType,
  claims: AuthJwtTransport | undefined,
): AuthRouteAccessDecision {
  const isAuthenticated = Boolean(claims?.userId);

  if (routeType === "admin") {
    if (!isAuthenticated) {
      return {
        allowed: false,
        reason: "not_authenticated",
        redirectTo: "login",
      };
    }
    if (claims?.role !== ADMIN_ROLE) {
      return {
        allowed: false,
        reason: "not_authorized",
        redirectTo: "dashboard",
      };
    }
    return { allowed: true };
  }

  if (routeType === "protected") {
    if (!isAuthenticated) {
      return {
        allowed: false,
        reason: "not_authenticated",
        redirectTo: "login",
      };
    }
    return { allowed: true };
  }

  // Public route - bounce authenticated users away from auth pages
  if (isAuthenticated) {
    return {
      allowed: false,
      reason: "not_authorized",
      redirectTo: "dashboard",
    };
  }

  return { allowed: true };
}
