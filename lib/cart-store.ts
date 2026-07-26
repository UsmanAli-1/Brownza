import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";
import { CART_STORAGE_KEY, MAX_QUANTITY_PER_ITEM } from "@/lib/constants";

/**
 * Global cart store.
 *
 * Stores `{ productId, variantId?, quantity, note? }` — never full product
 * snapshots — so persisted state stays small and prices are always resolved
 * live from the catalogue. A line is uniquely identified by
 * `productId + variantId` (two different variants of the same product are
 * separate lines; a variant-less product has at most one line).
 */
interface CartState {
  items: CartLine[];
  addItem: (
    productId: string,
    quantity?: number,
    variantId?: string,
    note?: string,
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string) => void;
  increment: (productId: string, variantId?: string) => void;
  decrement: (productId: string, variantId?: string) => void;
  clear: () => void;
}

const clampQty = (q: number): number =>
  Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(q)));

const sameLine = (
  line: CartLine,
  productId: string,
  variantId?: string,
): boolean => line.productId === productId && (line.variantId ?? null) === (variantId ?? null);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (productId, quantity = 1, variantId, note) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, productId, variantId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, productId, variantId)
                  ? {
                      ...i,
                      quantity: clampQty(i.quantity + quantity),
                      // Newer note wins if one was provided this time.
                      note: note !== undefined ? note : i.note,
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { productId, variantId, quantity: clampQty(quantity), note },
            ],
          };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      setQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, variantId) ? { ...i, quantity: clampQty(quantity) } : i,
          ),
        })),

      increment: (productId, variantId) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, variantId)
              ? { ...i, quantity: clampQty(i.quantity + 1) }
              : i,
          ),
        })),

      decrement: (productId, variantId) =>
        set((state) => ({
          // Decrement, then drop any line that reaches zero.
          items: state.items
            .map((i) =>
              sameLine(i, productId, variantId) ? { ...i, quantity: i.quantity - 1 } : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);