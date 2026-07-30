"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  ORDER_TYPES,
  preOrderSchema,
  type PreOrderValues,
} from "@/lib/validations/pre-order";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-danger">
      {message}
    </p>
  );
}

/** Earliest selectable moment — 1 hour from now, rounded to the next 30
 * minutes, formatted for a datetime-local input's `min` attribute. */
function minDateTimeLocal(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 30) * 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PreOrderForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreOrderValues>({
    resolver: zodResolver(preOrderSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      orderType: "Pre Order",
      description: "",
      preferredDateTime: "",
    },
    mode: "onTouched",
  });

  const [submittedName, setSubmittedName] = React.useState<string | null>(null);
  const minDateTime = React.useMemo(() => minDateTimeLocal(), []);

  const onSubmit = async (values: PreOrderValues) => {
    const res = await fetch("/api/pre-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(err?.error ?? "We couldn't send your request. Please try again.");
      return;
    }

    setSubmittedName(values.fullName);
    toast.success("Pre-order request sent!", {
      description: "Our team will reach out to confirm the details.",
    });
    reset();
  };

  if (submittedName) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <Check className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Request received, {submittedName.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            Thanks for your pre-order request. Our team will reach out shortly to
            confirm the details and pricing.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/products">Back to menu</Link>
          </Button>
          <Button variant="outline" onClick={() => setSubmittedName(null)}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="po-name">
          Full name <span className="text-danger">*</span>
        </Label>
        <Input
          id="po-name"
          placeholder="e.g. Ayesha Khan"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "po-name-error" : undefined}
          {...register("fullName")}
        />
        <FieldError id="po-name-error" message={errors.fullName?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="po-phone">
            Phone number <span className="text-danger">*</span>
          </Label>
          <Input
            id="po-phone"
            type="tel"
            inputMode="tel"
            placeholder="+92 3XX XXXXXXX"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "po-phone-error" : undefined}
            {...register("phone")}
          />
          <FieldError id="po-phone-error" message={errors.phone?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="po-email">
            Email <span className="text-danger">*</span>
          </Label>
          <Input
            id="po-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "po-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="po-email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="po-type">
            Order type <span className="text-danger">*</span>
          </Label>
          <Select
            id="po-type"
            aria-invalid={!!errors.orderType}
            {...register("orderType")}
          >
            {ORDER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <FieldError id="po-type-error" message={errors.orderType?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="po-datetime">
            Needed by (date &amp; time) <span className="text-danger">*</span>
          </Label>
          <Input
            id="po-datetime"
            type="datetime-local"
            min={minDateTime}
            aria-invalid={!!errors.preferredDateTime}
            aria-describedby={
              errors.preferredDateTime ? "po-datetime-error" : undefined
            }
            {...register("preferredDateTime")}
          />
          <FieldError
            id="po-datetime-error"
            message={errors.preferredDateTime?.message}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="po-description">
          Description <span className="text-danger">*</span>
        </Label>
        <Textarea
          id="po-description"
          rows={5}
          placeholder="Tell us what you need — quantities, flavours, date, and any special requests."
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "po-description-error" : undefined
          }
          {...register("description")}
        />
        <FieldError
          id="po-description-error"
          message={errors.description?.message}
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send />
            Submit pre-order
          </>
        )}
      </Button>
    </form>
  );
}