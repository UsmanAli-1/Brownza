import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social";
import { siteConfig } from "@/config/site";
import { CONTACT, NAV_LINKS } from "@/lib/constants";
import { categories } from "@/data/categories";

const TECHMORPH_URL = "https://techmorphinnovation.site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cocoa-gradient text-primary-foreground">
      <Container className="pt-10 pb-4  ">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Logo invert size="lg" />
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              {siteConfig.description}
            </p>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                Follow us
              </span>
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
                  href={CONTACT.facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <FacebookIcon className="size-5" />
                </a>
              </div>
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
                <Phone className="mt-0.5 size-5 shrink-0 text-accent" />
                <a
                  href={CONTACT.phoneHref}
                  className="transition-colors hover:text-accent"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-accent" />
                <a
                  href={CONTACT.emailHref}
                  className="transition-colors hover:text-accent"
                >
                  {CONTACT.emailDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{CONTACT.city}</span>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Bottom credit line — matches the reference layout: a single row
          with the copyright/year (auto-updates via `new Date().getFullYear()`,
          so it never needs a manual edit again) and the Techmorph Innovation
          logo + link, with no Brownza branding on this specific line (the
          brand name lives above, in the main footer grid).
        */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-primary-foreground/10 pt-4 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {year} All rights reserved.</p>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-2">
            Powered by
            <a
              href={TECHMORPH_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Techmorph Innovation"
              className="inline-flex transition-opacity hover:opacity-80"
            >
             <Image
                src="/company_logo/tI-logo.png"
                alt="Techmorph Innovation"
                width={160}
                height={48}
                className="h-8 w-auto shrink-0 object-contain sm:h-9"
              />
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}