import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		ppr: "incremental",
	},
	output: "standalone",
};

export default nextConfig;
