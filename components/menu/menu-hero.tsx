import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import heroImg from "@/public/images/products/product-1.png";

/**
 * Menu hero — compact, premium dark bakery banner with a soft product-texture
 * overlay. On mobile it's heading-only (no paragraph / CTA) for a tighter,
 * elegant section. Server Component (no entrance animation) to protect LCP.
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

      <Container className="flex flex-col items-center gap-4 py-10 text-center sm:gap-5 sm:py-14 md:py-16 lg:py-20">
        <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs">
          <span className="h-px w-6 bg-accent" aria-hidden />
          Brownza · Cloud Bakery
        </span>
        <h1 className="max-w-3xl text-balance font-heading text-3xl font-semibold leading-[1.1] text-primary-foreground sm:text-4xl lg:text-5xl">
          Freshly Baked,
          <br />
          Made Just for You
        </h1>
        <p className="hidden max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:block sm:text-lg">
          Every order is freshly prepared after you place it. No frozen stock, no
          mass production—just handcrafted desserts and comfort food baked with
          care.
        </p>
        <Button asChild size="lg" variant="accent" className="hidden sm:inline-flex">
          <a href="#menu">
            Explore Menu
            <ArrowRight />
          </a>
        </Button>
      </Container>
    </section>
  );
}
