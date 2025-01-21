import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/dal";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/protected"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  // ai
  const { isAuth, userId } = await verifySession();
  console.log("isAuth", isAuth);
  console.log("userId", userId);

  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  console.log("path", path);
  console.log("isProtectedRoute", isProtectedRoute);
  console.log("isPublicRoute", isPublicRoute);

  // 3. Decrypt the session from the cookie
  // const cookie = (await cookies()).get("session")?.value;
  // const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  // if (isProtectedRoute && !session?.userId) {
  //   return NextResponse.redirect(new URL("/login", req.nextUrl));
  // }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 5. option b
  //   if (isPublicRoute && session?.userId) {
  //       return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  //   }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};