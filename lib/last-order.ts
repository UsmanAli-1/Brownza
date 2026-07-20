export const LAST_ORDER_KEY = "brownza-last-order";

export interface LastOrder {
  id: string;
  orderNumber: string;
}

export function saveLastOrder(order: LastOrder): void {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // storage unavailable — tracking just won't persist
  }
}

export function readLastOrder(): LastOrder | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}

export function clearLastOrder(): void {
  try {
    localStorage.removeItem(LAST_ORDER_KEY);
  } catch {
    // no-op
  }
}
