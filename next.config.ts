import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
// Relative, not aliased: next.config.ts is evaluated outside the app's module
// graph, so the `@/` paths from tsconfig are not available here.
import { STATIC_SECURITY_HEADERS } from "./src/shared/http/server/security-headers";

/**
 * The directory holding this file — i.e. the checkout Next is being run from.
 *
 * Derived, never hardcoded: sessions run in git worktrees under
 * `.claude/worktrees/`, so the absolute path differs per lane, and the repo has
 * been relocated wholesale before. A literal path would guard exactly one copy
 * and silently stop matching after either.
 */
const PROJECT_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)));

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
	/**
	 * Pin Turbopack's root to THIS checkout.
	 *
	 * Turbopack infers the root by walking up for a lockfile, and "files outside
	 * of the project root are not resolved". In a worktree it found two —
	 * this one and the primary checkout's — and picked the outer, so it rooted
	 * itself at the parent repo. It reports that on the FIRST COMPILE, not at
	 * boot, so `next dev` looks clean until the first request arrives.
	 *
	 * That is not just noise. The parent contains `.claude/worktrees/`, so an
	 * un-pinned root makes Turbopack watch every sibling lane's tree and resolve
	 * modules across them. Pinning keeps a lane's dev server inside its own lane.
	 *
	 * Harmless outside a worktree: there the resolved path is the repo root,
	 * which is what Turbopack would have inferred anyway.
	 *
	 * ⚠ CHANGING THIS INVALIDATES `.next` IN A WAY TURBOPACK DOES NOT DETECT.
	 *   A cache built under the old root resolves against stale `[project]/…`
	 *   paths, and the app fails at runtime with a misleading
	 *   `Could not find the module "[project]/src/app/…#default" in the React
	 *   Client Manifest. This is probably a bug in the React Server Components
	 *   bundler.` It is not a bundler bug — run `pnpm clean` and rebuild.
	 */
	turbopack: { root: PROJECT_ROOT },
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: false,
		tsconfigPath: "tsconfig.json",
	},
};

export default nextConfig;
