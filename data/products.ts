import type { CategorySlug, Product, ProductVariant } from "@/types";

/**
 * Static product catalogue — the real Brownza menu (from the menu posters).
 *
 * There is currently a single product photo. Every product intentionally
 * reuses it via `PLACEHOLDER_IMAGE`; drop per-product images (or Cloudinary
 * URLs) in here later without touching any component.
 *
 * Badges are assigned intentionally from a fixed vocabulary:
 * Signature · Best Seller · Popular · Fresh · Customer Favorite · Limited.
 *
 * PRICING NOTE: products with a `variants` array are sold in fixed
 * sizes/packs. `price` on those products is only a display fallback and is
 * never used for cart math — the modal always prices off the selected
 * variant. Dummy/placeholder prices are marked below; edit only here.
 */
const PLACEHOLDER_IMAGE = "/images/products/logo.png";

export const products: readonly Product[] = [
  // ---- Cookies (no variants — sold as single jumbo cookies) ----
 {
    id: "classic-nutella-cookie",
    slug: "classic-nutella-cookie",
    name: "Classic Cookie Filled with Nutella",
    description: "A soft-baked cookie with a warm, molten Nutella heart.",
    price: 450,
    category: "cookies",
    image: "/images/products/classic_cookie_2.png",
    featured: true,
    available: true,
    badge: "Signature",
    serves: "",
    variants: [
      { id: "single", label: "1 Piece", price: 450 },
      { id: "pack-6", label: "Pack of 6", price: 2700 }, // dummy — confirm bulk price
      { id: "pack-12", label: "Pack of 12", price: 5400 }, // dummy — confirm bulk price
    ],
  },
  {
    id: "triple-chocolate-nutella-cookie",
    slug: "triple-chocolate-nutella-cookie",
    name: "Triple Chocolate Cookie Filled with Nutella",
    description: "Dark, milk and white chocolate with an oozing Nutella centre.",
    price: 450,
    category: "cookies",
    image: "/images/products/triple_choclate_cookie_2.png",
    featured: false,
    available: true,
    badge: "Popular",
    serves: "",
    variants: [
      { id: "single", label: "1 Piece", price: 450 },
      { id: "pack-6", label: "Pack of 6", price: 2700 }, // dummy — confirm bulk price
      { id: "pack-12", label: "Pack of 12", price: 5400 }, // dummy — confirm bulk price
    ],
  },

  // ---- Brownies (pack of 6 / pack of 12) ----
  {
    id: "chocolate-fudge-brownie",
    slug: "chocolate-fudge-brownie",
    name: "Chocolate Fudge Brownie",
    description: "Our signature bake — dense, glossy-topped and molten-centred.",
    price: 1200,
    category: "brownies",
    image: "/images/products/classic_brownie.png",
    featured: true,
    available: true,
    badge: "Best Seller",
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1200 },
      { id: "pack-12", label: "Pack of 12", price: 2400 }, // dummy — confirm price
    ],
  },
  {
    id: "oreo-brownie",
    slug: "oreo-brownie",
    name: "Oreo Brownie",
    description: "Fudge brownie topped with cookies-and-cream and Oreo crumble.",
    price: 1300,
    category: "brownies",
    image: "/images/products/oreo_brownie.png",
    featured: true,
    available: true,
    badge: "Popular",
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1300 },
      { id: "pack-12", label: "Pack of 12", price: 2600 }, // dummy — confirm price
    ],
  },
  {
    id: "lotus-brownie",
    slug: "lotus-brownie",
    name: "Lotus Brownie",
    description: "Caramelised Biscoff spread and Lotus crunch over rich fudge.",
    price: 1400,
    category: "brownies",
    image: "/images/products/lotus_brownie.png",
    featured: true,
    available: true,
    badge: "Customer Favorite",
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1400 },
      { id: "pack-12", label: "Pack of 12", price: 2800 }, // dummy — confirm price
    ],
  },
  {
    id: "walnut-brownie",
    slug: "walnut-brownie",
    name: "Walnut Brownie",
    description: "Fudge brownie loaded with toasted, buttery walnuts.",
    price: 1300,
    category: "brownies",
    image: "/images/products/walnut_brownie.png",
    featured: false,
    available: true,
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1300 },
      { id: "pack-12", label: "Pack of 12", price: 2600 }, // dummy — confirm price
    ],
  },
  {
    id: "triple-chocolate-brownie",
    slug: "triple-chocolate-brownie",
    name: "Triple Chocolate Brownie",
    description: "Dark, milk and white chocolate folded into one decadent bake.",
    price: 1300,
    category: "brownies",
    image: "/images/products/triple_brownie.png",
    featured: false,
    available: true,
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1300 },
      { id: "pack-12", label: "Pack of 12", price: 2600 }, // dummy — confirm price
    ],
  },
  {
    id: "nutella-brownie",
    slug: "nutella-brownie",
    name: "Nutella Brownie",
    description: "Swirled and stuffed with hazelnut Nutella throughout.",
    price: 1300,
    category: "brownies",
    image: "/images/products/nutella_brownie.png",
    featured: false,
    available: true,
    badge: "Popular",
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 1300 },
      { id: "pack-12", label: "Pack of 12", price: 2600 }, // dummy — confirm price
    ],
  },
  {
    id: "brownie-bites",
    slug: "brownie-bites",
    name: "Brownie Bites",
    description: "Poppable, bite-sized fudge brownies — perfect for sharing.",
    price: 1000,
    category: "brownies",
    image: "/images/products/brownie_bites.png",
    featured: false,
    available: true,
    badge: "Fresh",
    serves: "Box of 12 or 24",
    variants: [
      { id: "pack-12", label: "Pack of 12", price: 1000 },
      { id: "pack-24", label: "Pack of 24", price: 2000 }, // dummy — confirm price
    ],
  },
  {
    id: "customize-brownie",
    slug: "customize-brownie",
    name: "Customize Brownie",
    description: "Build your own box — pick your toppings and make it yours.",
    price: 1400,
    category: "brownies",
    image: "/images/products/customized_brownie_2.png",
    featured: false,
    available: true,
    badge: "Limited",
    serves: "Box of 6 or 12",
    variants: [
      { id: "pack-6", label: "Box of 6", price: 1400 },
      { id: "pack-12", label: "Box of 12", price: 2800 }, // dummy — confirm bulk price
    ],
  },
  {
    id: "brownie-slab",
    slug: "brownie-slab",
    name: "Brownie Slab",
    description: "One generous, shareable slab of pure fudge indulgence.",
    price: 1400,
    category: "brownies",
    image: "/images/products/brownie_slob.png",
    featured: false,
    available: true,
    serves: "1 large slab",
    // Unchanged per your instruction — stays a simple single-item add.
  },

  // ---- Dumplings (pack of 6 / pack of 12) ----
  {
    id: "steamed-dumplings",
    slug: "steamed-dumplings",
    name: "Steamed Dumplings",
    description: "Hand-folded, juicy dumplings steamed to order with house dip.",
    price: 400,
    category: "dumplings",
    image: "/images/products/momos.png",
    featured: false,
    available: true,
    badge: "Fresh",
    serves: "Pack of 6 or 12",
    variants: [
      { id: "pack-6", label: "Pack of 6", price: 400 },
      { id: "pack-12", label: "Pack of 12", price: 800 }, // dummy — confirm price
    ],
  },

  // ---- Lasagna (small / medium / large) ----
  {
    id: "lasagna",
    slug: "lasagna",
    name: "Lasagna",
    description: "Layered pasta, rich sauce and molten cheese, baked golden.",
    price: 400,
    category: "lasagna",
    image: "/images/products/lasagne_2.png",
    featured: false,
    available: true,
    serves: "Small, medium or large",
    variants: [
      { id: "small", label: "Small", price: 400 },
      { id: "medium", label: "Medium", price: 800 }, // dummy — confirm price
      { id: "large", label: "Large", price: 1200 }, // dummy — confirm price
    ],
  },
] as const;

// ---- Selectors (backend-ready access helpers) ----

export function getAllProducts(): readonly Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = products.filter((p) => p.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

/** Resolve a specific variant on a product by id. */
export function getVariant(
  product: Product,
  variantId: string | undefined,
): ProductVariant | undefined {
  if (!variantId) return undefined;
  return product.variants?.find((v) => v.id === variantId);
}

/** The price to display on a card: lowest variant price, or the base price. */
export function getStartingPrice(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
}