"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `true` only after the component has mounted/hydrated on the client.
 *
 * Implemented with `useSyncExternalStore` (server snapshot `false`, client
 * snapshot `true`) so it's the idiomatic hydration check — no setState-in-
 * effect — while still matching the server-rendered markup on first paint.
 * Used to gate UI that depends on persisted (localStorage) state.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
