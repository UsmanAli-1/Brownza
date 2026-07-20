"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function VerifyPaymentButton({
  orderId,
  orderNumber,
  verified,
}: {
  orderId: string;
  orderNumber: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
        <BadgeCheck className="size-4" />
        Payment verified
      </span>
    );
  }

  const verify = async () => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verifyPayment: true }),
    });
    if (!res.ok) {
      toast.error("Couldn't verify payment");
      throw new Error("verify failed");
    }
    toast.success("Payment verified");
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="accent" size="sm">
        <BadgeCheck />
        Verify payment
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Verify payment?"
        description={`Confirm you've checked the payment screenshot for ${orderNumber}. This marks the payment as verified.`}
        confirmLabel="Verify payment"
        onConfirm={verify}
      />
    </>
  );
}
