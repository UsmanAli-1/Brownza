"use client";

import { useMenuSearchStore } from "@/lib/menu-search-store";
import { ProductGrid } from "@/components/product/product-grid";
import type { Category, Product } from "@/types";

interface MenuContentProps {
  categories: readonly Category[];
  productsByCategory: Record<string, Product[]>;
  /** Featured products, shown as the first block so search reaches them too. */
  featuredProducts: Product[];
}

/**
 * Favourites + category sections, all filtered by the submitted menu search
 * query. Favourites lives here (not as a standalone section above the
 * search) so a search term actually reaches it instead of requiring a
 * scroll past an unfiltered block first.
 */
export function MenuContent({
  categories,
  productsByCategory,
  featuredProducts,
}: MenuContentProps) {
  const query = useMenuSearchStore((s) => s.query);
  const normalized = query.trim().toLowerCase();

  const matches = (product: Product) =>
    !normalized ||
    product.name.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized);

  const filteredFeatured = featuredProducts.filter(matches);

  return (
    <div className="flex flex-col gap-12">
      {(featuredProducts.length === 0 || filteredFeatured.length > 0) && (
        <div id="favourites" className="scroll-mt-24 flex flex-col gap-5">
          <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Popular Favorites
          </h3>
          {filteredFeatured.length > 0 ? (
            <ProductGrid products={filteredFeatured} />
          ) : (
            <p className="text-sm text-muted-foreground">No matches in Favourites.</p>
          )}
        </div>
      )}

      {categories.map((category) => {
        const items = productsByCategory[category.slug] ?? [];
        if (items.length === 0) return null;

        const filtered = items.filter(matches);

        return (
          <div
            key={category.slug}
            id={category.slug}
            className="scroll-mt-24 flex flex-col gap-5"
          >
            <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              {category.name}
            </h3>
            {filtered.length > 0 ? (
              <ProductGrid products={filtered} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No matches in {category.name}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}