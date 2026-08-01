import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { MenuHero } from "@/components/menu/menu-hero";
import { ScrollToTopOnLoad } from "@/components/menu/scroll-to-top-on-load";
import { CategoryFilter } from "@/components/product/category-filter";
import { ProductSearch } from "@/components/product/product-search";
import { MenuContent } from "@/components/product/menu-content";
import { getProductsByCategory, getFeaturedProducts } from "@/data/products";
import { categories } from "@/data/categories";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Menu — Cloud Bakery in Karachi",
  description:
    "Browse the Brownza menu — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna. A Karachi cloud bakery, freshly baked to order and delivered to your door.",
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
  const featuredProducts = getFeaturedProducts(4);

  return (
    <>
      <ScrollToTopOnLoad />
      <MenuHero />

      {/* The only visible on-page heading/copy for the site's actual
          homepage (`/` redirects here) — previously this page had no <h1>
          and no crawlable text mentioning what Brownza is or where it
          serves, just a hero image carousel and product cards. Search
          engines weigh visible body text far more than meta tags alone. */}
      <div className="py-6 text-center sm:py-8">
        <Container>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Brownza — Cloud Bakery in Karachi
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Nutella-filled cookies, fudge brownies, steamed dumplings and
            oven-baked lasagna — baked fresh to order and delivered across
            Karachi.
          </p>
        </Container>
      </div>

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

      <section className="border-t border-border bg-muted/30 py-4 md:py-10">
        <Container>
          <MenuContent
            categories={categories}
            productsByCategory={productsByCategory}
            featuredProducts={featuredProducts}
          />
        </Container>
      </section>
    </>
  );
}