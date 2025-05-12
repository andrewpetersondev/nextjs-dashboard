import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // nodeMiddleware: true,
    // ppr: "incremental",
  },
};

export default nextConfig;
