import type { Metadata } from "next";
import { CalendarClock, PartyPopper, Phone, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { BackButton } from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { PreOrderForm } from "@/components/pre-order/pre-order-form";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pre Order",
  description:
    "Pre-order with Brownza for large quantities, event stalls, custom cakes and desserts, or anything bespoke. Freshly baked to order across Karachi.",
  alternates: { canonical: "/pre-order" },
};

const REASONS = [
  { icon: Users, text: "Large quantity & corporate orders" },
  { icon: PartyPopper, text: "Event stalls & catering" },
  { icon: Sparkles, text: "Custom cakes & desserts" },
  { icon: CalendarClock, text: "Plan ahead for a special date" },
] as const;

export default function PreOrderPage() {
  return (
    <>
      <section className="border-b border-border bg-muted/40 py-10 md:py-16">
        <Container>
          <BackButton className="mb-6" />
          <SectionHeading
            eyebrow="Pre Order"
            title="Planning something special?"
            description="Tell us what you need and we'll bake it fresh, just for you. Perfect for events, bulk orders and custom requests."
          />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Reasons — first on mobile, top-left on desktop */}
          <ul className="order-1 flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <li key={reason.text} className="flex items-center gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-secondary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-base font-medium text-foreground">
                    {reason.text}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Form — second on mobile, right column (spans both rows) on desktop */}
          <div className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <PreOrderForm />
          </div>

          {/* Prefer to talk — LAST on mobile (after the form), left-bottom on desktop */}
          <div className="order-3 flex flex-col gap-3 rounded-3xl border border-border bg-cocoa-gradient p-6 text-primary-foreground shadow-soft lg:col-start-1 lg:row-start-2">
            <p className="font-heading text-lg font-semibold">
              Prefer to talk it through?
            </p>
            <p className="text-sm text-primary-foreground/75">
              Call or WhatsApp us and we&apos;ll help plan your order.
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <a href={CONTACT.phoneHref}>
                  <Phone />
                  Call us
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
