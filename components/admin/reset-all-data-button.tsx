"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetAllDataButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-all-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(err?.error ?? "Failed to reset data");
        return;
      }
      toast.success("All data has been permanently deleted");
      setOpen(false);
      setPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
          <div>
            <p className="font-medium text-foreground">Danger zone</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete every order, every form/pre-order
              submission, and all recorded revenue (total revenue, monthly
              revenue, average order value). This cannot be undone.
            </p>
          </div>
        </div>
        <Button variant="danger" className="w-fit" onClick={() => setOpen(true)}>
          <Trash2 />
          Reset all data
        </Button>
      </div>

      <Modal
        open={open}
        onOpenChange={(v) => (loading ? undefined : setOpen(v))}
        labelledBy="reset-all-title"
      >
        <h2
          id="reset-all-title"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Reset all data?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This permanently deletes <strong>every order</strong>,{" "}
          <strong>every form/pre-order submission</strong>, and{" "}
          <strong>all revenue records</strong> — including total revenue,
          monthly revenue, and average order value. There is no undo. Enter
          the admin password to confirm.
        </p>
        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="reset-password">Admin password</Label>
          <Input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoComplete="off"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} disabled={loading || !password}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting…
              </>
            ) : (
              "Permanently delete everything"
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}