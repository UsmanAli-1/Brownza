"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSuccess } from "@/components/checkout/order-success";
import { OrderSummary } from "@/components/cart/order-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/cart-store";
import { useDetailedCart } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocationStore } from "@/lib/location-store";
import { saveLastOrder } from "@/lib/last-order";
import { DEFAULT_DELIVERY_AREA } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import type { PlacedOrder } from "@/types";
import type { CreateOrderInput, OrderRecord } from "@/types/order";

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function CheckoutView() {
  const hydrated = useHydrated();
  const { lines, totals, isEmpty } = useDetailedCart();
  const clear = useCartStore((s) => s.clear);
  const savedArea = useLocationStore((s) => s.area);
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null);

  const handlePlaceOrder = async (
    values: CheckoutFormValues,
    screenshot: File | null,
  ) => {
    try {
      const payment: CreateOrderInput["payment"] = {
        method: values.paymentMethod === "online" ? "ONLINE" : "COD",
      };

      // 1) Upload the payment screenshot to Cloudinary for online payments.
      if (values.paymentMethod === "online" && screenshot) {
        const fd = new FormData();
        fd.append("file", screenshot);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) {
          throw new Error(
            "We couldn't upload your screenshot. Please try again.",
          );
        }
        const uploaded = (await uploadRes.json()) as {
          url: string;
          publicId: string;
        };
        payment.screenshotUrl = uploaded.url;
        payment.screenshotPublicId = uploaded.publicId;
      }

      // 2) Create the order.
      const input: CreateOrderInput = {
        customer: {
          name: values.fullName,
          phone: values.phone,
          whatsapp: values.phone,
          email: values.email || undefined,
        },
        delivery: {
          address: values.address,
          city: values.deliveryArea,
          notes: values.notes || undefined,
        },
        items: lines.map((l) => ({
          productId: l.product.id,
          productName: l.product.name,
          quantity: l.quantity,
          unitPrice: l.product.price,
        })),
        payment,
        subtotal: totals.subtotal,
        deliveryFee: totals.delivery,
        total: totals.total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          err?.error ?? "We couldn't place your order. Please try again.",
        );
      }
      const { order } = (await res.json()) as { order: OrderRecord };

      // Persist for the tracking page (survives refresh).
      saveLastOrder({ id: order._id, orderNumber: order.orderNumber });

      // 3) Build the success snapshot from the created order + local lines.
      const placedOrder: PlacedOrder = {
        id: order.orderNumber,
        customerName: order.customer.name,
        phone: order.customer.phone,
        deliveryArea: order.delivery.city,
        paymentMethod: values.paymentMethod,
        lines,
        totals,
        status: order.status,
      };
      clear();
      setPlaced(placedOrder);
      toast.success("Order received!", {
        description: `Reference ${order.orderNumber}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (!hydrated) return <CheckoutSkeleton />;
  if (placed) return <OrderSuccess order={placed} />;
  if (isEmpty) {
    return (
      <EmptyCart
        title="Your cart is empty"
        description="Add a few treats to your cart before checking out."
        cta={{ label: "Browse the menu", href: "/products" }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <CheckoutForm
        initialArea={savedArea ?? DEFAULT_DELIVERY_AREA}
        onPlaceOrder={handlePlaceOrder}
      />

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Your order
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                    {line.quantity}
                  </span>
                  <span className="truncate text-foreground">
                    {line.product.name}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatPrice(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <OrderSummary totals={totals} title="Payable" />
      </div>
    </div>
  );
}
