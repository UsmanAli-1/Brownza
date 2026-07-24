import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  // Categories are in-page anchors on /products now (not separate filtered
  // routes), so there is nothing distinct for search engines to index there.
  return [
    // The menu is the primary landing page ( / redirects here ).
    {
      url: `${base}/products`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/pre-order`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
