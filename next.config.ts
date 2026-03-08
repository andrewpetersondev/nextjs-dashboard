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
		// TODO: IS THIS SUPPOSED TO BE THE PATH OF THE TSCONFIG WHERE THIS FILE IS INCLUDED? OR IS IT SUPPOSED TO
		//  BE THE PATH FOR THE NEXT APP? BASICALLY, TSCONFIG.ROOT-TOOLS.JSON VS TSCONFIG.APP.JSON
		tsconfigPath: "tsconfig.app.json",
	},
};

export default nextConfig;
