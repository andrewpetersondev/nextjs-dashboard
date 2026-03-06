import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		//    ppr: "incremental",
		typedEnv: true,
	},
	output: "standalone",
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: false,
		tsconfigPath: "tsconfig.next.json",
	},
};

export default nextConfig;
