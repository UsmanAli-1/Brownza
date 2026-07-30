/**
 * App-wide constants: commerce rules, navigation, delivery areas and business
 * contact info. Environment-driven values (phone, WhatsApp, delivery charge)
 * are read here once so nothing is hardcoded across the app.
 */

// ---- Env helpers ----
function envNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Digits only, converted to international (03XXXXXXXXX -> 92XXXXXXXXX). */
function toIntl(local: string): string {
  const digits = local.replace(/\D/g, "");
  return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
}

/** Pretty-print an 11-digit local number: 03719132611 -> 0371 9132611. */
function formatLocal(local: string): string {
  const d = local.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 4)} ${d.slice(4)}` : local;
}

// ---- Commerce (env-driven) ----
/**
 * Flat delivery charge (PKR), always applied — Brownza does not offer free
 * delivery. Source of truth: NEXT_PUBLIC_DELIVERY_CHARGE.
 */
export const DELIVERY_CHARGE = envNumber(
  process.env.NEXT_PUBLIC_DELIVERY_CHARGE,
  250,
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

// ---- Business details (env-driven; cloud bakery — Karachi, no address) ----
const PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "03719132611";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "03719132611";

export const CONTACT = {
  city: "Karachi",
  phoneDisplay: formatLocal(PHONE),
  /** International format for compact UI, e.g. "+923719132611". */
  phoneDisplayIntl: `+${toIntl(PHONE)}`,
  phoneHref: `tel:${PHONE.replace(/\s/g, "")}`,
  whatsappDisplay: formatLocal(WHATSAPP),
  whatsappHref: `https://wa.me/${toIntl(WHATSAPP)}`,
  instagramHandle: "@brownza_by_ayat_anas",
  instagramHref: "https://www.instagram.com/brownza_by_ayat_anas?igsh=OHQ2aXZqbmM4MHJn",
  facebookHref: "https://www.facebook.com/share/1Ha2iSiTHp/",
  emailDisplay: "brownzabyayatanas@gmail.com",
  emailHref: "mailto:brownzabyayatanas@gmail.com",
} as const;

// ---- Bank details for online payments (client-exposed; shown at checkout) ----
export const BANK_DETAILS = {
  bank: process.env.NEXT_PUBLIC_BANK_NAME ?? "Meezan Bank",
  accountNumber:
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "99510104996453",
  accountHolder:
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE ?? "Masters Collection",
};

export interface SocialLink {
  label: string;
  href: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "Instagram", href: CONTACT.instagramHref },
  { label: "Facebook", href: CONTACT.facebookHref },
] as const;