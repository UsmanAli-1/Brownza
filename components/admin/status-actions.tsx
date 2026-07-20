"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2, XCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CancelOrderModal } from "@/components/admin/cancel-order-modal";
import {
  ADVANCE_LABEL,
  ORDER_STATUS_META,
  ORDER_STATUS_NEXT,
  isTerminal,
} from "@/lib/order-status";
import type { OrderStatus } from "@/types";

interface StatusActionsProps {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  size?: ButtonProps["size"];
}

/**
 * Enforces the order lifecycle: a single "advance to next step" button plus a
 * "cancel" action (with reason). Steps can't be skipped; terminal orders show
 * no actions.
 */
export function StatusActions({
  orderId,
  orderNumber,
  status,
  size = "sm",
}: StatusActionsProps) {
  const router = useRouter();
  const [advancing, setAdvancing] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const next = ORDER_STATUS_NEXT[status];

  if (isTerminal(status)) {
    return (
      <span className="text-xs text-muted-foreground">No actions</span>
    );
  }

  const advance = async () => {
    if (!next) return;
    setAdvancing(true);
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
      toast.success(`Order ${orderNumber} → ${ORDER_STATUS_META[next].label}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next && (
        <Button size={size} onClick={advance} disabled={advancing}>
          {advancing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ArrowRight />
          )}
          {ADVANCE_LABEL[next]}
        </Button>
      )}
      <Button
        size={size}
        variant="outline"
        onClick={() => setCancelOpen(true)}
        disabled={advancing}
        className="border-danger/40 text-danger hover:bg-danger hover:text-white"
      >
        <XCircle />
        Cancel
      </Button>
      <CancelOrderModal
        orderId={orderId}
        orderNumber={orderNumber}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
