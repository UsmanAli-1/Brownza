"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, ShoppingBag } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/constants";
import { useCartCount } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import logoImg from "@/public/logo.png";

function CartLink({ count, hydrated }: { count: number; hydrated: boolean }) {
  return (
    <Link
      href="/cart"
      aria-label={`Cart${
        count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ", empty"
      }`}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-11"
    >
      <ShoppingBag className="size-5" />
      {hydrated && count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold text-accent-foreground shadow-sm"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const hydrated = useHydrated();
  const count = useCartCount();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300 ease-lux",
        scrolled
          ? "border-border bg-background/90 shadow-soft backdrop-blur-md"
          : "border-transparent bg-background/75 backdrop-blur-sm",
      )}
    >
      <Container className="relative flex h-16 items-center gap-3 md:h-20 lg:h-24">
        {/* Desktop: phone + city */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={CONTACT.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <Phone className="size-4 text-accent" />
            {CONTACT.phoneDisplay}
          </a>
          <span className="h-4 w-px bg-border" aria-hidden />
          <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-accent" aria-hidden>
              ●
            </span>
            {CONTACT.city}
          </span>
        </div>

        {/* Floating logo — left on mobile, centered on desktop; overlaps the
            navbar's bottom edge (~20%) for the premium floating look. */}
        <Link
          href="/products"
          aria-label="Brownza — menu"
          className="absolute left-5 top-full z-50 -translate-y-[78%] sm:left-8 md:left-1/2 md:-translate-x-1/2 lg:left-1/2"
        >
          <span className="block overflow-hidden rounded-full shadow-lift ring-1 ring-black/5 transition-transform duration-300 ease-lux hover:scale-105">
            <Image
              src={logoImg}
              alt="Brownza"
              sizes="112px"
              className="size-16 object-cover md:size-20 lg:size-24"
            />
          </span>
        </Link>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CartLink count={count} hydrated={hydrated} />

          {/* Mobile-only phone icon */}
          <a
            href={CONTACT.phoneHref}
            aria-label="Call us"
            className="inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          >
            <Phone className="size-5" />
          </a>

          <Button asChild size="sm" className="max-md:px-3">
            <Link href="/pre-order">Pre Order</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
