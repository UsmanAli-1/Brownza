/**
 * App-wide constants: commerce rules, navigation, delivery areas and business
 * contact info. Values that vary by environment (delivery fee) are read from
 * environment variables so nothing is hardcoded across the app.
 */

// ---- Commerce (env-driven) ----
function envNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Flat delivery fee (PKR). Source of truth: NEXT_PUBLIC_DELIVERY_FEE. */
export const DELIVERY_FEE = envNumber(process.env.NEXT_PUBLIC_DELIVERY_FEE, 250);
/** Subtotal (PKR) at/above which delivery is free. */
export const FREE_DELIVERY_THRESHOLD = envNumber(
  process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD,
  2500,
);
/** Max quantity per line item (guards the quantity stepper). */
export const MAX_QUANTITY_PER_ITEM = 20;

// ---- Storage keys ----
export const CART_STORAGE_KEY = "brownza-cart";
export const LOCATION_STORAGE_KEY = "brownza-delivery-area";
export const ORDER_COUNTER_KEY = "brownza-order-counter";

// ---- Navigation (menu-centric; no Home/Contact) ----
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/products", label: "Menu" },
  { href: "/pre-order", label: "Pre Order" },
] as const;

// ---- Delivery areas (Karachi) ----
export const DELIVERY_AREAS = [
  "DHA",
  "Clifton",
  "Gulshan",
  "Johar",
  "Nazimabad",
  "North Nazimabad",
  "PECHS",
  "Bahadurabad",
  "Malir",
  "Scheme 33",
  "Korangi",
  "Defence View",
  "Saddar",
  "Other",
] as const;

export type DeliveryArea = (typeof DELIVERY_AREAS)[number];
export const DEFAULT_DELIVERY_AREA: DeliveryArea = "Other";

// ---- Business details (Cloud Bakery — Karachi, no physical address) ----
export const CONTACT = {
  city: "Karachi",
  phoneDisplay: "+92 300 1234567",
  phoneHref: "tel:+923001234567",
  whatsappDisplay: "+92 300 1234567",
  whatsappHref: "https://wa.me/923001234567",
  instagramHandle: "@brownza",
  instagramHref: "https://instagram.com/brownza",
  // Kept for forms/metadata; not shown as a physical contact method.
  emailDisplay: "hello@brownza.com",
  emailHref: "mailto:hello@brownza.com",
} as const;

export interface SocialLink {
  label: string;
  href: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "Instagram", href: CONTACT.instagramHref },
] as const;
