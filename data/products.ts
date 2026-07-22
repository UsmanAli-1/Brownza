import type { CategorySlug, Product } from "@/types";

/**
 * Static product catalogue — the real Brownza menu (from the menu posters).
 *
 * There is currently a single product photo. Every product intentionally
 * reuses it via `PLACEHOLDER_IMAGE`; drop per-product images (or Cloudinary
 * URLs) in here later without touching any component.
 *
 * Badges are assigned intentionally from a fixed vocabulary:
 * Signature · Best Seller · Popular · Fresh · Customer Favorite · Limited.
 */
const PLACEHOLDER_IMAGE = "/images/products/logo.png";

export const products: readonly Product[] = [
  // ---- Cookies ----
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
    serves: "1 jumbo cookie",
  },
  {
    id: "triple-chocolate-nutella-cookie",
    slug: "triple-chocolate-nutella-cookie",
    name: "Triple Chocolate Cookie Filled with Nutella",
    description: "Dark, milk and white chocolate with an oozing Nutella centre.",
    price: 450,
    category: "cookies",
    image: "/images/products/triple_choclate_cookie.png",
    featured: false,
    available: true,
    badge: "Popular",
    serves: "1 jumbo cookie",
  },

  // ---- Brownies ----
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
    serves: "Box of 6",
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
    serves: "Box of 6",
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
    serves: "Box of 6",
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
    serves: "Box of 6",
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
    serves: "Box of 6",
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
    serves: "Box of 6",
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
    serves: "Box of 12",
  },
  {
    id: "customize-brownie",
    slug: "customize-brownie",
    name: "Customize Brownie",
    description: "Build your own box — pick your toppings and make it yours.",
    price: 1400,
    category: "brownies",
    image: "/images/products/customized_brownie.png",
    featured: false,
    available: true,
    badge: "Limited",
    serves: "Box of 6",
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
  },

  // ---- Dumplings ----
  {
    id: "dumplings-6",
    slug: "dumplings-6",
    name: "Steamed Dumplings — 6 Pieces",
    description: "Hand-folded, juicy dumplings steamed to order with house dip.",
    price: 400,
    category: "dumplings",
    image: PLACEHOLDER_IMAGE,
    featured: false,
    available: true,
    badge: "Fresh",
    serves: "6 pieces",
  },
  {
    id: "dumplings-12",
    slug: "dumplings-12",
    name: "Steamed Dumplings — 12 Pieces",
    description: "A dozen hand-folded steamed dumplings with our house dip.",
    price: 800,
    category: "dumplings",
    image: PLACEHOLDER_IMAGE,
    featured: false,
    available: true,
    serves: "12 pieces",
  },

  // ---- Lasagna ----
  {
    id: "lasagna",
    slug: "lasagna",
    name: "Lasagna ",
    description: "Layered pasta, rich sauce and molten cheese, baked golden.",
    price: 400,
    category: "lasagna",
    image: "/images/products/lasagne.png",
    featured: false,
    available: true,
    serves: "",
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
