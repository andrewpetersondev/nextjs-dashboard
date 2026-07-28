import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		//    ppr: "incremental",
		typedEnv: true,
		useTypeScriptCli: true, // TypeScript 7 no longer exposes the compiler API Next.js used
	},
	output: "standalone",
	reactStrictMode: true,
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: false,
		tsconfigPath: "tsconfig.json",
	},
};

export default nextConfig;
