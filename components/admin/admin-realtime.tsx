"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrderStream } from "@/lib/hooks/use-order-stream";
import { playNotificationSound, primeAudio } from "@/lib/notification-sound";
import { formatPrice } from "@/lib/utils";
import type { OrderEvent } from "@/types/order";
import type { PreOrderEvent } from "@/lib/pre-order-events";

/**
 * Keeps admin pages live. Opens ONE shared SSE connection (mounted in the
 * admin layout) carrying both order and pre-order events, pops a toast +
 * plays a sound on new orders, and coalesces refreshes so server
 * components re-fetch without a manual reload.
 *
 * Deliberately a single EventSource — a second permanent connection for
 * pre-order events was previously competing for the browser's per-origin
 * connection limit and silently starving this one, which broke the
 * new-order notification sound.
 */
export function AdminRealtime() {
  const router = useRouter();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), 400);
  }, [router]);

  const onOrderEvent = React.useCallback(
    (event: OrderEvent) => {
      if (event.type === "order.created") {
        toast("🔔 New order received", {
          description: `${event.orderNumber} · ${
            event.customerName ?? "Customer"
          } · ${formatPrice(event.total ?? 0)}`,
          duration: 8000,
        });
        playNotificationSound(
          typeof document !== "undefined" && document.hidden,
        );
      }
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  const onPreOrderEvent = React.useCallback(
    (event: PreOrderEvent) => {
      toast.info("New pre-order request", { description: event.fullName });
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  useOrderStream(onOrderEvent, undefined, onPreOrderEvent);

  // Unlock audio on the first interaction anywhere on the page, so a new-
  // order chime that arrives before the admin has clicked anything yet
  // still has a real chance of being audible (browsers block audio from an
  // AudioContext that's never been resumed off the back of a user gesture).
  React.useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}