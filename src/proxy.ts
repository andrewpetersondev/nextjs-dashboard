import { type NextRequest, NextResponse } from "next/server";
import { authorizeRequestHelper } from "@/modules/auth/application/shared/helpers/authorize-request.helper";
import { sessionTokenServiceFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-token-service.factory";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/session/types/session-cookie.constants";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import {
  isAdminRoute as isAdminRouteHelper,
  isProtectedRoute as isProtectedRouteHelper,
  isPublicRoute as isPublicRouteHelper,
  normalizePath,
  ROUTES,
} from "@/shared/routes/routes";

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  /**
   * Unique identifier for the current request.
   *
   * This identifier is first checked from the incoming request's headers,
   * specifically the `x-request-id` field. If the `x-request-id` is not
   * present or is undefined, a new random identifier is generated, prefixed
   * with `mw-`, followed by the first 8 characters of a UUID.
   *
   * @readonly
   * @remarks
   * The use of this identifier ensures traceability of requests, which is
   * useful for logging, debugging, and distributed systems.
   */
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

  // Option B: Compute mutually exclusive flags
  const isAdminRoute = isAdminRouteHelper(path);
  const isProtectedRoute = !isAdminRoute && isProtectedRouteHelper(path);
  const isPublicRoute =
    !(isAdminRoute || isProtectedRoute) && isPublicRouteHelper(path);

  if (!(isProtectedRoute || isAdminRoute || isPublicRoute)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionTokenService = sessionTokenServiceFactory(logger);

  const outcome = await authorizeRequestHelper(
    { cookie, isAdminRoute, isProtectedRoute, isPublicRoute, path },
    {
      routes: {
        dashboardRoot: ROUTES.dashboard.root,
        login: ROUTES.auth.login,
      },
      sessionTokenService,
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
// biome-ignore lint/nursery/useExplicitType: fix
export const config = {
  // Exclude APIs, Next internals, data routes, and any path with a file extension.
  // Must be a static literal for Next.js to statically analyze.
  matcher: ["/((?!_next/static|_next/image|_next/data|.*\\..*$).*)"],
};
