import type { AuthRequestAuthorizationReason } from "@/modules/auth/application/dtos/auth-request-authorization.output";
import type { AuthRouteType } from "@/modules/auth/domain/policies/evaluate-route-access.policy";

export function toAuthorizationReasonPolicy(
  routeType: AuthRouteType,
  policyReason: "not_authenticated" | "not_authorized",
  decodeReason: "ok" | "no_cookie" | "decode_failed",
): AuthRequestAuthorizationReason {
  if (decodeReason !== "ok" && policyReason === "not_authenticated") {
    return decodeReason;
  }

  if (routeType === "admin") {
    return policyReason === "not_authenticated"
      ? "admin.not_authenticated"
      : "admin.not_authorized";
  }

  if (routeType === "protected") {
    return "protected.not_authenticated";
  }

  return "public.bounce_authenticated";
}
