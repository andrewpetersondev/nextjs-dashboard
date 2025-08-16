import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    ppr: "incremental",
    typedEnv: true,
    typedRoutes: true,
  },
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
