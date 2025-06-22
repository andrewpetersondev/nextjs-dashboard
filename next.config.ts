import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		dirs: ["src"],
	},
	experimental: {
		authInterrupts: true,
		ppr: "incremental",
	},
	output: "standalone",
	reactStrictMode: true,
	typescript: {
		tsconfigPath: "./tsconfig.json",
	},
};

export default nextConfig;
