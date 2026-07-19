"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/icons/social";
import { CONTACT, NAV_LINKS } from "@/lib/constants";
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
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const hydrated = useHydrated();
  const count = useCartCount();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The menu closes when any item inside it is clicked (see the mobile menu's
  // onClick below), so there's no route-change effect to reset it.
  const closeMenu = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300 ease-lux",
        scrolled
          ? "border-border bg-background/90 shadow-soft backdrop-blur-md"
          : "border-transparent bg-background/75 backdrop-blur-sm",
      )}
    >
      <Container className="relative flex h-16 items-center justify-between gap-3 md:h-20 lg:h-24">
        {/* Desktop: left cluster — phone + city */}
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

        {/* Mobile: logo left */}
        <Link
          href="/products"
          aria-label={`Brownza — menu`}
          className="md:hidden"
        >
          <Image
            src={logoImg}
            alt="Brownza"
            sizes="44px"
            className="size-10 rounded-full object-cover shadow-soft"
          />
        </Link>

        {/* Desktop: centered floating logo (overlaps navbar bottom ~20%) */}
        <Link
          href="/products"
          aria-label="Brownza — menu"
          className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 -translate-y-[78%] md:block"
        >
          <span className="block overflow-hidden rounded-full shadow-lift ring-1 ring-black/5 transition-transform duration-300 ease-lux hover:scale-105">
            <Image
              src={logoImg}
              alt="Brownza"
              sizes="112px"
              className="size-20 object-cover lg:size-24"
            />
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CartLink count={count} hydrated={hydrated} />

          {/* Mobile-only call button */}
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

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md md:hidden"
          >
            <Container onClick={closeMenu} className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/products"
                    ? pathname.startsWith("/products")
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-muted text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-border" />

              <div className="flex items-center gap-2 px-1">
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
                >
                  <Phone className="size-4 text-accent" />
                  Call
                </a>
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
                >
                  WhatsApp
                </a>
                <a
                  href={CONTACT.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-accent"
                >
                  <InstagramIcon className="size-4" />
                </a>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
