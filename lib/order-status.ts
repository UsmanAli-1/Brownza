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

/** Single forward step for each status (null = terminal / no forward step). */
export const ORDER_STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "out-for-delivery",
  "out-for-delivery": "delivered",
  delivered: null,
  cancelled: null,
};

/** Valid transitions — enforced on the server so steps can't be skipped. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out-for-delivery", "cancelled"],
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

/** Button label for advancing an order into a given status. */
export const ADVANCE_LABEL: Record<OrderStatus, string> = {
  pending: "Set pending",
  accepted: "Accept order",
  preparing: "Start preparing",
  ready: "Mark as ready",
  "out-for-delivery": "Out for delivery",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
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
