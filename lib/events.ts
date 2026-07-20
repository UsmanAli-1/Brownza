import { EventEmitter } from "node:events";
import type { OrderEvent } from "@/types/order";

/**
 * Process-wide order event bus. Kept on `globalThis` so it survives HMR and is
 * shared across all requests/SSE connections in a single Node server.
 *
 * Note: this in-memory bus assumes a single server instance (self-hosted /
 * `next start`). A multi-instance/serverless deployment would need an external
 * pub/sub (Redis) — the emit/subscribe API here stays the same.
 */
const globalForEvents = globalThis as unknown as {
  _orderEvents?: EventEmitter;
};

const emitter = globalForEvents._orderEvents ?? new EventEmitter();
emitter.setMaxListeners(0); // allow many concurrent SSE subscribers
globalForEvents._orderEvents = emitter;

const CHANNEL = "order";

export function emitOrderEvent(event: OrderEvent): void {
  emitter.emit(CHANNEL, event);
}

export function subscribeOrderEvents(
  listener: (event: OrderEvent) => void,
): () => void {
  emitter.on(CHANNEL, listener);
  return () => {
    emitter.off(CHANNEL, listener);
  };
}
