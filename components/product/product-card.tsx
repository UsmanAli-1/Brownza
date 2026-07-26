import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductCardCta } from "@/components/product/product-card-cta";
import { getStartingPrice } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Product card shell (Server Component). Static presentation only; the
 * interactive add-to-cart controls (or variant-select modal trigger) are a
 * nested Client Component.
 * Compact and premium at 2-up on mobile through 4-up on desktop.
 */
export function ProductCard({ product }: { product: Product }) {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const price = getStartingPrice(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 ease-lux hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-lux group-hover:scale-105"
        />
        {product.badge && (
          <Badge className="absolute left-2 top-2 shadow-sm">
            {product.badge}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading text-sm font-semibold leading-snug text-foreground sm:text-base">
              {product.name}
            </h3>
            {product.serves && (
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {product.serves}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <span className="font-heading text-base font-semibold text-primary sm:text-lg">
            {hasVariants && <span className="mr-1 text-xs font-medium text-muted-foreground">From</span>}
            {formatPrice(price)}
          </span>
          <ProductCardCta product={product} />
        </div>
      </div>
    </article>
  );
}