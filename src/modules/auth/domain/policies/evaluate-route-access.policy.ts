import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
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
export function evaluateRouteAccessPolicy(
  routeType: AuthRouteType,
  claims: SessionTokenClaims | undefined,
): AuthRouteAccessDecision {
  const isAuthenticated = Boolean(claims?.sub);

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
