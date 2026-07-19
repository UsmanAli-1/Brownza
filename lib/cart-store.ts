import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";
import { CART_STORAGE_KEY, MAX_QUANTITY_PER_ITEM } from "@/lib/constants";

/**
 * Global cart store.
 *
 * Stores only `{ productId, quantity }` line items — never full product
 * snapshots — so persisted state stays small and prices are always resolved
 * live from the catalogue. This mirrors how a real order line would reference
 * a product id in a backend, keeping the shape swap-ready.
 */
interface CartState {
  items: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
}

const clampQty = (q: number): number =>
  Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(q)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: clampQty(i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { productId, quantity: clampQty(quantity) }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clampQty(quantity) } : i,
          ),
        })),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: clampQty(i.quantity + 1) }
              : i,
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          // Decrement, then drop any line that reaches zero.
          items: state.items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i,
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
