import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    root: ".",
  },
  // Ignore TypeScript and ESLint errors during build (for demo)

};

export default nextConfig;
