import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/constants";
import ctaImg from "@/public/images/products/product-1.png";

/** Bottom-of-menu conversion band. Reuses the "Craving Something Sweet" look. */
export function CtaBand() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-cocoa-gradient px-6 py-16 shadow-card sm:px-12 md:py-20">
          <Image
            src={ctaImg}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="-z-10 object-cover opacity-15 mix-blend-overlay"
          />
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-balance font-heading text-3xl font-semibold text-primary-foreground sm:text-4xl">
              Craving something sweet?
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-primary-foreground/80">
              Planning an event, a large order, or something custom? Pre-order
              ahead and we&apos;ll bake it fresh, just for you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/pre-order">Pre Order</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href={CONTACT.phoneHref}>
                  <Phone />
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
