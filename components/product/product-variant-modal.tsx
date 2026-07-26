"use client";

import * as React from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductVariantModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Size/pack selection modal for products sold in fixed variants (brownies,
 * dumplings, lasagna). Single-select radio pills + qty stepper + optional
 * note, priced live off the selected variant.
 */
export function ProductVariantModal({
  product,
  open,
  onOpenChange,
}: ProductVariantModalProps) {
  const variants = product.variants ?? [];
  const addItem = useCartStore((s) => s.addItem);

  const [variantId, setVariantId] = React.useState(variants[0]?.id ?? "");
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");

  // Reset local state whenever the modal is opened fresh for this product.
  // Adjusted during render (React's documented pattern for "reset on prop
  // change") rather than in an effect, so this doesn't cascade renders.
  const [resetKey, setResetKey] = React.useState(() => `${open}:${product.id}`);
  const nextResetKey = `${open}:${product.id}`;
  if (open && resetKey !== nextResetKey) {
    setResetKey(nextResetKey);
    setVariantId(variants[0]?.id ?? "");
    setQty(1);
    setNote("");
  } else if (resetKey !== nextResetKey) {
    setResetKey(nextResetKey);
  }

  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const linePrice = (selected?.price ?? 0) * qty;

  const handleAdd = () => {
    if (!selected) return;
    addItem(product.id, qty, selected.id, note.trim() || undefined);
    toast.success("Added to cart", {
      description: `${qty} × ${product.name} — ${selected.label}`,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      labelledBy="variant-modal-title"
      className="max-w-lg"
    >
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 pr-10">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2
              id="variant-modal-title"
              className="font-heading text-lg font-semibold leading-tight text-foreground"
            >
              {product.name}
            </h2>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>

        {/* Variant radio pills */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Choose a size</span>
          <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isActive = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "flex flex-1 min-w-[9.5rem] items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card hover:border-accent",
                  )}
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{v.label}</span>
                    <span className="text-xs text-muted-foreground">{formatPrice(v.price)}</span>
                  </span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      isActive ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {isActive && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} ariaLabel={`Quantity for ${product.name}`} />
        </div>

        {/* Optional note */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="variant-note" className="text-sm font-medium text-foreground">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="variant-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. less sugar, no walnuts…"
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading text-lg font-semibold text-primary">
            {formatPrice(linePrice)}
          </span>
          <Button onClick={handleAdd} size="sm">
            Add to cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}