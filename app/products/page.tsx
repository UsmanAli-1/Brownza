import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { MenuHero } from "@/components/menu/menu-hero";
import { PopularFavorites } from "@/components/menu/popular-favorites";
import { CategoryFilter } from "@/components/product/category-filter";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductsByCategory } from "@/data/products";
import { categories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the Brownza menu — Nutella-filled cookies, fudge brownies, steamed dumplings and oven-baked lasagna. Freshly baked to order and delivered across Karachi.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <MenuHero />

      <div className="sticky top-0 z-30 border-b border-border bg-muted/95 py-3 backdrop-blur-sm">
        <Container>
          <CategoryFilter />
        </Container>
      </div>

      <PopularFavorites />

      <section className="border-t border-border bg-muted/30 py-14 md:py-20">
        <Container className="flex flex-col gap-10">
          <Reveal>
            <SectionHeading
              eyebrow="The Brownza menu"
              title="Handcrafted, Made to Order"
              description="Freshly baked after you order — never frozen, never mass-produced. Explore everything we make."
            />
          </Reveal>

          <div className="flex flex-col gap-12">
            {categories.map((category) => {
              const items = getProductsByCategory(category.slug);
              if (items.length === 0) return null;
              return (
                <div
                  key={category.slug}
                  id={category.slug}
                  className="scroll-mt-24 flex flex-col gap-5"
                >
                  <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                    {category.name}
                  </h3>
                  <ProductGrid products={items} />
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
