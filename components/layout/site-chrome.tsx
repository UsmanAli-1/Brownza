"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FloatingCartBar } from "@/components/cart/floating-cart-bar";

interface SiteChromeProps {
  navbar: ReactNode;
  footer: ReactNode;
  floating: ReactNode;
  locationGate: ReactNode;
  children: ReactNode;
}

/**
 * Renders the customer-facing chrome (navbar, footer, floating buttons,
 * location popup) around page content — except on `/admin`, which has its own
 * shell. Keeps the storefront layout untouched while isolating the dashboard.
 */
export function SiteChrome({
  navbar,
  footer,
  floating,
  locationGate,
  children,
}: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <main id="main" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      {navbar}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
      {floating}
      {locationGate}
      <FloatingCartBar />
    </>
  );
}