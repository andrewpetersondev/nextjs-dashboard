import { decrypt } from "@/src/lib/session";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];
const adminRoutes = ["/dashboard/users"];

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.includes(path);
	const isPublicRoute = publicRoutes.includes(path);
	const isAdminRoute = adminRoutes.includes(path);

	// Retrieve the session cookie
	const cookie = (await cookies()).get("session")?.value;

	// Decrypt the session cookie to get the session data
	const session = await decrypt(cookie);

	// If the route is protected and the user is not authenticated, redirect to the login page
	if (isProtectedRoute && !session?.user?.userId) {
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	if (isAdminRoute) {
		if (!session?.user?.userId || session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
		}
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
