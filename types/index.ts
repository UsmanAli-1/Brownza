/**
 * Domain types shared across the app.
 * Kept framework-agnostic so a future backend (MongoDB/API) can reuse them.
 */

export type CategorySlug = "cookies" | "brownies" | "dumplings" | "lasagna";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short editorial line shown on category tiles. */
  tagline: string;
  description: string;
}

/** A single purchasable option on a product (e.g. "Pack of 6", "Medium"). */
export interface ProductVariant {
  id: string;
  label: string;
  /** Price in PKR (whole rupees) for this specific variant. */
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line description for cards. */
  description: string;
  /**
   * Base price in PKR. If `variants` is set, this is ignored for
   * cart/checkout math and only used as a fallback display value.
   */
  price: number;
  category: CategorySlug;
  /** Public path or remote URL. Replaced per-product in a later phase. */
  image: string;
  featured: boolean;
  /** Whether the item can currently be ordered. */
  available: boolean;
  /** Optional merchandising label, e.g. "Bestseller". */
  badge?: string;
  /** Portion/serving hint, e.g. "Serves 6–8" or "6 pcs". */
  serves?: string;
  /**
   * If present, the product is sold in fixed size/pack options and the
   * product card opens a selection modal instead of a direct add-to-cart.
   */
  variants?: readonly ProductVariant[];
}

/** A single line stored in the cart (product + optional variant reference). */
export interface CartLine {
  productId: string;
  /** Present only for products that have `variants`. */
  variantId?: string;
  quantity: number;
  /** Optional free-text note from the customer (e.g. "less sugar please"). */
  note?: string;
}

/** A cart line resolved against the catalogue for rendering. */
export interface DetailedCartLine {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  /** Resolved unit price — variant price if applicable, else product.price. */
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

export interface CartTotals {
  subtotal: number;
  delivery: number;
  total: number;
  itemCount: number;
}

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "out-for-delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];