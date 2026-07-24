import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { InstagramIcon } from "@/components/icons/social";
import { siteConfig } from "@/config/site";
import { CONTACT, NAV_LINKS } from "@/lib/constants";
import { categories } from "@/data/categories";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cocoa-gradient text-primary-foreground">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Logo invert />
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={CONTACT.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
              >
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer" className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold">Explore</h2>
            <ul className="flex flex-col gap-2.5 text-sm text-primary-foreground/70">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" className="transition-colors hover:text-accent">
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          {/* Menu categories */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold">Our Menu</h2>
            <ul className="flex flex-col gap-2.5 text-sm text-primary-foreground/70">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products#${category.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — cloud bakery, no physical address */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold">Get in touch</h2>
            <ul className="flex flex-col gap-3.5 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{CONTACT.city}, Pakistan</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-accent" />
                <a
                  href={CONTACT.phoneHref}
                  className="transition-colors hover:text-accent"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-5 shrink-0 text-accent" />
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <InstagramIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                <a
                  href={CONTACT.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {CONTACT.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Handcrafted daily · Freshly baked to order.</p>
        </div>
      </Container>
    </footer>
  );
}
