import { type NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/server/auth/session-codec";
import type { DecryptPayload } from "@/server/auth/types";

const PROTECTED_PREFIX = "/dashboard" as const;
const ADMIN_PREFIX = "/dashboard/users" as const;
const PUBLIC_ROUTES = new Set(["/auth/login", "/auth/signup", "/"]);

// Normalize path by removing trailing slash (except root)
function normalizePath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) {
    return p.slice(0, -1);
  }
  return p;
}

// Segment-aware prefix check: matches exact prefix or prefix + "/"
function isPathUnder(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}
// ... existing code ...
export default async function middleware(req: NextRequest) {
  const path: string = normalizePath(req.nextUrl.pathname);
  const isProtectedRoute: boolean = isPathUnder(path, PROTECTED_PREFIX);
  const isAdminRoute: boolean = isPathUnder(path, ADMIN_PREFIX);
  const isPublicRoute: boolean = PUBLIC_ROUTES.has(path);

  // If route is not relevant for auth, skip work early (avoid cookie/session reads)
  if (!isProtectedRoute && !isAdminRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  // Retrieve and decode session only when needed
  const cookie: string | undefined = req.cookies.get("session")?.value;
  const session: DecryptPayload | undefined = await readSessionToken(cookie);

  // Admin-only routes
  if (isAdminRoute) {
    // Not authenticated: go straight to login (avoid double redirects)
    if (!session?.user?.userId) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
    // Authenticated but not admin
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  // Protected routes (folder-scoped)
  if (isProtectedRoute && !session?.user?.userId) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  // Public routes: bounce authenticated users to dashboard
  if (
    isPublicRoute &&
    session?.user?.userId &&
    !isPathUnder(path, PROTECTED_PREFIX)
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  // Exclude APIs, Next internals, data routes, and any path with a file extension
  matcher: ["/((?!api|_next/static|_next/image|_next/data|.*\\..*$).*)"],
};
