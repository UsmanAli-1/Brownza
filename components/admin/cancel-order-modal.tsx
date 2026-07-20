"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderModal({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: CancelOrderModalProps) {
  const router = useRouter();
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const cancelOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancellationReason: reason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? "Failed to cancel order");
      }
      toast.success(`Order ${orderNumber} cancelled`);
      onOpenChange(false);
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => (loading ? undefined : onOpenChange(v))}
      labelledBy="cancel-order-title"
    >
      <h2
        id="cancel-order-title"
        className="font-heading text-xl font-semibold text-foreground"
      >
        Cancel order {orderNumber}?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This can&apos;t be undone. Add an optional reason for your records and
        the customer.
      </p>
      <div className="mt-4 flex flex-col gap-1.5">
        <Label htmlFor="cancel-reason">Cancellation reason (optional)</Label>
        <Textarea
          id="cancel-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Payment screenshot invalid, item unavailable, outside delivery area…"
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Keep order
        </Button>
        <Button variant="danger" onClick={cancelOrder} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Cancelling…
            </>
          ) : (
            "Cancel order"
          )}
        </Button>
      </div>
    </Modal>
  );
}
