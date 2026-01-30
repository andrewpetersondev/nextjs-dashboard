import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { AUTH_POLICY_REASONS } from "@/modules/auth/domain/constants/auth-policy.constants";
import { evaluateRouteAccessPolicy } from "@/modules/auth/domain/policies/evaluate-route-access.policy";
import { getRouteTypePolicy } from "@/modules/auth/domain/policies/get-route-type.policy";
import { toAuthorizationReasonPolicy } from "@/modules/auth/domain/policies/to-authorization-reason.policy";
import type { AuthRequestAuthorizationOutcome } from "@/modules/auth/domain/types/auth-request-authorization.output";

/**
 * Resolves session token claims from a raw cookie string, ensuring that decode failures are surfaced
 * so downstream authorization can respond with an explicit redirect reason.
 *
 * @param cookie Cookie header value containing the encoded session token.
 * @param sessionTokenService Service used to decode + validate the session token.
 */
async function extractSessionClaims(
  cookie: string | undefined,
  sessionTokenService: SessionTokenServiceContract,
): Promise<
  Readonly<
    | { claims: SessionTokenClaimsDto; reason: "ok" }
    | { claims: undefined; reason: "no_cookie" | "decode_failed" }
  >
> {
  if (!cookie) {
    return { claims: undefined, reason: "no_cookie" };
  }

  const decodedResult = await sessionTokenService.decode(cookie);
  if (!decodedResult.ok) {
    return { claims: undefined, reason: "decode_failed" };
  }

  return { claims: decodedResult.value, reason: "ok" };
}

/**
 * Authorizes a request against route access policies.
 *
 * This helper coordinates session claim extraction and policy evaluation to
 * determine if a request should proceed or be redirected.
 *
 * @param input - Request metadata, including route classification flags and path.
 * @param deps - Infrastructure dependencies required for decoding and routing.
 * @returns An authorization outcome (either "next" or "redirect").
 */
export async function authorizeRequestHelper(
  input: Readonly<{
    cookie: string | undefined;
    isAdminRoute: boolean;
    isProtectedRoute: boolean;
    isPublicRoute: boolean;
    path: string;
  }>,
  deps: Readonly<{
    routes: Readonly<{
      dashboardRoot: `/${string}`;
      login: `/${string}`;
    }>;
    sessionTokenService: SessionTokenServiceContract;
  }>,
): Promise<AuthRequestAuthorizationOutcome> {
  const decoded = await extractSessionClaims(
    input.cookie,
    deps.sessionTokenService,
  );

  const routeType = getRouteTypePolicy({
    isAdminRoute: input.isAdminRoute,
    isProtectedRoute: input.isProtectedRoute,
    isPublicRoute: input.isPublicRoute,
  });

  const isAuthenticated = Boolean(decoded.claims?.sub);

  const decision = evaluateRouteAccessPolicy(routeType, {
    isAuthenticated,
    role: decoded.claims?.role,
  });

  if (decision.allowed) {
    return { kind: "next", reason: "ok" };
  }

  const redirectTo =
    decision.reason === AUTH_POLICY_REASONS.NOT_AUTHENTICATED
      ? deps.routes.login
      : deps.routes.dashboardRoot;

  const reason = toAuthorizationReasonPolicy(
    routeType,
    decision.reason,
    decoded.reason,
  );

  return { kind: "redirect", reason, to: redirectTo };
}
