import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_ROLE } from "@/modules/auth/domain/auth.roles";
import { SESSION_COOKIE_NAME } from "@/modules/auth/domain/sessions/session.constants";
import { createSessionJwtAdapter } from "@/modules/auth/server/infrastructure/adapters/session-jwt.adapter";
import {
  isAdminRoute as isAdminRouteHelper,
  isProtectedRoute as isProtectedRouteHelper,
  isPublicRoute as isPublicRouteHelper,
  normalizePath,
  ROUTES,
} from "@/shared/routes/routes";

export default async function proxy(req: NextRequest) {
  const path: string = normalizePath(req.nextUrl.pathname);
  const isProtectedRoute: boolean = isProtectedRouteHelper(path);
  const isAdminRoute: boolean = isAdminRouteHelper(path);
  const isPublicRoute: boolean = isPublicRouteHelper(path);

  // If route is not relevant for auth, skip work early (avoid cookie/session reads)
  if (!(isProtectedRoute || isAdminRoute || isPublicRoute)) {
    return NextResponse.next();
  }

  // Retrieve and decode session only when needed
  const cookie: string | undefined =
    req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const jwt = createSessionJwtAdapter();
  const claims = cookie ? await jwt.decode(cookie) : undefined;

  // Admin-only routes
  if (isAdminRoute) {
    // Not authenticated: go straight to login (avoid double redirects)
    if (!claims?.userId) {
      return NextResponse.redirect(new URL(ROUTES.auth.login, req.nextUrl));
    }
    // Authenticated but not admin
    if (claims.role !== ADMIN_ROLE) {
      return NextResponse.redirect(new URL(ROUTES.dashboard.root, req.nextUrl));
    }
  }

  // Protected routes (folder-scoped)
  if (isProtectedRoute && !claims?.userId) {
    return NextResponse.redirect(new URL(ROUTES.auth.login, req.nextUrl));
  }

  // Public routes: bounce authenticated users to dashboard
  if (isPublicRoute && claims?.userId && !isProtectedRouteHelper(path)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard.root, req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  // Exclude APIs, Next internals, data routes, and any path with a file extension.
  // Must be a static literal for Next.js to statically analyze.
  matcher: ["/((?!_next/static|_next/image|_next/data|.*\\..*$).*)"],
};
