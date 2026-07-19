import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { getFeaturedProducts } from "@/data/products";

/** Four featured products, showcased above the full menu. */
export function PopularFavorites() {
  const featured = getFeaturedProducts(4);
  if (featured.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <Container className="flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Loved by our customers"
            title="Popular Favorites"
            description="The bakes our customers come back for, again and again."
          />
        </Reveal>
        <ProductGrid products={featured} />
      </Container>
    </section>
  );
}
