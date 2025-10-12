import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    //    ppr: "incremental",
    typedEnv: true,
  },
  output: "standalone",
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
