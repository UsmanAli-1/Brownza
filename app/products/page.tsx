import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { MenuHero } from "@/components/menu/menu-hero";
import { PopularFavorites } from "@/components/menu/popular-favorites";
import { CtaBand } from "@/components/menu/cta-band";
import { CategoryFilter } from "@/components/product/category-filter";
import { ProductGrid } from "@/components/product/product-grid";
import { getAllProducts, getProductsByCategory } from "@/data/products";
import { getCategory } from "@/data/categories";
import type { CategorySlug } from "@/types";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the Brownza menu — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna. Freshly baked to order and delivered across Karachi.",
  alternates: { canonical: "/products" },
};

const VALID_CATEGORIES: readonly CategorySlug[] = [
  "cookies",
  "brownies",
  "dumplings",
  "lasagna",
];

function isValidCategory(value: string | undefined): value is CategorySlug {
  return !!value && VALID_CATEGORIES.includes(value as CategorySlug);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = isValidCategory(category) ? category : undefined;
  const activeMeta = activeCategory ? getCategory(activeCategory) : undefined;
  const list = activeCategory
    ? getProductsByCategory(activeCategory)
    : getAllProducts();

  return (
    <>
      <MenuHero />

      {/* Popular Favorites is a curated showcase — only on the unfiltered view. */}
      {!activeCategory && <PopularFavorites />}

      <section
        id="menu"
        className="scroll-mt-24 border-t border-border bg-muted/30 py-14 md:py-20"
      >
        <Container className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="The Brownza menu"
              title={activeMeta ? activeMeta.name : "Handcrafted, Made to Order"}
              description={
                activeMeta
                  ? activeMeta.description
                  : "Freshly baked after you order — never frozen, never mass-produced. Explore everything we make."
              }
            />
          </Reveal>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={<div className="h-10" />}>
              <CategoryFilter />
            </Suspense>
            <p
              className="shrink-0 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {list.length} item{list.length === 1 ? "" : "s"}
            </p>
          </div>

          {list.length > 0 ? (
            <ProductGrid key={activeCategory ?? "all"} products={list} />
          ) : (
            <p className="py-16 text-center text-muted-foreground">
              No items found in this category.
            </p>
          )}
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
