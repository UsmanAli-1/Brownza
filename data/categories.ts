import type { Category, CategorySlug } from "@/types";

/**
 * Static category catalogue. Ordering here drives the category rails on the
 * menu page. Brownza does not sell cakes — categories are cookies, brownies,
 * dumplings and lasagna.
 */
export const categories: readonly Category[] = [
  {
    slug: "cookies",
    name: "Cookies",
    tagline: "Molten Nutella centres",
    description:
      "Soft-baked cookies with an oozing Nutella heart — freshly baked to order.",
  },
  {
    slug: "brownies",
    name: "Brownies",
    tagline: "Our signature fudge",
    description:
      "Dense, glossy-topped and unapologetically rich. Baked in small batches, boxed to share.",
  },
  {
    slug: "dumplings",
    name: "Dumplings",
    tagline: "Steamed fresh to order",
    description:
      "Hand-folded, juicy dumplings steamed on demand and served with our house dip.",
  },
  {
    slug: "lasagna",
    name: "Lasagna",
    tagline: "Layered & oven-baked",
    description:
      "Golden, bubbling and generously layered with rich sauce and melted cheese.",
  },
] as const;

export function getCategory(slug: CategorySlug): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
