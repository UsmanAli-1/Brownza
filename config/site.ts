/**
 * Central site configuration consumed by metadata, structured data,
 * the navbar and the footer. Update business details in one place.
 */
export const siteConfig = {
  name: "Brownza",
  /** Used in <title> templates and OG site name. */
  title: "Brownza — Cloud Bakery in Karachi | Cookies, Brownies & Desserts",
  description:
    "Brownza is a cloud bakery in Karachi — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna, freshly baked to order and delivered to your door.",
  // Canonical production domain — both brownza.shop and www.brownza.shop
  // resolve, so next.config.ts redirects www -> this apex domain to avoid
  // splitting SEO authority across two hostnames.
  url: "https://brownza.shop",
  ogImage: "/og-image.png",
  locale: "en_PK",
  keywords: [
    "Brownza",
    "Brownza bakery",
    "Brownza Karachi",
    "cloud bakery",
    "cloud bakery Karachi",
    "Karachi cloud bakery",
    "bakery in Karachi",
    "Karachi bakery",
    "online bakery Karachi",
    "brownies",
    "cookies",
    "Nutella brownie",
    "Nutella cookie Karachi",
    "steamed dumplings",
    "lasagna",
    "order dessert online",
    "dessert delivery Karachi",
    "cake delivery Karachi",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
