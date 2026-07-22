"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete order");
      throw new Error("delete failed");
    }
    toast.success(`Order ${orderNumber} deleted`);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete order ${orderNumber}`}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-danger hover:bg-danger hover:text-white"
      >
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title={`Delete order ${orderNumber}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={run}
      />
    </>
  );
}
