import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { OrderTracker } from "@/components/track/order-tracker";

export const metadata: Metadata = {
  title: "Your order",
  description: "Live status for your Brownza order.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: true },
};

export default function TrackPage() {
  return (
    <section className="py-10 md:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Your order
          </h1>
          <p className="text-muted-foreground">
            Live status — updates instantly, no refresh needed, and stays
            here even if you reload the page.
          </p>
        </header>
        <OrderTracker />
      </Container>
    </section>
  );
}