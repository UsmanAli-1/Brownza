"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreditCard, ImageUp, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BankDetails } from "@/components/checkout/bank-details";
import { ScreenshotUpload } from "@/components/checkout/screenshot-upload";
import { detectDeliveryArea } from "@/lib/geolocation";
import { DEFAULT_DELIVERY_AREA, DELIVERY_AREAS } from "@/lib/constants";
import {
  checkoutDefaultValues,
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

/**
 * Shared id linking the external "Place order" button (rendered by
 * CheckoutView, positioned after the order totals) back to this <form>.
 */
export const CHECKOUT_FORM_ID = "checkout-form";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-danger">
      {message}
    </p>
  );
}

const CardSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
    <h2 className="font-heading text-lg font-semibold text-foreground">
      {title}
    </h2>
    {children}
  </section>
);

interface CheckoutFormProps {
  /** Pre-selected delivery area (from the location popup). */
  initialArea?: string;
  onPlaceOrder: (
    values: CheckoutFormValues,
    screenshot: File | null,
  ) => Promise<void>;
  /**
   * Reports submitting state up to CheckoutView so the external button
   * (rendered outside this component) can show its loading state too.
   */
  onSubmittingChange?: (submitting: boolean) => void;
}

export function CheckoutForm({
  initialArea,
  onPlaceOrder,
  onSubmittingChange,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...checkoutDefaultValues,
      // Cash on delivery is no longer offered — every order is online-only.
      paymentMethod: "online",
      deliveryArea:
        (initialArea as CheckoutFormValues["deliveryArea"]) ??
        DEFAULT_DELIVERY_AREA,
    },
    mode: "onTouched",
  });

  const [locating, setLocating] = React.useState(false);
  const [screenshot, setScreenshot] = React.useState<File | null>(null);
  const [screenshotError, setScreenshotError] = React.useState<string | null>(
    null,
  );
  React.useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const submit = handleSubmit(async (values) => {
    if (!screenshot) {
      setScreenshotError("Please upload your payment screenshot to continue.");
      toast.error("Payment screenshot is required.");
      return;
    }
    await onPlaceOrder(values, screenshot);
  });

  const handleLocation = async () => {
    setLocating(true);
    try {
      const res = await detectDeliveryArea();
      setValue("deliveryArea", res.area, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Area detected", {
        description: res.label ? `Near ${res.label} → ${res.area}` : res.area,
      });
    } catch {
      toast.error("Couldn't detect your location. Please pick your area.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <form id={CHECKOUT_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-6">
      <input type="hidden" {...register("paymentMethod")} value="online" />

      <CardSection title="Delivery details">
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">
            Full name <span className="text-danger">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>

        {/* Phone + email */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">
              Phone <span className="text-danger">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+92 3XX XXXXXXX"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              {...register("phone")}
            />
            <FieldError id="phone-error" message={errors.phone?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              Email{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
        </div>

        {/* Delivery area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="deliveryArea">
              Delivery area <span className="text-danger">*</span>
            </Label>
            <button
              type="button"
              onClick={handleLocation}
              disabled={locating}
              className="inline-flex items-center gap-1 rounded-full text-xs font-medium text-secondary transition-colors hover:text-primary disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {locating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <MapPin className="size-3.5" />
              )}
              Use current location
            </button>
          </div>
          <Select
            id="deliveryArea"
            aria-invalid={!!errors.deliveryArea}
            {...register("deliveryArea")}
          >
            {DELIVERY_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </Select>
          <FieldError
            id="deliveryArea-error"
            message={errors.deliveryArea?.message}
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">
            Delivery address <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="address"
            rows={3}
            placeholder="House / flat, street, area — and any landmark that helps us find you."
            autoComplete="street-address"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
            {...register("address")}
          />
          <FieldError id="address-error" message={errors.address?.message} />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">
            Delivery notes{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="e.g. Ring the bell twice, leave at reception…"
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? "notes-error" : undefined}
            {...register("notes")}
          />
          <FieldError id="notes-error" message={errors.notes?.message} />
        </div>
      </CardSection>

      <CardSection title="Payment method">
        {/* Cash on delivery removed — every order is prepaid via bank
            transfer / wallet, so this is now informational rather than a
            choice. paymentMethod is always "online" (set via the hidden
            input above and the form's default value). */}
        <div className="flex items-start gap-3 rounded-2xl border border-accent bg-accent-soft/40 p-4">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-secondary" />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">Online payment</span>
            <span className="text-xs text-muted-foreground">
              Pay via bank transfer or wallet — cash on delivery isn&apos;t
              available.
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <BankDetails />
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageUp className="size-4 text-secondary" />
              Upload payment screenshot <span className="text-danger">*</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Transfer the total to the account above, then upload your payment
              proof. Your order stays Pending until we verify it.
            </p>
            <ScreenshotUpload
              value={screenshot}
              onChange={(file) => {
                setScreenshot(file);
                if (file) setScreenshotError(null);
              }}
              error={screenshotError ?? undefined}
            />
          </div>
        </div>
      </CardSection>
    </form>
  );
}