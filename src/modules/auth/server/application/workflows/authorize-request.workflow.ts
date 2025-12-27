import "server-only";

import type { SessionTokenCodecPort } from "@/modules/auth/server/application/contracts/session.contract";
import type { AuthEncryptPayload } from "@/modules/auth/shared/domain/session/session.codec";
import { ADMIN_ROLE } from "@/shared/domain/user/user-role.types";

async function decodeClaims(
  cookie: string | undefined,
  jwt: SessionTokenCodecPort,
): Promise<
  Readonly<
    | { claims: AuthEncryptPayload; reason: "ok" }
    | {
        claims: undefined;
        reason: Exclude<
          AuthorizeRequestReason,
          | "admin.not_authorized"
          | "admin.not_authenticated"
          | "protected.not_authenticated"
          | "public.bounce_authenticated"
        >;
      }
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

export type AuthorizeRequestReason =
  | "admin.not_authenticated"
  | "admin.not_authorized"
  | "decode_failed"
  | "no_cookie"
  | "protected.not_authenticated"
  | "public.bounce_authenticated";

export type AuthorizeRequestOutcome =
  | Readonly<{ kind: "next"; reason: "ok" }>
  | Readonly<{
      kind: "redirect";
      reason: AuthorizeRequestReason;
      to: `/${string}`;
    }>;

export async function authorizeRequestWorkflow(
  input: Readonly<{
    cookie: string | undefined;
    isAdminRoute: boolean;
    isProtectedRoute: boolean;
    isPublicRoute: boolean;
    path: string;
  }>,
  deps: Readonly<{
    jwt: SessionTokenCodecPort;
    routes: Readonly<{
      dashboardRoot: `/${string}`;
      login: `/${string}`;
    }>;
  }>,
): Promise<AuthorizeRequestOutcome> {
  const decoded = await decodeClaims(input.cookie, deps.jwt);

  if (input.isAdminRoute) {
    if (!decoded.claims?.userId) {
      return {
        kind: "redirect",
        reason:
          decoded.reason === "ok" ? "admin.not_authenticated" : decoded.reason,
        to: deps.routes.login,
      };
    }
    if (decoded.claims.role !== ADMIN_ROLE) {
      return {
        kind: "redirect",
        reason: "admin.not_authorized",
        to: deps.routes.dashboardRoot,
      };
    }
  }

  if (input.isProtectedRoute && !decoded.claims?.userId) {
    return {
      kind: "redirect",
      reason:
        decoded.reason === "ok"
          ? "protected.not_authenticated"
          : decoded.reason,
      to: deps.routes.login,
    };
  }

  if (
    input.isPublicRoute &&
    decoded.claims?.userId &&
    !input.isProtectedRoute
  ) {
    return {
      kind: "redirect",
      reason: "public.bounce_authenticated",
      to: deps.routes.dashboardRoot,
    };
  }

  return { kind: "next", reason: "ok" };
}
