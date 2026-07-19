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

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line description for cards. */
  description: string;
  /** Price in PKR (whole rupees). */
  price: number;
  category: CategorySlug;
  /** Public path or remote URL. Replaced per-product in a later phase. */
  image: string;
  featured: boolean;
  /** Optional merchandising label, e.g. "Bestseller". */
  badge?: string;
  /** Portion/serving hint, e.g. "Serves 6–8" or "6 pcs". */
  serves?: string;
}

/** A single line stored in the cart (product reference + quantity only). */
export interface CartLine {
  productId: string;
  quantity: number;
}

/** A cart line resolved against the catalogue for rendering. */
export interface DetailedCartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartTotals {
  subtotal: number;
  delivery: number;
  total: number;
  itemCount: number;
}

export type PaymentMethod = "cod" | "online";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

/** Snapshot of a placed order, shown on the success page. */
export interface PlacedOrder {
  id: string;
  customerName: string;
  phone: string;
  deliveryArea: string;
  paymentMethod: PaymentMethod;
  lines: DetailedCartLine[];
  totals: CartTotals;
  status: OrderStatus;
}
