"use client";

import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useDetailedCart } from "@/lib/use-cart";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/utils";

/**
 * Persistent floating bar shown whenever the cart has items. Full width
 * (minus a small gutter matching the page's side spacing) on mobile;
 * shrinks to a compact centered pill from `sm` up. Shows product subtotal
 * only — delivery is added at checkout, not while still browsing.
 * Hidden on /cart, /checkout, /pre-order and /admin. Portal-rendered into
 * `document.body` so `position: fixed` is always relative to the real
 * viewport, never a transformed ancestor.
 */
export function FloatingCartBar() {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const { totals, isEmpty } = useDetailedCart();

  const hiddenOnThisPage =
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/pre-order") ||
    pathname.startsWith("/admin");

  if (!hydrated || isEmpty || hiddenOnThisPage) return null;

  return createPortal(
    <AnimatePresence>
      <motion.button
        type="button"
        onClick={() => router.push("/cart")}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-2.5 bottom-3 z-[70] flex items-center gap-3 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lift sm:inset-x-auto sm:left-1/2 sm:bottom-6 sm:w-auto sm:max-w-xs sm:-translate-x-1/2 sm:px-5 sm:py-3.5"
        aria-label="View cart"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold text-foreground sm:size-8 sm:text-sm">
          {totals.itemCount}
        </span>
        <span className="flex-1 text-center text-sm font-semibold sm:text-base">
          View Cart
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums sm:text-base">
            {formatPrice(totals.subtotal)}
          </span>
          <ArrowRight className="size-4" />
        </span>
      </motion.button>
    </AnimatePresence>,
    document.body,
  );
}