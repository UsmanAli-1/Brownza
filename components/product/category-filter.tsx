"use client";

import * as React from "react";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { slug: "favourites", name: "Favourites" },
  ...categories.map((c) => ({ slug: c.slug, name: c.name })),
] as const;

/**
 * Category pills that jump to the matching menu section instead of
 * filtering products out — every section always stays on the page.
 * Highlights whichever section is currently in view via IntersectionObserver,
 * and keeps the active pill centered in its scroll container.
 */
export function CategoryFilter() {
  const [active, setActive] = React.useState<string>("favourites");
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement>());
  // Skip the very first auto-center pass — it was firing scrollIntoView on
  // mount (active starts as "favourites"), which could nudge the page's
  // scroll position right after load. Only user-driven / observed changes
  // after the initial render should trigger the centering scroll.
  const isFirstRun = React.useRef(true);

  React.useEffect(() => {
    const sections = OPTIONS.map((o) => document.getElementById(o.slug)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    buttonRefs.current.get(active)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const scrollToSection = (slug: string) => {
    document.getElementById(slug)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Jump to category"
      className="scrollbar-hide flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-1 sm:justify-center"
    >
      {OPTIONS.map((option) => {
        const isActive = active === option.slug;
        return (
          <button
            key={option.slug}
            ref={(el) => {
              if (el) buttonRefs.current.set(option.slug, el);
              else buttonRefs.current.delete(option.slug);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => scrollToSection(option.slug)}
            className={cn(
              "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:border-accent hover:text-primary",
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}