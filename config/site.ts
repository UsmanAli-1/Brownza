/**
 * Central site configuration consumed by metadata, structured data,
 * the navbar and the footer. Update business details in one place.
 */
export const siteConfig = {
  name: "Brownza",
  /** Used in <title> templates and OG site name. */
  title: "Brownza — Freshly Baked Cloud Bakery",
  description:
    "A Karachi cloud bakery — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna, freshly baked to order and delivered to your door.",
  // Replace with the real production domain before deploying.
  url: "https://brownza.com",
  /** OG/Twitter share image — swap for a dedicated 1200×630 asset later. */
  ogImage: "/logo.png",
  locale: "en_PK",
  keywords: [
    "Brownza",
    "cloud bakery",
    "Karachi bakery",
    "brownies",
    "cookies",
    "Nutella brownie",
    "steamed dumplings",
    "lasagna",
    "order dessert online",
    "dessert delivery Karachi",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
