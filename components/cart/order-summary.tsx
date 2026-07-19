"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CartTotals } from "@/types";

interface OrderSummaryProps {
  totals: CartTotals;
  title?: string;
  /** Footer slot for the primary action (e.g. checkout / place order). */
  action?: React.ReactNode;
}

/**
 * Order totals card with a free-delivery progress meter. Shared by the cart
 * and checkout so figures are always computed the same way.
 */
export function OrderSummary({
  totals,
  title = "Order summary",
  action,
}: OrderSummaryProps) {
  const { subtotal, delivery, total } = totals;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const freeUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>

      {subtotal > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-4">
          <p className="text-sm text-foreground">
            {freeUnlocked ? (
              <span className="font-medium text-success">
                You&apos;ve unlocked free delivery!
              </span>
            ) : (
              <>
                Add{" "}
                <span className="font-semibold">{formatPrice(remaining)}</span>{" "}
                more for free delivery
              </>
            )}
          </p>
          <div
            className="h-2 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-lux"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-medium tabular-nums">
            {delivery === 0 ? (
              <span className="text-success">Free</span>
            ) : (
              formatPrice(delivery)
            )}
          </dd>
        </div>
        <Separator />
        <div className="flex items-baseline justify-between">
          <dt className="font-heading text-base font-semibold text-foreground">
            Total
          </dt>
          <dd className="font-heading text-xl font-semibold tabular-nums text-primary">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      {action}
    </div>
  );
}
