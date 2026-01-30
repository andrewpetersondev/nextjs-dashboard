import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/session-token-claims.dto";
import { AUTH_POLICY_REASONS } from "@/modules/auth/domain/session/constants/auth-policy.constants";
import {
  AUTH_REQUEST_REASONS,
  AUTH_SESSION_DECODE_RESULTS,
  type AuthSessionDecodeResult,
} from "@/modules/auth/domain/session/constants/auth-request.constants";
import type { AuthRequestAuthorizationOutcome } from "@/modules/auth/domain/session/outputs/auth-request-authorization.output";
import { evaluateRouteAccessPolicy } from "@/modules/auth/domain/session/policies/route/evaluate-route-access.policy";
import { tryGetRouteTypePolicy } from "@/modules/auth/domain/session/policies/route/get-route-type.policy";
import { toAuthorizationReasonPolicy } from "@/modules/auth/domain/session/policies/route/to-authorization-reason.policy";

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
    | {
        claims: SessionTokenClaimsDto;
        reason: typeof AUTH_SESSION_DECODE_RESULTS.OK;
      }
    | {
        claims: undefined;
        reason: Exclude<
          AuthSessionDecodeResult,
          typeof AUTH_SESSION_DECODE_RESULTS.OK
        >;
      }
  >
> {
  if (!cookie) {
    return { claims: undefined, reason: AUTH_SESSION_DECODE_RESULTS.NO_COOKIE };
  }

  const decodedResult = await sessionTokenService.decode(cookie);
  if (!decodedResult.ok) {
    return {
      claims: undefined,
      reason: AUTH_SESSION_DECODE_RESULTS.DECODE_FAILED,
    };
  }

  const validatedResult = await sessionTokenService.validate(
    decodedResult.value,
  );
  if (!validatedResult.ok) {
    return {
      claims: undefined,
      reason: AUTH_SESSION_DECODE_RESULTS.INVALID_CLAIMS,
    };
  }

  return {
    claims: validatedResult.value,
    reason: AUTH_SESSION_DECODE_RESULTS.OK,
  };
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

  const routeTypeResult = tryGetRouteTypePolicy({
    isAdminRoute: input.isAdminRoute,
    isProtectedRoute: input.isProtectedRoute,
    isPublicRoute: input.isPublicRoute,
  });

  if (!routeTypeResult.ok) {
    return {
      kind: "redirect",
      reason: AUTH_REQUEST_REASONS.ROUTE_FLAGS_INVALID,
      to: deps.routes.login,
    };
  }

  const routeType = routeTypeResult.value;

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
