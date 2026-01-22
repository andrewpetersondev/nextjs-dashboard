import { type NextRequest, NextResponse } from "next/server";
import { authorizeRequestHelper } from "@/modules/auth/application/helpers/authorize-request.helper";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/constants/session-cookie.constants";
import { createSessionTokenCodec } from "@/modules/auth/infrastructure/jwt/factories/jose-session-token-codec.factory";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import {
  isAdminRoute as isAdminRouteHelper,
  isProtectedRoute as isProtectedRouteHelper,
  isPublicRoute as isPublicRouteHelper,
  normalizePath,
  ROUTES,
} from "@/shared/routes/routes";

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const requestId =
    req.headers.get("x-request-id") ??
    `mw-${crypto
      .randomUUID()
      // biome-ignore lint/style/noMagicNumbers: <ignore for now>
      .slice(0, 8)}`;
  const logger = defaultLogger
    .withContext("auth:middleware")
    .withRequest(requestId);

  const path = normalizePath(req.nextUrl.pathname);
  const isAdminRoute = isAdminRouteHelper(path);
  const isProtectedRoute = isProtectedRouteHelper(path);
  const isPublicRoute = isPublicRouteHelper(path);

  if (!(isProtectedRoute || isAdminRoute || isPublicRoute)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const tokenCodec = createSessionTokenCodec(logger);

  const outcome = await authorizeRequestHelper(
    { cookie, isAdminRoute, isProtectedRoute, isPublicRoute, path },
    {
      routes: {
        dashboardRoot: ROUTES.dashboard.root,
        login: ROUTES.auth.login,
      },
      tokenCodec,
    },
  );

  if (outcome.kind === "redirect") {
    // We log BEFORE returning the response to ensure the Edge Runtime doesn't
    // kill the execution context before the log is dispatched.
    logger.operation("info", "Auth middleware redirect", {
      operationContext: "server",
      operationIdentifiers: {
        path,
        reason: outcome.reason,
        to: outcome.to,
      },
      operationName: "auth.middleware.redirect",
    });

    return NextResponse.redirect(new URL(outcome.to, req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  // Exclude APIs, Next internals, data routes, and any path with a file extension.
  // Must be a static literal for Next.js to statically analyze.
  matcher: ["/((?!_next/static|_next/image|_next/data|.*\\..*$).*)"],
};
