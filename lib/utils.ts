import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with correct conflict resolution.
 * Standard shadcn/ui helper used across every component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a whole-rupee amount as a currency string (e.g. `Rs 2,200`).
 * Currency is centralised here so it can be swapped in one place later.
 */
export function formatPrice(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

/** Human relative time, e.g. "just now", "15 minutes ago", "yesterday". */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
  });
}
