"use client";

import * as React from "react";
import { ArrowRight, Search } from "lucide-react";
import { useMenuSearchStore } from "@/lib/menu-search-store";

/**
 * Menu search box. Self-contained (reads/writes the shared search store) so
 * it can be positioned anywhere on the page independent of the filtered
 * category sections. The product catalogue is static/hardcoded, so there's
 * no debounce to get right here — typing just updates the local input, and
 * submitting (button click or Enter) commits the query that actually
 * filters the sections.
 *
 * Exception: clearing the field back to empty commits immediately (rather
 * than waiting for Enter) so the full menu reliably comes back the moment
 * the box is emptied — matching what people expect from a search box.
 *
 * One pill: icon + input + a circular submit button, all inside the same
 * rounded container. The "grow on focus" scale is applied to that outer
 * container (not the input alone) so the icon/button — its siblings —
 * scale in lockstep instead of getting stacking-order fought over.
 */
export function ProductSearch() {
  const query = useMenuSearchStore((s) => s.query);
  const setQuery = useMenuSearchStore((s) => s.setQuery);
  const [value, setValue] = React.useState(query);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (next.trim() === "") {
      // Commit immediately on clear so results reset without needing Enter.
      setQuery("");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(value.trim());
      }}
      className="mx-auto w-full max-w-xl"
    >
      <div className="relative transition-transform duration-300 ease-lux focus-within:scale-[1.02]">
        <Search className="pointer-events-none absolute left-5 top-1/2 z-10 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search the menu…"
          aria-label="Search the menu"
          className="w-full rounded-full border border-border bg-card py-3.5 pl-12 pr-16 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-card sm:py-4 sm:text-base"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 sm:size-11"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
    </form>
  );
}