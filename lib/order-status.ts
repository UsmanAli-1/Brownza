import { ORDER_STATUSES, type OrderStatus } from "@/types";

/** Display metadata for order statuses (labels + badge colours). */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-500",
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "Preparing",
    className: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
  },
  ready: {
    label: "Ready",
    className: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
  },
  "out-for-delivery": {
    label: "Out for delivery",
    className: "bg-indigo-100 text-indigo-800",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

/**
 * Options the single status dropdown offers from each status (also the
 * server-side transition allow-list). From Pending only Accept/Cancel; once
 * Accepted the bakery can pick any forward stage. Backward moves and changes
 * from terminal states are rejected.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "ready", "out-for-delivery", "delivered", "cancelled"],
  preparing: ["ready", "out-for-delivery", "delivered", "cancelled"],
  ready: ["out-for-delivery", "delivered", "cancelled"],
  "out-for-delivery": ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

/** Short labels used inside the status dropdown. */
export const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accept",
  preparing: "Preparing",
  ready: "Ready",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancel",
};

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: ORDER_STATUS_META[status].label,
}));

/** Forward-progress steps shown on the customer tracking timeline. */
export const LIFECYCLE_STEPS: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "out-for-delivery",
  "delivered",
];
