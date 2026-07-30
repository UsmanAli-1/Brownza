"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  id?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  placeholder?: string;
  className?: string;
}

/**
 * A single flat, searchable dropdown: every option is always present, typing
 * just re-sorts matches to the top instead of hiding non-matches — so
 * "gulshan" surfaces every Gulshan block first while the rest of the list
 * (DHA, PECHS, ...) stays scrollable below. A plain native <select> can't do
 * this (no in-place search-and-reorder), so this is a small custom listbox
 * instead of adding a combobox dependency.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Search or pick an area…",
  className,
  ...aria
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [openUpward, setOpenUpward] = React.useState(false);
  const [listMaxHeight, setListMaxHeight] = React.useState(256);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Search-bar row is ~40px; leave it plus a small viewport margin out of
  // the scrollable list's budget so the whole panel (search bar included)
  // always stays fully on-screen — it shrinks the list instead of spilling
  // past the viewport/modal edge in whichever direction it opens.
  const HEADER_HEIGHT_PX = 40;
  const VIEWPORT_MARGIN_PX = 16;
  const DEFAULT_LIST_HEIGHT_PX = 256;
  const openMenu = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    const spaceBelow = rect ? window.innerHeight - rect.bottom : Infinity;
    const spaceAbove = rect ? rect.top : Infinity;
    const panelBudget = DEFAULT_LIST_HEIGHT_PX + HEADER_HEIGHT_PX + VIEWPORT_MARGIN_PX;
    const upward = spaceBelow < panelBudget && spaceAbove > spaceBelow;
    setOpenUpward(upward);
    const available = (upward ? spaceAbove : spaceBelow) - HEADER_HEIGHT_PX - VIEWPORT_MARGIN_PX;
    setListMaxHeight(Math.max(120, Math.min(DEFAULT_LIST_HEIGHT_PX, available)));
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const ordered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    const matches: string[] = [];
    const rest: string[] = [];
    for (const opt of options) {
      (opt.toLowerCase().includes(q) ? matches : rest).push(opt);
    }
    return [...matches, ...rest];
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const select = (opt: string) => {
    onChange(opt);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...aria}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-left text-sm text-foreground shadow-sm transition-colors",
          "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:outline-none",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/20",
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (() => {
        const searchBar = (
          <div
            className={cn(
              "flex items-center gap-2 px-3",
              openUpward ? "border-t border-border" : "border-b border-border",
            )}
          >
            <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search, e.g. Gulshan block 19…"
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
            />
          </div>
        );

        const list = (
          <ul
            role="listbox"
            className="overflow-y-auto py-1"
            style={{ maxHeight: listMaxHeight }}
          >
            {ordered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => select(opt)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-muted",
                    opt === value ? "text-foreground font-medium" : "text-foreground",
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {opt === value && (
                    <Check aria-hidden className="size-4 shrink-0 text-accent" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        );

        return (
          <div
            className={cn(
              "absolute z-40 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lift",
              openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5",
            )}
          >
            {/* When opening upward, the search bar sits right above the
                trigger (bottom of the panel) with results above it — so the
                input stays anchored next to the field it belongs to instead
                of floating at the far, disconnected end of the panel. */}
            {openUpward ? (
              <>
                {list}
                {searchBar}
              </>
            ) : (
              <>
                {searchBar}
                {list}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}
