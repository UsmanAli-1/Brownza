"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteAllPreOrdersButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const deleteAll = async () => {
    const res = await fetch("/api/pre-orders", { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete submissions");
      throw new Error("delete failed");
    }
    const data = (await res.json()) as { deletedCount: number };
    toast.success(`Deleted ${data.deletedCount} submission${data.deletedCount === 1 ? "" : "s"}`);
    router.refresh();
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 />
        Delete all
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete all form submissions?"
        description="This permanently deletes every pre-order enquiry. This can't be undone."
        confirmLabel="Delete all"
        onConfirm={deleteAll}
      />
    </>
  );
}