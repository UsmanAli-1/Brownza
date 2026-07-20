import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { OrderTracker } from "@/components/track/order-tracker";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Track your Brownza order status in real time.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: true },
};

export default function TrackPage() {
  return (
    <section className="py-10 md:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Track your order
          </h1>
          <p className="text-muted-foreground">
            Live updates on your latest order — no refresh needed.
          </p>
        </header>
        <OrderTracker />
      </Container>
    </section>
  );
}
