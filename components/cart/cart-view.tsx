"use client";

import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { useCartStore } from "@/lib/cart-store";
import { useDetailedCart } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";

function CartLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-24 rounded-2xl sm:size-28" />
            <div className="flex flex-1 flex-col gap-3 py-1">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="mt-auto h-9 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const { lines, totals, isEmpty } = useDetailedCart();
  const clear = useCartStore((s) => s.clear);

  if (!hydrated) return <CartLoading />;
  if (isEmpty) return <EmptyCart />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="rounded-3xl border border-border bg-card p-2 shadow-soft sm:p-4">
        <div className="flex items-center justify-between px-3 py-3">
          <p className="text-sm text-muted-foreground">
            {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Trash2 className="size-4" />
            Clear cart
          </button>
        </div>
        <ul className="divide-y divide-border px-3">
          {lines.map((line) => (
            <CartItem
              key={`${line.product.id}:${line.variant?.id ?? "base"}`}
              product={line.product}
              variant={line.variant}
              quantity={line.quantity}
              unitPrice={line.unitPrice}
              note={line.note}
            />
          ))}
        </ul>
      </div>

      <div className="lg:sticky lg:top-24">
        <OrderSummary
          totals={totals}
          action={
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">
                  Proceed to checkout
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/products">Continue shopping</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}