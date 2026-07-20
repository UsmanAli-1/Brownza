"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrderStream } from "@/lib/hooks/use-order-stream";
import type { OrderEvent } from "@/types/order";

/**
 * Keeps admin pages live. Opens one shared SSE connection (mounted in the
 * admin layout) and coalesces refreshes so server components re-fetch on new
 * orders / status changes / payment verification without manual reload.
 */
export function AdminRealtime() {
  const router = useRouter();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEvent = React.useCallback(
    (event: OrderEvent) => {
      if (event.type === "order.created") {
        toast.info(`New order ${event.orderNumber} received`);
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
