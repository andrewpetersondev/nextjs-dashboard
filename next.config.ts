import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

// biome-ignore lint/style/noDefaultExport: <it is a Next.js config file>
export default nextConfig;
