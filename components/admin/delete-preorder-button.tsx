"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeletePreOrderButton({
  preOrderId,
  fullName,
}: {
  preOrderId: string;
  fullName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const deleteEntry = async () => {
    const res = await fetch(`/api/pre-orders/${preOrderId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete this submission");
      throw new Error("delete failed");
    }
    toast.success(`Deleted ${fullName}'s request`);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${fullName}'s pre-order request`}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-danger hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this request?"
        description={`This permanently deletes ${fullName}'s pre-order request. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={deleteEntry}
      />
    </>
  );
}