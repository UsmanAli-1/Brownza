"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

/**
 * Wipes every payment screenshot in Cloudinary, independent of Order
 * records — for orphaned-upload cleanup. Does not touch orders themselves
 * (deleting an order already cleans up its own screenshot separately).
 */
export function DeleteAllImagesButton() {
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    const res = await fetch("/api/admin/delete-all-images", {
      method: "POST",
    });
    if (!res.ok) {
      toast.error("Failed to delete images");
      throw new Error("delete failed");
    }
    const data = (await res.json()) as { deleted: number };
    toast.success(
      `Deleted ${data.deleted} image${data.deleted === 1 ? "" : "s"} from Cloudinary`,
    );
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <ImageOff />
        <span className="hidden sm:inline">Delete all images</span>
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Delete ALL Cloudinary images?"
        description="This permanently removes every payment screenshot from Cloudinary, including any not attached to a current order. This action cannot be undone."
        confirmLabel="Delete all images"
        onConfirm={run}
      />
    </>
  );
}
