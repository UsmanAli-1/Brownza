"use client";

import { useMenuSearchStore } from "@/lib/menu-search-store";
import { ProductGrid } from "@/components/product/product-grid";
import type { Category, Product } from "@/types";

interface MenuContentProps {
  categories: readonly Category[];
  productsByCategory: Record<string, Product[]>;
}

/** Category sections, filtered by the submitted menu search query. */
export function MenuContent({ categories, productsByCategory }: MenuContentProps) {
  const query = useMenuSearchStore((s) => s.query);
  const normalized = query.trim().toLowerCase();

  return (
    <div className="flex flex-col gap-12">
      {categories.map((category) => {
        const items = productsByCategory[category.slug] ?? [];
        if (items.length === 0) return null;

        const filtered = normalized
          ? items.filter(
              (product) =>
                product.name.toLowerCase().includes(normalized) ||
                product.description.toLowerCase().includes(normalized),
            )
          : items;

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
