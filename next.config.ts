import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict production-grade defaults.
  reactStrictMode: true,
  // Brownza is a cloud bakery — the menu is the home. Redirect the root
  // to it with a real HTTP redirect (better for SEO than a meta refresh).
  async redirects() {
    return [{ source: "/", destination: "/products", permanent: false }];
  },
  images: {
    // Temporary remote source for royalty-free landscape/lifestyle imagery.
    // Replace these with owned assets (e.g. Cloudinary) in a later phase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Modern formats first for smaller payloads.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
