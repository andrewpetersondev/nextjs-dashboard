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
