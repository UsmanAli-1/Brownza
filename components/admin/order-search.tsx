"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";

/**
 * Orders search + status filter. Debounces typing (400ms) but also supports an
 * explicit Search button, Enter, and a Clear (X). State lives in the URL.
 */
export function OrderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSearch = params.get("search") ?? "";
  const [value, setValue] = React.useState(currentSearch);
  const debounced = useDebouncedValue(value, 400);
  const [pending, startTransition] = React.useTransition();

  const pushWith = React.useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page"); // any new query resets to page 1
      const qs = next.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [params, router, pathname],
  );

  const applySearch = React.useCallback(
    (search: string) =>
      pushWith((next) => {
        if (search) next.set("search", search);
        else next.delete("search");
      }),
    [pushWith],
  );

  // Auto-apply the debounced value when it diverges from the URL.
  React.useEffect(() => {
    if (debounced !== currentSearch) applySearch(debounced);
  }, [debounced, currentSearch, applySearch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applySearch(value);
        }}
        className="flex flex-1 items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search order #, name, phone or WhatsApp"
            className="pl-9 pr-9"
            aria-label="Search orders"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                applySearch("");
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Search />}
          Search
        </Button>
      </form>

      <Select
        value={params.get("status") ?? ""}
        onChange={(e) =>
          pushWith((next) => {
            if (e.target.value) next.set("status", e.target.value);
            else next.delete("status");
          })
        }
        className="sm:w-48"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {ORDER_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
