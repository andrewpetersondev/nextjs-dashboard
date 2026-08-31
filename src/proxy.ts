import {
	type MiddlewareConfig,
	type NextRequest,
	NextResponse,
} from "next/server";
import { authorizeRequestHelper } from "@/modules/auth/application/shared/helpers/authorize-request.helper";
import { sessionTokenServiceFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-token-service.factory";
import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/session/types/session-cookie.constants";
import { isDev } from "@/shared/core/config/shared/env-shared";
import {
	buildContentSecurityPolicy,
	generateCspNonce,
	HEADER_CONTENT_SECURITY_POLICY,
	HEADER_NONCE,
} from "@/shared/http/server/security-headers";
import {
	isAdminRoute,
	isProtectedRoute,
	isPublicRoute,
	normalizePath,
	ROUTES,
} from "@/shared/routing/routes";
import { logger as defaultLogger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/** Characters of a UUID kept when synthesising a request id, enough to disambiguate in logs. */
const REQUEST_ID_SUFFIX_LENGTH = 8;

/**
 * Per-request CSP context.
 *
 * @remarks
 * The nonce has to reach two places to work: the **request** headers, which is
 * where Next.js looks when deciding what to stamp on its own bootstrap scripts,
 * and the **response** headers, which is what the browser enforces. Miss either
 * and the page silently loses all of its JavaScript.
 */
function buildCspContext(req: NextRequest): Readonly<{
	policy: string;
	requestHeaders: Headers;
}> {
	const nonce = generateCspNonce();
	const policy = buildContentSecurityPolicy(nonce, isDev());

	const requestHeaders = new Headers(req.headers);
	requestHeaders.set(HEADER_NONCE, nonce);
	requestHeaders.set(HEADER_CONTENT_SECURITY_POLICY, policy);

	return { policy, requestHeaders };
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: every exit must pass through withCsp/nextWithCsp, so the response paths are deliberately kept in one function where that invariant is checkable by eye.
export default async function proxy(req: NextRequest): Promise<NextResponse> {
	const csp = buildCspContext(req);

	/**
	 * Every exit below must go through one of these two helpers — a response that
	 * skips them ships an un-protected document. The other half of that invariant
	 * is the matcher at the bottom of this file: a path the matcher excludes never
	 * reaches this function at all, and Next answers unmatched paths with a full
	 * HTML 404. Both halves are asserted by `devtools/cli/csp-guard.cli.ts`.
	 */
	const withCsp = (res: NextResponse): NextResponse => {
		res.headers.set(HEADER_CONTENT_SECURITY_POLICY, csp.policy);
		return res;
	};
	const nextWithCsp = (): NextResponse =>
		withCsp(NextResponse.next({ request: { headers: csp.requestHeaders } }));

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
		`mw-${crypto.randomUUID().slice(0, REQUEST_ID_SUFFIX_LENGTH)}`;

	const logger = defaultLogger
		.withContext("auth:middleware")
		.withRequest(requestId);

	const path = normalizePath(req.nextUrl.pathname);

	// Option B: Compute mutually exclusive flags
	const isAdminRouteFlag = isAdminRoute(path);
	const isProtectedRouteFlag = !isAdminRouteFlag && isProtectedRoute(path);
	const isPublicRouteFlag =
		!(isAdminRouteFlag || isProtectedRouteFlag) && isPublicRoute(path);

	if (!(isProtectedRouteFlag || isAdminRouteFlag || isPublicRouteFlag)) {
		return nextWithCsp();
	}

	const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
	const sessionTokenService = sessionTokenServiceFactory(logger);

	const outcome = await authorizeRequestHelper(
		{
			cookie,
			isAdminRoute: isAdminRouteFlag,
			isProtectedRoute: isProtectedRouteFlag,
			isPublicRoute: isPublicRouteFlag,
			path,
		},
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

		return withCsp(NextResponse.redirect(new URL(outcome.to, req.nextUrl)));
	}

	return nextWithCsp();
}

/** Routes Middleware should not run on */
export const config: MiddlewareConfig = {
	// Prefix exclusions ONLY. An extension-based exclusion looks tidy but is a
	// hole: Next answers /nope.js (and .css/.txt/.html) with a full text/html
	// 404 document, so anything skipped by extension ships an HTML page with no
	// CSP at all. Must be a static literal for Next.js to statically analyze.
	matcher: ["/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)"],
};
