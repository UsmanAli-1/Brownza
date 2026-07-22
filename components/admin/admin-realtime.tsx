"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrderStream } from "@/lib/hooks/use-order-stream";
import { playNotificationSound } from "@/lib/notification-sound";
import { formatPrice } from "@/lib/utils";
import type { OrderEvent } from "@/types/order";

/**
 * Keeps admin pages live. Opens one shared SSE connection (mounted in the
 * admin layout), pops a toast + plays a sound on new orders, and coalesces
 * refreshes so server components re-fetch without manual reload.
 */
export function AdminRealtime() {
  const router = useRouter();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEvent = React.useCallback(
    (event: OrderEvent) => {
      if (event.type === "order.created") {
        toast("🔔 New order received", {
          description: `${event.orderNumber} · ${
            event.customerName ?? "Customer"
          } · ${formatPrice(event.total ?? 0)}`,
          duration: 8000,
        });
        // Longer chime when the tab is hidden so the owner still notices.
        playNotificationSound(
          typeof document !== "undefined" && document.hidden,
        );
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    },
    [router],
  );

  useOrderStream(onEvent);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
