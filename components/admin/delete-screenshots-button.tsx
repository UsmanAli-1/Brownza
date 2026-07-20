"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteScreenshotsButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    const res = await fetch("/api/admin/screenshots/delete-all", {
      method: "POST",
    });
    if (!res.ok) {
      toast.error("Failed to delete screenshots");
      throw new Error("delete failed");
    }
    const data = (await res.json()) as {
      deleted: number;
      failed: number;
      ordersUpdated: number;
    };
    toast.success(
      `Deleted ${data.deleted} screenshot${data.deleted === 1 ? "" : "s"}`,
      {
        description: `${data.ordersUpdated} order${
          data.ordersUpdated === 1 ? "" : "s"
        } updated${data.failed ? ` · ${data.failed} failed` : ""}`,
      },
    );
    router.refresh();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-danger/40 text-danger hover:bg-danger hover:text-white"
      >
        <Trash2 />
        Delete all screenshots
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Delete all payment screenshots?"
        description="This permanently deletes every payment screenshot from Cloudinary and removes their references from orders. The orders themselves are kept. This cannot be undone."
        confirmLabel="Delete screenshots"
        onConfirm={run}
      />
    </>
  );
}
