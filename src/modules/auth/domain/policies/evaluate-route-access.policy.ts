import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { ADMIN_ROLE } from "@/shared/domain/user/user-role.schema";

/**
 * Supported route categories for authentication and authorization.
 */
export type AuthRouteType = "admin" | "protected" | "public";

/**
 * Result of the route access evaluation.
 */
export type AuthRouteAccessDecision =
  | Readonly<{
      /** Access is granted */
      allowed: true;
    }>
  | Readonly<{
      /** Access is denied */
      allowed: false;
      /** Reason for denial */
      reason: "not_authenticated" | "not_authorized";
      /** Suggested redirect destination */
      redirectTo: "login" | "dashboard";
    }>;

/**
 * Pure function that determines route access based on session claims and route type.
 *
 * @remarks
 * Redirect Logic:
 * - If a user is not authenticated and tries to access a 'protected' or 'admin' route, they are redirected to 'login'.
 * - If an authenticated user tries to access an 'admin' route without having the 'admin' role, they are redirected to 'dashboard'.
 * - If an authenticated user tries to access a 'public' route (e.g., login/signup pages), they are redirected to 'dashboard' to avoid redundant authentication.
 *
 * @param routeType - The classification of the route being accessed.
 * @param claims - The session token claims, if an active session exists.
 * @returns A decision indicating if access is allowed or why it was denied.
 */
export function evaluateRouteAccessPolicy(
  routeType: AuthRouteType,
  claims: SessionTokenClaimsDto | undefined,
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
