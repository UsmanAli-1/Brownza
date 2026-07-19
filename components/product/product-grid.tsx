import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductGridProps {
  products: readonly Product[];
  className?: string;
}

/**
 * Responsive product grid — 2 columns on mobile, up to 4 on desktop.
 *
 * Intentionally has no scroll-reveal animation: it is often re-rendered when
 * the category filter changes, and a `whileInView`/`once` reveal would leave
 * freshly-mounted cards stuck at opacity:0 after client-side navigation.
 * Keep it plain so filtering is always instant and correct.
 */
export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
