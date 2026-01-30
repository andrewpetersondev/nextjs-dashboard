import {
  AUTH_POLICY_REASONS,
  type AuthPolicyReason,
} from "@/modules/auth/domain/constants/auth-policy.constants";
import {
  AUTH_REQUEST_REASONS,
  AUTH_SESSION_DECODE_RESULTS,
  type AuthRequestReason,
  type AuthSessionDecodeResult,
} from "@/modules/auth/domain/constants/auth-request.constants";
import {
  AUTH_ROUTE_TYPES,
  type AuthRouteType,
} from "@/modules/auth/domain/constants/auth-route.constants";

/**
 * Maps internal policy and decoding results to a public authorization reason.
 *
 * @param routeType - The type of route being accessed.
 * @param policyReason - The result of the route access policy evaluation.
 * @param decodeResult - The result of attempting to decode/read the session cookie.
 * @returns A consolidated authorization reason for the request.
 */
export function toAuthorizationReasonPolicy(
  routeType: AuthRouteType,
  policyReason: AuthPolicyReason,
  decodeResult: AuthSessionDecodeResult,
): AuthRequestReason {
  if (policyReason === AUTH_POLICY_REASONS.NOT_AUTHENTICATED) {
    switch (decodeResult) {
      case AUTH_SESSION_DECODE_RESULTS.OK: {
        break;
      }
      case AUTH_SESSION_DECODE_RESULTS.NO_COOKIE: {
        return AUTH_REQUEST_REASONS.NO_COOKIE;
      }
      case AUTH_SESSION_DECODE_RESULTS.DECODE_FAILED: {
        return AUTH_REQUEST_REASONS.DECODE_FAILED;
      }
      case AUTH_SESSION_DECODE_RESULTS.INVALID_CLAIMS: {
        // Public reasons currently do not distinguish invalid claims vs decode failure.
        return AUTH_REQUEST_REASONS.DECODE_FAILED;
      }
      default: {
        // Exhaustiveness guard: if AuthSessionDecodeResult grows, TypeScript should fail here.
        return AUTH_REQUEST_REASONS.DECODE_FAILED;
      }
    }
  }

  if (routeType === AUTH_ROUTE_TYPES.ADMIN) {
    return policyReason === AUTH_POLICY_REASONS.NOT_AUTHENTICATED
      ? AUTH_REQUEST_REASONS.ADMIN_NOT_AUTHENTICATED
      : AUTH_REQUEST_REASONS.ADMIN_NOT_AUTHORIZED;
  }

  if (routeType === AUTH_ROUTE_TYPES.PROTECTED) {
    return AUTH_REQUEST_REASONS.PROTECTED_NOT_AUTHENTICATED;
  }

  return AUTH_REQUEST_REASONS.PUBLIC_BOUNCE_AUTHENTICATED;
}
