"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CheckoutForm, CHECKOUT_FORM_ID } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/cart/order-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/cart-store";
import { useDetailedCart } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocationStore } from "@/lib/location-store";
import { saveLastOrder } from "@/lib/last-order";
import { compressImageForUpload } from "@/lib/compress-image";
import { DEFAULT_DELIVERY_AREA } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
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
  const router = useRouter();
  const { lines, totals, isEmpty } = useDetailedCart();
  const clear = useCartStore((s) => s.clear);
  const savedArea = useLocationStore((s) => s.area);
  const [submitting, setSubmitting] = React.useState(false);
  // Set once a real network request is in flight — used to keep showing the
  // form (rather than snapping to EmptyCart) during the brief instant after
  // `clear()` runs but before the redirect to /track completes.
  const [redirecting, setRedirecting] = React.useState(false);

  const handlePlaceOrder = async (
    values: CheckoutFormValues,
    screenshot: File | null,
  ) => {
    try {
      // Every order is online-payment-only (checkout-form.tsx no longer
      // offers a payment-method choice — see its own comment on why the
      // "cod"|"online" union type is still kept, just never set to "cod").
      const payment: CreateOrderInput["payment"] = { method: "ONLINE" };

      // 1) Upload the payment screenshot to Cloudinary.
      if (screenshot) {
        const compressed = await compressImageForUpload(screenshot);
        const fd = new FormData();
        fd.append("file", compressed);
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
          productName: l.variant ? `${l.product.name} — ${l.variant.label}` : l.product.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
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

      // Persist for /track — this is what makes the status page survive a
      // refresh: it's read from localStorage + refetched from Mongo, not
      // held in memory.
      saveLastOrder({ id: order._id, orderNumber: order.orderNumber });

      setRedirecting(true);
      clear();
      toast.success("Order received!", {
        description: `Reference ${order.orderNumber}`,
      });
      router.push("/track");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (!hydrated) return <CheckoutSkeleton />;
  if (isEmpty && !redirecting) {
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
        onSubmittingChange={setSubmitting}
      />

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Your order
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
              <li
                key={`${line.product.id}:${line.variant?.id ?? "base"}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                    {line.quantity}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-foreground">
                      {line.product.name}
                    </span>
                    {line.variant && (
                      <span className="text-xs text-muted-foreground">
                        {line.variant.label}
                      </span>
                    )}
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

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            form={CHECKOUT_FORM_ID}
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Placing order…
              </>
            ) : (
              "Place order"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By placing this order you agree to be contacted to confirm your
            delivery.
          </p>
        </div>
      </div>
    </div>
  );
}