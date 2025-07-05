import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/src/lib/auth/session-jwt";
import type { DecryptPayload } from "@/src/lib/definitions/session.types";

const protectedRoutes: string[] = ["/dashboard"];
const publicRoutes: string[] = ["/login", "/signup", "/"];
const adminRoutes: string[] = ["/dashboard/users"];

export default async function middleware(req: NextRequest) {
	const path: string = req.nextUrl.pathname;
	const isProtectedRoute: boolean = protectedRoutes.includes(path);
	const isPublicRoute: boolean = publicRoutes.includes(path);
	const isAdminRoute: boolean = adminRoutes.includes(path);

	// Retrieve the session cookie
	const cookie: string | undefined = (await cookies()).get("session")?.value;

	// Decrypt the session cookie to get the session data
	const session: DecryptPayload | undefined = await decrypt(cookie);

	// If the route is protected and the user is not authenticated, redirect to the login page
	if (isProtectedRoute && !session?.user?.userId) {
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	if (
		isAdminRoute &&
		(!session?.user?.userId || session.user.role !== "admin")
	) {
		return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
	}

	// If the route is public and the user is authenticated, redirect to the dashboard
	if (
		isPublicRoute &&
		session?.user?.userId &&
		!req.nextUrl.pathname.startsWith("/dashboard")
	) {
		return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
	}

	// Allow the request to proceed if no redirection is needed
	return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
