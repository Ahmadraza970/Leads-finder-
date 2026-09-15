import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // This project lives inside a larger workspace repo (multiple lockfiles).
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Serve images straight from the Unsplash CDN (which content-negotiates
    // WebP/AVIF via auto=format). No server-side optimizer to break or depend
    // on at runtime.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;