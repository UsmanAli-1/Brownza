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
  // Canonical production domain. Vercel's own domain config redirects
  // brownza.shop -> www.brownza.shop (confirmed via curl -I), so this MUST
  // be the www version to match — every canonical/OG/JSON-LD URL here needs
  // to point at whichever host actually serves the final 200, not a
  // redirect hop, or crawlers see a mismatch between what this site claims
  // as canonical and what it actually resolves to.
  url: "https://www.brownza.shop",
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
