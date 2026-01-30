import {
  AUTH_POLICY_REASONS,
  AUTH_REQUEST_REASONS,
  AUTH_ROUTE_TYPES,
  AUTH_SESSION_DECODE_RESULTS,
  type AuthPolicyReason,
  type AuthRequestReason,
  type AuthRouteType,
  type AuthSessionDecodeResult,
} from "@/modules/auth/domain/constants/auth-policy.constants";

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
  if (
    decodeResult !== AUTH_SESSION_DECODE_RESULTS.OK &&
    policyReason === AUTH_POLICY_REASONS.NOT_AUTHENTICATED
  ) {
    return decodeResult === AUTH_SESSION_DECODE_RESULTS.NO_COOKIE
      ? AUTH_REQUEST_REASONS.NO_COOKIE
      : AUTH_REQUEST_REASONS.DECODE_FAILED;
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
