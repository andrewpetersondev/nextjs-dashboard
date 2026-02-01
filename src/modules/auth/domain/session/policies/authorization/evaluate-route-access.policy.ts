import {
  AUTH_POLICY_REASONS,
  type AuthPolicyReason,
} from "@/modules/auth/domain/shared/constants/auth-policy.constants";
import {
  AUTH_ROUTE_TYPES,
  type AuthRouteType,
} from "@/modules/auth/domain/shared/constants/auth-route.constants";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import { ADMIN_ROLE } from "@/shared/domain/user/user-role.schema";

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
      reason: AuthPolicyReason;
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
  if (routeType === AUTH_ROUTE_TYPES.ADMIN) {
    if (!input.isAuthenticated) {
      return {
        allowed: false,
        reason: AUTH_POLICY_REASONS.NOT_AUTHENTICATED,
      };
    }
    if (input.role !== ADMIN_ROLE) {
      return {
        allowed: false,
        reason: AUTH_POLICY_REASONS.NOT_AUTHORIZED,
      };
    }
    return { allowed: true };
  }

  if (routeType === AUTH_ROUTE_TYPES.PROTECTED) {
    if (!input.isAuthenticated) {
      return {
        allowed: false,
        reason: AUTH_POLICY_REASONS.NOT_AUTHENTICATED,
      };
    }
    return { allowed: true };
  }

  // public
  if (input.isAuthenticated) {
    return { allowed: false, reason: AUTH_POLICY_REASONS.NOT_AUTHORIZED };
  }

  return { allowed: true };
}
