"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { slug: "all", name: "All" },
  ...categories.map((c) => ({ slug: c.slug, name: c.name })),
] as const;

/**
 * Category pills that filter the menu via the `?category=` query param.
 * URL-driven so filters are shareable and server-rendered.
 *
 * On mobile this is a single, snap-scrolling row (food-delivery-app style);
 * pills never wrap. Must be rendered inside a <Suspense> boundary (uses
 * useSearchParams).
 */
export function CategoryFilter() {
  const params = useSearchParams();
  const active = params.get("category") ?? "all";

  return (
    <div
      role="tablist"
      aria-label="Filter menu by category"
      className="scrollbar-hide flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-1"
    >
      {OPTIONS.map((option) => {
        const isActive = active === option.slug;
        const href =
          option.slug === "all"
            ? "/products"
            : `/products?category=${option.slug}`;
        return (
          <Link
            key={option.slug}
            href={href}
            scroll={false}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:border-accent hover:text-primary",
            )}
          >
            {option.name}
          </Link>
        );
      })}
    </div>
  );
}
