import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import { evaluateRouteAccess } from "@/modules/auth/application/guards/evaluate-route-access.policy";
import { getRouteType } from "@/modules/auth/application/guards/get-route-type.policy";
import type { AuthJwtTransport } from "@/modules/auth/infrastructure/serialization/auth-jwt.transport";

function toAuthorizationReason(
  routeType: ReturnType<typeof getRouteType>,
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

async function extractSessionClaims(
  cookie: string | undefined,
  jwt: SessionTokenCodecContract,
): Promise<
  Readonly<
    | { claims: AuthJwtTransport; reason: "ok" }
    | { claims: undefined; reason: "no_cookie" | "decode_failed" }
  >
> {
  if (!cookie) {
    return { claims: undefined, reason: "no_cookie" };
  }

  const decodedResult = await jwt.decode(cookie);
  if (!decodedResult.ok) {
    return { claims: undefined, reason: "decode_failed" };
  }

  return { claims: decodedResult.value, reason: "ok" };
}

export type AuthRequestAuthorizationReason =
  | "admin.not_authenticated"
  | "admin.not_authorized"
  | "decode_failed"
  | "no_cookie"
  | "protected.not_authenticated"
  | "public.bounce_authenticated";

export type AuthRequestAuthorizationOutcome =
  | Readonly<{ kind: "next"; reason: "ok" }>
  | Readonly<{
      kind: "redirect";
      reason: AuthRequestAuthorizationReason;
      to: `/${string}`;
    }>;

export async function authorizeRequestPolicy(
  input: Readonly<{
    cookie: string | undefined;
    isAdminRoute: boolean;
    isProtectedRoute: boolean;
    isPublicRoute: boolean;
    path: string;
  }>,
  deps: Readonly<{
    jwt: SessionTokenCodecContract;
    routes: Readonly<{
      dashboardRoot: `/${string}`;
      login: `/${string}`;
    }>;
  }>,
): Promise<AuthRequestAuthorizationOutcome> {
  const decoded = await extractSessionClaims(input.cookie, deps.jwt);

  const routeType = getRouteType({
    isAdminRoute: input.isAdminRoute,
    isProtectedRoute: input.isProtectedRoute,
    isPublicRoute: input.isPublicRoute,
  });

  const decision = evaluateRouteAccess(routeType, decoded.claims);

  if (decision.allowed) {
    return { kind: "next", reason: "ok" };
  }

  const redirectTo =
    decision.redirectTo === "login"
      ? deps.routes.login
      : deps.routes.dashboardRoot;

  const reason = toAuthorizationReason(
    routeType,
    decision.reason,
    decoded.reason,
  );

  return { kind: "redirect", reason, to: redirectTo };
}
