"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCartStore } from "@/lib/cart-store";
import { useItemQuantity } from "@/lib/use-cart";
import type { Product } from "@/types";

/**
 * Client interactive slice of a product card: pick a quantity, add to cart,
 * and see how many are already in the cart. Stacks vertically on mobile
 * (2-up) and sits inline from the `sm` breakpoint up.
 */
export function ProductCardActions({ product }: { product: Product }) {
  const [qty, setQty] = React.useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useItemQuantity(product.id);

  const handleAdd = () => {
    addItem(product.id, qty);
    toast.success("Added to cart", { description: `${qty} × ${product.name}` });
    setQty(1);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        <QuantitySelector
          value={qty}
          onChange={setQty}
          className="w-full justify-between sm:w-auto sm:justify-center"
          ariaLabel={`Quantity for ${product.name}`}
        />
        <Button
          onClick={handleAdd}
          className="w-full sm:flex-1"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag />
          Add
        </Button>
      </div>
      {inCart > 0 && (
        <p className="text-center text-[0.7rem] text-muted-foreground sm:text-xs">
          <Check className="mr-1 inline size-3.5 text-success" />
          {inCart} already in cart
        </p>
      )}
    </div>
  );
}
