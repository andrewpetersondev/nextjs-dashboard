import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		typedEnv: true,
		useTypeScriptCli: true, // TypeScript 7 no longer exposes the compiler API Next.js used
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
