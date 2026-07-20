"use client";

import * as React from "react";
import type { OrderEvent } from "@/types/order";

/**
 * Subscribe to the order SSE stream. Maintains a single EventSource per mount;
 * the browser auto-reconnects on drop (server sends `retry: 3000`).
 *
 * @param onEvent  called for each order event
 * @param orderId  when set, the server only forwards that order's events
 */
export function useOrderStream(
  onEvent: (event: OrderEvent) => void,
  orderId?: string,
): void {
  const callbackRef = React.useRef(onEvent);
  React.useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  React.useEffect(() => {
    const url = orderId
      ? `/api/events?orderId=${encodeURIComponent(orderId)}`
      : "/api/events";
    const source = new EventSource(url);

    source.addEventListener("order", (e) => {
      try {
        callbackRef.current(JSON.parse((e as MessageEvent).data) as OrderEvent);
      } catch {
        // ignore malformed payloads
      }
    });

    return () => source.close();
  }, [orderId]);
}
