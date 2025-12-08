import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Because we're deploying with Docker
};

export default nextConfig;
