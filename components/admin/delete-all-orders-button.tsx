"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteAllOrdersButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    const res = await fetch("/api/orders", { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete orders");
      throw new Error("delete failed");
    }
    const data = (await res.json()) as {
      deletedOrders: number;
      deletedScreenshots: number;
    };
    toast.success(
      `Deleted ${data.deletedOrders} order${
        data.deletedOrders === 1 ? "" : "s"
      }`,
      {
        description: data.deletedScreenshots
          ? `${data.deletedScreenshots} screenshot${
              data.deletedScreenshots === 1 ? "" : "s"
            } removed from Cloudinary`
          : undefined,
      },
    );
    router.refresh();
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 />
        <span className="hidden sm:inline">Delete all orders</span>
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Delete ALL orders?"
        description="This permanently removes every order from MongoDB. Any attached Cloudinary payment screenshots are also deleted. This action cannot be undone."
        confirmLabel="Delete all orders"
        onConfirm={run}
      />
    </>
  );
}
