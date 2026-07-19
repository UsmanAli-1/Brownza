import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and place your Brownza order.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="py-10 md:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Almost there — just a few details and your order is on its way.
          </p>
        </header>
        <CheckoutView />
      </Container>
    </section>
  );
}
