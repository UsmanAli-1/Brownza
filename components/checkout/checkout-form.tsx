"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  ImageUp,
  Loader2,
  Lock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { detectDeliveryArea } from "@/lib/geolocation";
import { DEFAULT_DELIVERY_AREA, DELIVERY_AREAS } from "@/lib/constants";
import {
  checkoutDefaultValues,
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

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
  onPlaceOrder: (values: CheckoutFormValues) => Promise<void>;
}

export function CheckoutForm({ initialArea, onPlaceOrder }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...checkoutDefaultValues,
      deliveryArea:
        (initialArea as CheckoutFormValues["deliveryArea"]) ??
        DEFAULT_DELIVERY_AREA,
    },
    mode: "onTouched",
  });

  const [locating, setLocating] = React.useState(false);
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // Detect the delivery area via geolocation + reverse geocoding.
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
    <form
      onSubmit={handleSubmit(onPlaceOrder)}
      noValidate
      className="flex flex-col gap-6"
    >
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
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(
                [
                  {
                    value: "cod",
                    icon: Banknote,
                    title: "Cash on delivery",
                    desc: "Pay in cash when your order arrives.",
                  },
                  {
                    value: "online",
                    icon: CreditCard,
                    title: "Online payment",
                    desc: "Pay via bank transfer or wallet.",
                  },
                ] as const
              ).map((opt) => {
                const selected = field.value === opt.value;
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    htmlFor={`pay-${opt.value}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                      selected
                        ? "border-accent bg-accent-soft/40"
                        : "border-border bg-card hover:border-accent/50",
                    )}
                  >
                    <RadioGroupItem
                      value={opt.value}
                      id={`pay-${opt.value}`}
                      className="mt-0.5"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Icon className="size-4 text-secondary" />
                        {opt.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.desc}
                      </span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          )}
        />

        {/* Reserved upload area for online payments (not yet functional) */}
        {paymentMethod === "online" && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageUp className="size-4 text-secondary" />
              Payment screenshot
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              After transferring, you&apos;ll upload your payment proof here.
              <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 font-medium">
                <Lock className="size-3" />
                Coming soon
              </span>
            </p>
            <div
              aria-disabled="true"
              className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-card/60 text-xs text-muted-foreground"
            >
              Upload area reserved for a future phase
            </div>
          </div>
        )}
      </CardSection>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Placing order…
            </>
          ) : (
            "Place order"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By placing this order you agree to be contacted to confirm your
          delivery.
        </p>
      </div>
    </form>
  );
}
