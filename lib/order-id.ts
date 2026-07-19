import { ORDER_COUNTER_KEY } from "@/lib/constants";

/**
 * Generate a sequential order id (BRZ-1, BRZ-2, …) using a localStorage
 * counter so ids increment within a browser. When the real backend lands,
 * this is replaced by a server-generated id.
 */
export function nextOrderId(): string {
  let n = 1;
  try {
    const prev = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) ?? "", 10);
    n = Number.isFinite(prev) && prev > 0 ? prev + 1 : 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(n));
  } catch {
    // localStorage unavailable — fall back to a time-derived number.
    n = Math.floor(Date.now() % 100000);
  }
  return `BRZ-${n}`;
}
