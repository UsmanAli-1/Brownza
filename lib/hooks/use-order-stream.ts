"use client";

import * as React from "react";
import type { OrderEvent } from "@/types/order";
import type { PreOrderEvent } from "@/lib/pre-order-events";

/**
 * Subscribe to the shared admin SSE stream. Maintains a single EventSource
 * per mount; the browser auto-reconnects on drop (server sends `retry:
 * 3000`). Pre-order events are optional and only ever arrive on the
 * no-`orderId` (admin firehose) branch — customer order tracking
 * (`orderId` set) never receives them.
 *
 * @param onEvent        called for each order event
 * @param orderId        when set, the server only forwards that order's events
 * @param onPreOrderEvent optional — called for each pre-order event (admin only)
 */
export function useOrderStream(
  onEvent: (event: OrderEvent) => void,
  orderId?: string,
  onPreOrderEvent?: (event: PreOrderEvent) => void,
): void {
  const callbackRef = React.useRef(onEvent);
  const preOrderCallbackRef = React.useRef(onPreOrderEvent);
  React.useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);
  React.useEffect(() => {
    preOrderCallbackRef.current = onPreOrderEvent;
  }, [onPreOrderEvent]);

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

    source.addEventListener("preorder", (e) => {
      if (!preOrderCallbackRef.current) return;
      try {
        preOrderCallbackRef.current(
          JSON.parse((e as MessageEvent).data) as PreOrderEvent,
        );
      } catch {
        // ignore malformed payloads
      }
    });

    return () => source.close();
  }, [orderId]);
}