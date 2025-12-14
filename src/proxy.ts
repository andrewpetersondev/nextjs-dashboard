import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/modules/auth/domain/session/session.policy.constants";
import { authorizeRequestWorkflow } from "@/modules/auth/server/application/workflows/authorize-request.workflow";
import { createSessionJwtAdapter } from "@/modules/auth/server/infrastructure/session/session-jwt.adapter";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import {
  isAdminRoute as isAdminRouteHelper,
  isProtectedRoute as isProtectedRouteHelper,
  isPublicRoute as isPublicRouteHelper,
  normalizePath,
  ROUTES,
} from "@/shared/routes/routes";

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = normalizePath(req.nextUrl.pathname);
  const isAdminRoute = isAdminRouteHelper(path);
  const isProtectedRoute = isProtectedRouteHelper(path);
  const isPublicRoute = isPublicRouteHelper(path);

  if (!(isProtectedRoute || isAdminRoute || isPublicRoute)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const jwt = createSessionJwtAdapter();

  const outcome = await authorizeRequestWorkflow(
    { cookie, isAdminRoute, isProtectedRoute, isPublicRoute, path },
    {
      jwt,
      routes: {
        dashboardRoot: ROUTES.dashboard.root,
        login: ROUTES.auth.login,
      },
    },
  );

  if (outcome.kind === "redirect") {
    const logger = defaultLogger.withContext("auth:middleware");
    logger.operation("info", "Auth middleware redirect", {
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
