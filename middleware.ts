import { NextRequest, NextResponse } from "next/server";
// import { decrypt } from "@/lib/session";
// import { cookies } from "next/headers";
import { verifySession } from "@/lib/dal";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/protected"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const { isAuth, userId } = await verifySession();

  console.log("path", path);
  console.log("isAuth", isAuth);
  console.log("userId", userId);

  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  console.log("isProtectedRoute", isProtectedRoute);
  console.log("isPublicRoute", isPublicRoute);

  // Redirect to /login for protected routes if not authenticated
  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to /dashboard if user is authenticated but accessing public routes
  if (isPublicRoute && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};