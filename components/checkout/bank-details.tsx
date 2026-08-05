"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, Landmark } from "lucide-react";
import { BANK_DETAILS } from "@/lib/constants";

/** Premium bank-transfer card with a copy-to-clipboard account number. */
export function BankDetails() {
  const [copied, setCopied] = React.useState(false);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
      setCopied(true);
      toast.success("Account number copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please copy it manually");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary to-primary text-primary-foreground shadow-soft">
      <div className="flex items-center gap-3 border-b border-primary-foreground/10 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10">
          <Landmark className="size-5 text-accent" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-foreground/60">
            Online Payments
          </p>
          <p className="font-heading text-lg font-semibold">
            {BANK_DETAILS.jazzcash} | {BANK_DETAILS.bank} 
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-3 border-b border-primary-foreground/10 px-5 py-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Account number</dt>
          <dd className="flex items-center gap-2">
            <span className="font-medium tracking-wide tabular-nums">
              {BANK_DETAILS.jazzcashno}
            </span>
            <button
              type="button"
              onClick={copyAccount}
              aria-label="Copy account number"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Holder name</dt>
          <dd className="font-medium">{BANK_DETAILS.jazzcashtitle}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Bank</dt>
          <dd className="font-medium">{BANK_DETAILS.jazzcash}</dd>
        </div>
      </dl>

      <dl className="flex flex-col gap-3 px-5 py-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Account number</dt>
          <dd className="flex items-center gap-2">
            <span className="font-medium tracking-wide tabular-nums">
              {BANK_DETAILS.accountNumber}
            </span>
            <button
              type="button"
              onClick={copyAccount}
              aria-label="Copy account number"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Holder name</dt>
          <dd className="font-medium">{BANK_DETAILS.accountHolder}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-primary-foreground/60">Bank</dt>
          <dd className="font-medium">{BANK_DETAILS.bank}</dd>
        </div>
      </dl>
    </div>
  );
}
