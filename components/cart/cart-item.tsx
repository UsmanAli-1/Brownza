"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

export function CartItem({
  product,
  variant,
  quantity,
  unitPrice,
  note,
}: {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  note?: string;
}) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <li className="flex gap-4 py-5">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-28">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold text-foreground sm:text-lg">
              {product.name}
            </h3>
            {variant ? (
              <p className="text-xs text-muted-foreground">{variant.label}</p>
            ) : (
              product.serves && (
                <p className="text-xs text-muted-foreground">{product.serves}</p>
              )
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {formatPrice(unitPrice)} each
            </p>
            {note && (
              <p className="mt-1 text-xs italic text-muted-foreground">
                Note: {note}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id, variant?.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Trash2 className="size-5" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantitySelector
            value={quantity}
            onChange={(q) => setQuantity(product.id, q, variant?.id)}
            size="sm"
            ariaLabel={`Quantity for ${product.name}`}
          />
          <span className="font-heading text-base font-semibold tabular-nums text-primary sm:text-lg">
            {formatPrice(unitPrice * quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}