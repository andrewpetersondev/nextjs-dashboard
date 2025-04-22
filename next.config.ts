import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint: {
  //   dirs: ["src", "cypress"],
  // },
  experimental: {
    // nodeMiddleware: true,
    // ppr: "incremental",
    // typedRoutes: true,
  },
};

export default nextConfig;
