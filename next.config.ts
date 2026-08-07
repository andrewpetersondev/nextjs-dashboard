import type { NextConfig } from "next";
// Relative, not aliased: next.config.ts is evaluated outside the app's module
// graph, so the `@/` paths from tsconfig are not available here.
import { STATIC_SECURITY_HEADERS } from "./src/shared/http/server/security-headers";

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		typedEnv: true,
		useTypeScriptCli: true, // TypeScript 7 no longer exposes the compiler API Next.js used
	},
	/**
	 * Request-independent security headers, applied to every response.
	 *
	 * The Content-Security-Policy is NOT here — it carries a per-request nonce and
	 * so is built in `src/proxy.ts`.
	 */
	headers() {
		return Promise.resolve([
			{ headers: [...STATIC_SECURITY_HEADERS], source: "/:path*" },
		]);
	},
	/**
	 * Dev-server logging, scoped to the TEST environment.
	 *
	 * The e2e suite drives a real `next dev`, and `cypress-with-server.cli.ts`
	 * merges that server's stdout into the Cypress output. Next logs every
	 * incoming request and every Server Function invocation, which buried the
	 * actual test results: a full run printed ~1020 lines to report 47 passing
	 * tests, and roughly 400 of those were request/action traces.
	 *
	 * Scoped rather than global on purpose — `pnpm next:dev` keeps its request
	 * log, which is genuinely useful while developing. Only the test env, whose
	 * output nobody reads unless something failed, goes quiet.
	 *
	 * Both options are development-only and do not affect a production build.
	 * `DATABASE_ENV` is set by `.env.test.local`, loaded via the `env:test`
	 * wrapper before Next starts.
	 */
	logging:
		process.env.DATABASE_ENV === "test"
			? { incomingRequests: false, serverFunctions: false }
			: undefined,
	output: "standalone",
	poweredByHeader: false, // don't advertise the framework on every response
	reactStrictMode: true,
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: false,
		tsconfigPath: "tsconfig.json",
	},
};

export default nextConfig;
