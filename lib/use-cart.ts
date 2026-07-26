"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";
import { getProductById, getVariant } from "@/data/products";
import { DELIVERY_CHARGE } from "@/lib/constants";
import type { CartTotals, DetailedCartLine } from "@/types";

/**
 * Resolve raw cart lines against the catalogue and compute all totals.
 * Single source of truth for cart maths — used by the cart page, checkout
 * summary and anywhere totals are shown, so numbers never drift.
 *
 * Delivery is always charged (Brownza does not offer free delivery) unless
 * the cart is empty.
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

      const variant = getVariant(product, item.variantId);
      const unitPrice = variant ? variant.price : product.price;

      lines.push({
        product,
        variant,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        note: item.note,
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    const delivery = subtotal === 0 ? 0 : DELIVERY_CHARGE;
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
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

/**
 * Current quantity of a product in the cart. For variant-less products,
 * pass only `productId`. For variant products, pass `variantId` too — a
 * product with no variantId will match a variant-less line only.
 */
export function useItemQuantity(productId: string, variantId?: string): number {
  return useCartStore(
    (s) =>
      s.items.find(
        (i) => i.productId === productId && (i.variantId ?? null) === (variantId ?? null),
      )?.quantity ?? 0,
  );
}