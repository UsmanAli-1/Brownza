import { EventEmitter } from "node:events";

export interface PreOrderEvent {
  type: "preorder.created";
  id: string;
  fullName: string;
}

const globalForEvents = globalThis as unknown as {
  _preOrderEvents?: EventEmitter;
};

const emitter = globalForEvents._preOrderEvents ?? new EventEmitter();
emitter.setMaxListeners(0);
globalForEvents._preOrderEvents = emitter;

const CHANNEL = "preorder";

export function emitPreOrderEvent(event: PreOrderEvent): void {
  emitter.emit(CHANNEL, event);
}

export function subscribePreOrderEvents(
  listener: (event: PreOrderEvent) => void,
): () => void {
  emitter.on(CHANNEL, listener);
  return () => {
    emitter.off(CHANNEL, listener);
  };
}