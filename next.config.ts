import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict production-grade defaults.
  reactStrictMode: true,
  // Keep Mongoose out of the bundle; load it at runtime on the server.
  serverExternalPackages: ["mongoose"],
  // Brownza is a cloud bakery — the menu is the home. Redirect the root
  // to it with a real HTTP redirect (better for SEO than a meta refresh).
  // Permanent (308) since this mapping is structural, not temporary — a
  // 302 here would tell search engines not to transfer link equity to
  // /products, which is exactly what we want them to index.
  async redirects() {
    return [
      { source: "/", destination: "/products", permanent: true },
      // Both brownza.shop and www.brownza.shop currently resolve — without
      // this, search engines see two separate sites splitting the same
      // content's authority/backlinks in half. www is redirected to the
      // canonical apex domain (config/site.ts's siteConfig.url).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.brownza.shop" }],
        destination: "https://brownza.shop/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    // Temporary remote source for royalty-free landscape/lifestyle imagery.
    // Replace these with owned assets (e.g. Cloudinary) in a later phase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Payment screenshots (and any future menu assets) served from Cloudinary.
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Modern formats first for smaller payloads.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
