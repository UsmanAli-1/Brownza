"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ProductCardActions } from "@/components/product/product-card-actions";
import { ProductVariantModal } from "@/components/product/product-variant-modal";
import type { Product } from "@/types";

/**
 * Branches the card's call-to-action: variant products (packs/sizes) open a
 * selection modal; everything else keeps the direct qty + add-to-cart.
 */
export function ProductCardCta({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  if (!hasVariants) {
    return <ProductCardActions product={product} />;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="w-full"
        aria-label={`Choose a size for ${product.name}`}
      >
        Select options
      </Button>
      <ProductVariantModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}