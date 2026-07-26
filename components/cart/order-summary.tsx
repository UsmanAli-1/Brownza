"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { CartTotals } from "@/types";

interface OrderSummaryProps {
  totals: CartTotals;
  title?: string;
  /** Footer slot for the primary action (e.g. checkout / place order). */
  action?: React.ReactNode;
}

/**
 * Order totals card. Delivery is always a flat fee — Brownza does not offer
 * free delivery, so there's no progress meter here anymore.
 */
export function OrderSummary({
  totals,
  title = "Order summary",
  action,
}: OrderSummaryProps) {
  const { subtotal, delivery, total } = totals;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatPrice(delivery)}
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