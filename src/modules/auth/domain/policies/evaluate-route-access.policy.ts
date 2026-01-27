import type { UserRole } from "@/shared/domain/user/user-role.schema";
import { ADMIN_ROLE } from "@/shared/domain/user/user-role.schema";

/**
 * Supported route categories for authentication and authorization.
 */
export type AuthRouteType = "admin" | "protected" | "public";

/**
 * Result of the route access evaluation (domain-level: authorization only).
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
    }>;

/**
 * Pure function that determines route access based on authentication state and role.
 *
 * @remarks
 * This policy intentionally does NOT return redirect destinations.
 * Redirects are a delivery concern handled in outer layers (middleware/actions).
 */
export function evaluateRouteAccessPolicy(
  routeType: AuthRouteType,
  input: Readonly<{
    isAuthenticated: boolean;
    role: UserRole | undefined;
  }>,
): AuthRouteAccessDecision {
  if (routeType === "admin") {
    if (!input.isAuthenticated) {
      return { allowed: false, reason: "not_authenticated" };
    }
    if (input.role !== ADMIN_ROLE) {
      return { allowed: false, reason: "not_authorized" };
    }
    return { allowed: true };
  }

  if (routeType === "protected") {
    if (!input.isAuthenticated) {
      return { allowed: false, reason: "not_authenticated" };
    }
    return { allowed: true };
  }

  // public
  if (input.isAuthenticated) {
    return { allowed: false, reason: "not_authorized" };
  }

  return { allowed: true };
}
