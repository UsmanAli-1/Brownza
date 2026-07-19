import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import heroImg from "@/public/images/products/product-1.png";

/**
 * Menu hero — premium dark bakery banner with a soft product-texture overlay.
 * The "Explore Menu" CTA smooth-scrolls to the full menu grid (#menu).
 * Kept as a Server Component (no entrance animation) to protect LCP/CLS.
 */
export function MenuHero() {
  return (
    <section className="relative isolate overflow-hidden bg-cocoa-gradient">
      <Image
        src={heroImg}
        alt=""
        aria-hidden
        fill
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover opacity-20 mix-blend-overlay"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-dark/40 via-dark/20 to-dark/70"
      />

      <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-28 lg:py-32">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <span className="h-px w-6 bg-accent" aria-hidden />
          Brownza · Cloud Bakery
        </span>
        <h1 className="max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.08] text-primary-foreground sm:text-5xl lg:text-6xl">
          Freshly Baked, Made Just for You
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
          Every order is freshly prepared after you place it. No frozen stock, no
          mass production—just handcrafted desserts and comfort food baked with
          care.
        </p>
        <Button asChild size="lg" variant="accent">
          <a href="#menu">
            Explore Menu
            <ArrowRight />
          </a>
        </Button>
      </Container>
    </section>
  );
}
