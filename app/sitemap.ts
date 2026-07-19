import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
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

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/products?category=${category.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
