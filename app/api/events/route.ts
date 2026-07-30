import { getAdminSession } from "@/lib/auth";
import { subscribeOrderEvents } from "@/lib/events";
import { subscribePreOrderEvents } from "@/lib/pre-order-events";
import type { OrderEvent } from "@/types/order";
import type { PreOrderEvent } from "@/lib/pre-order-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream — single connection carrying BOTH order and
 * pre-order events for the admin dashboard (merged here on purpose: two
 * separate permanent EventSource connections were competing for the
 * browser's per-origin connection limit, which was silently starving this
 * stream and breaking the new-order notification sound).
 *  - `?orderId=<id>`  → public; forwards only that order's events (tracking).
 *    Pre-order events are never sent on this branch — tracking is customer-
 *    facing and order-specific.
 *  - no `orderId`     → admin only; forwards all order + pre-order events.
 */
export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("orderId");

  if (!orderId && !(await getAdminSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribeOrders: (() => void) | null = null;
  let unsubscribePreOrders: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // stream already closed
        }
      };

      send("retry: 3000\n\n");
      send("event: ping\ndata: connected\n\n");

      unsubscribeOrders = subscribeOrderEvents((event: OrderEvent) => {
        if (orderId && event.orderId !== orderId) return;
        send(`event: order\ndata: ${JSON.stringify(event)}\n\n`);
      });

      // Admin firehose only — the tracking (`?orderId=`) branch is
      // customer-facing and has nothing to do with pre-orders.
      if (!orderId) {
        unsubscribePreOrders = subscribePreOrderEvents((event: PreOrderEvent) => {
          send(`event: preorder\ndata: ${JSON.stringify(event)}\n\n`);
        });
      }

      heartbeat = setInterval(() => send(`event: ping\ndata: ${Date.now()}\n\n`), 25000);

      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribeOrders?.();
        unsubscribePreOrders?.();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribeOrders?.();
      unsubscribePreOrders?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}