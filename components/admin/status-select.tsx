"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { CancelOrderModal } from "@/components/admin/cancel-order-modal";
import {
  ACTION_LABEL,
  ALLOWED_TRANSITIONS,
  ORDER_STATUS_META,
  isTerminal,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

/**
 * Single status selector driving the whole order workflow. Shows the current
 * status; the options are the allowed next stages. Choosing "Cancel" opens the
 * reason modal; any other choice advances the order.
 */
export function StatusSelect({
  orderId,
  orderNumber,
  status,
  className,
}: {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  className?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const options = ALLOWED_TRANSITIONS[status];

  if (isTerminal(status) || options.length === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          ORDER_STATUS_META[status].className,
          className,
        )}
      >
        <span
          className={cn("size-1.5 rounded-full", ORDER_STATUS_META[status].dot)}
        />
        {ORDER_STATUS_META[status].label}
      </span>
    );
  }

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as OrderStatus;
    if (!next || next === status) return;
    if (next === "cancelled") {
      e.target.value = status;
      setCancelOpen(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? "Update failed");
      }
      toast.success(`${orderNumber} → ${ORDER_STATUS_META[next].label}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Select
        value={status}
        onChange={onChange}
        disabled={saving}
        aria-label={`Update status for ${orderNumber}`}
        className="h-9 min-w-36 text-xs"
      >
        <option value={status} disabled>
          {ORDER_STATUS_META[status].label}
        </option>
        {options.map((t) => (
          <option key={t} value={t}>
            {ACTION_LABEL[t]}
          </option>
        ))}
      </Select>
      {saving && (
        <Loader2 className="pointer-events-none absolute right-9 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      <CancelOrderModal
        orderId={orderId}
        orderNumber={orderNumber}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
