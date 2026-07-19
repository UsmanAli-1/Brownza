import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your Brownza cart and proceed to checkout.",
  alternates: { canonical: "/cart" },
  // Transactional pages shouldn't be indexed.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <section className="py-10 md:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Your Cart
          </h1>
          <p className="text-muted-foreground">
            Review your order before checkout.
          </p>
        </header>
        <CartView />
      </Container>
    </section>
  );
}
