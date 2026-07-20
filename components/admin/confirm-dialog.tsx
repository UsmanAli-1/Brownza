"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  children?: React.ReactNode;
}

/** Reusable confirmation dialog. Manages its own busy state. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // keep the dialog open; onConfirm surfaces its own error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => (loading ? undefined : onOpenChange(v))}
      labelledBy="confirm-dialog-title"
    >
      <h2
        id="confirm-dialog-title"
        className="font-heading text-xl font-semibold text-foreground"
      >
        {title}
      </h2>
      {description && (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      )}
      {children}
      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Working…
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </div>
    </Modal>
  );
}
