"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, MapPin, Phone, ShoppingBag } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/constants";
import { useCartCount } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocationStore } from "@/lib/location-store";
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
  const pathname = usePathname();
  const savedArea = useLocationStore((s) => s.area);
  const savedLabel = useLocationStore((s) => s.label);
  const openLocationPicker = useLocationStore((s) => s.openPicker);
  const locationLabel = hydrated ? savedLabel || savedArea || CONTACT.city : CONTACT.city;

  // Hide the cart icon on /cart and /checkout — you're already looking at
  // (or finishing) the cart there, so the icon is redundant on those pages.
  const hideCartIcon = pathname === "/cart" || pathname.startsWith("/checkout");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "relative z-40 w-full border-b transition-all duration-300 ease-lux",
        scrolled
          ? "border-border bg-[#F2E9E2]/95 shadow-soft backdrop-blur-md"
          : "border-transparent bg-[#F2E9E2]/80 backdrop-blur-sm",
      )}
    >
      <Container className="relative flex h-16 items-center gap-3 md:h-20 lg:h-24">
        {/* Left cluster: delivery location + phone, as pill buttons.
            Hidden below md — the floating logo sits at the left edge on
            mobile/tablet and would otherwise overlap/intercept clicks. */}
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <button
            type="button"
            onClick={openLocationPicker}
            aria-label="Choose delivery area"
            className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-soft transition-colors hover:border-accent"
          >
            <MapPin className="size-4 shrink-0 text-accent" />
            <span className="max-w-[160px] truncate">{locationLabel}</span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          </button>

          
          <a  href={CONTACT.phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-soft transition-colors hover:border-accent"
          >
            <Phone className="size-4 shrink-0 text-accent" />
            {CONTACT.phoneDisplayIntl}
          </a>
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
          {/* Below md — compact icon-only equivalents of the left pills
              (which are hidden here to avoid the floating logo). */}
          <button
            type="button"
            onClick={openLocationPicker}
            aria-label="Choose delivery area"
            className="inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          >
            <MapPin className="size-5" />
          </button>
          
          <a href={CONTACT.phoneHref}
            aria-label="Call us"
            className="inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          >
            <Phone className="size-5" />
          </a>

          {!hideCartIcon && <CartLink count={count} hydrated={hydrated} />}

          <Button asChild size="sm" className="max-md:px-3">
            <Link href="/pre-order">Pre Order</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}