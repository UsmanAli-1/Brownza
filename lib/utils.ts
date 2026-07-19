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
