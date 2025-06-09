import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		ppr: "incremental",
		authInterrupts: true,
	},
};

export default nextConfig;
