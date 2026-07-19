"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";
import { getProductById } from "@/data/products";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import type { CartTotals, DetailedCartLine } from "@/types";

/**
 * Resolve raw cart lines against the catalogue and compute all totals.
 * Single source of truth for cart maths — used by the cart page, checkout
 * summary and anywhere totals are shown, so numbers never drift.
 */
export function useDetailedCart(): {
  lines: DetailedCartLine[];
  totals: CartTotals;
  isEmpty: boolean;
} {
  const items = useCartStore((s) => s.items);

  return useMemo(() => {
    const lines: DetailedCartLine[] = [];
    for (const item of items) {
      const product = getProductById(item.productId);
      // Silently skip lines whose product no longer exists in the catalogue.
      if (!product) continue;
      lines.push({
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    const delivery =
      subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;

    return {
      lines,
      totals: { subtotal, delivery, total, itemCount },
      isEmpty: lines.length === 0,
    };
  }, [items]);
}

/** Total number of units across all lines — for the navbar cart badge. */
export function useCartCount(): number {
  return useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
}

/** Current quantity of a single product in the cart (0 if absent). */
export function useItemQuantity(productId: string): number {
  return useCartStore(
    (s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0,
  );
}
