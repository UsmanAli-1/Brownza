import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { MenuHero } from "@/components/menu/menu-hero";
import { PopularFavorites } from "@/components/menu/popular-favorites";
import { CategoryFilter } from "@/components/product/category-filter";
import { ProductSearch } from "@/components/product/product-search";
import { MenuContent } from "@/components/product/menu-content";
import { getProductsByCategory } from "@/data/products";
import { categories } from "@/data/categories";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the Brownza menu — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna. Freshly baked to order and delivered across Karachi.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  const productsByCategory = categories.reduce<Record<string, Product[]>>(
    (acc, category) => {
      acc[category.slug] = getProductsByCategory(category.slug);
      return acc;
    },
    {},
  );

  return (
    <>
      <MenuHero />

      <div className="sticky top-0 z-30 border-b border-border bg-muted/95 py-3 backdrop-blur-sm">
        <Container>
          <CategoryFilter />
        </Container>
      </div>

      <div className="py-8">
        <Container>
          <ProductSearch />
        </Container>
      </div>

      <PopularFavorites />

      <section className="border-t border-border bg-muted/30 py-14 md:py-20">
        <Container>
          <MenuContent categories={categories} productsByCategory={productsByCategory} />
        </Container>
      </section>
    </>
  );
}
