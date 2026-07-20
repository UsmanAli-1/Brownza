import { getAdminSession } from "@/lib/auth";
import { subscribeOrderEvents } from "@/lib/events";
import type { OrderEvent } from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream of order events.
 *  - `?orderId=<id>`  → public; forwards only that order's events (tracking).
 *  - no `orderId`     → admin only; forwards all events (dashboard firehose).
 */
export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("orderId");

  if (!orderId && !(await getAdminSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
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

      // Tell the browser EventSource to reconnect after 3s if dropped.
      send("retry: 3000\n\n");
      send("event: ping\ndata: connected\n\n");

      unsubscribe = subscribeOrderEvents((event: OrderEvent) => {
        if (orderId && event.orderId !== orderId) return;
        send(`event: order\ndata: ${JSON.stringify(event)}\n\n`);
      });

      heartbeat = setInterval(() => send(`event: ping\ndata: ${Date.now()}\n\n`), 25000);

      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe?.();
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
