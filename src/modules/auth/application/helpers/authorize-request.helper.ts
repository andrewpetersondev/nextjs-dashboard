import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { AuthRequestAuthorizationOutcome } from "@/modules/auth/application/dtos/auth-request-authorization.output";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import { evaluateRouteAccessPolicy } from "@/modules/auth/domain/policies/evaluate-route-access.policy";
import { getRouteTypePolicy } from "@/modules/auth/domain/policies/get-route-type.policy";
import { toAuthorizationReasonPolicy } from "@/modules/auth/domain/policies/to-authorization-reason.policy";

async function extractSessionClaims(
  cookie: string | undefined,
  jwt: SessionTokenCodecContract,
): Promise<
  Readonly<
    | { claims: SessionTokenClaims; reason: "ok" }
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

export async function authorizeRequestHelper(
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

  const routeType = getRouteTypePolicy({
    isAdminRoute: input.isAdminRoute,
    isProtectedRoute: input.isProtectedRoute,
    isPublicRoute: input.isPublicRoute,
  });

  const decision = evaluateRouteAccessPolicy(routeType, decoded.claims);

  if (decision.allowed) {
    return { kind: "next", reason: "ok" };
  }

  const redirectTo =
    decision.redirectTo === "login"
      ? deps.routes.login
      : deps.routes.dashboardRoot;

  const reason = toAuthorizationReasonPolicy(
    routeType,
    decision.reason,
    decoded.reason,
  );

  return { kind: "redirect", reason, to: redirectTo };
}
