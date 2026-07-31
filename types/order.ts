import type { OrderStatus } from "@/types";

export type OrderPaymentMethod = "COD" | "ONLINE";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
}

export interface OrderDelivery {
  address: string;
  city: string;
  notes?: string;
}

export interface OrderPayment {
  method: OrderPaymentMethod;
  screenshotUrl?: string;
  screenshotPublicId?: string;
  paymentVerified: boolean;
  paymentVerifiedAt?: string | null;
}

/** Plain (JSON-serialisable) order shape returned by the API. */
export interface OrderRecord {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: OrderItem[];
  payment: OrderPayment;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** Customer-safe order view for the public tracking page (no PII beyond area). */
export interface OrderTrackView {
  orderNumber: string;
  status: OrderStatus;
  cancellationReason?: string;
  paymentMethod: OrderPaymentMethod;
  paymentVerified: boolean;
  items: { productName: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryArea: string;
  customerFirstName: string;
  createdAt: string;
}

export interface PaginatedOrders {
  orders: OrderRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<OrderStatus, number>;
  todayOrders: number;
  todayRevenue: number;
  /** Product-price-only revenue (subtotal) of delivered orders. */
  totalRevenue: number;
  /** Delivery-fee total of delivered orders — tracked separately from
   * product revenue so it isn't double-counted as sales. */
  totalDeliveryRevenue: number;
  pendingOnlinePayments: number;
}

export interface AnalyticsData {
  topProducts: { productName: string; quantity: number; revenue: number }[];
  mostOrderedProduct: string | null;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  averageDeliveryFee: number;
}

export interface ActivityRecord {
  _id: string;
  type: string;
  orderId: string;
  orderNumber: string;
  message: string;
  createdAt: string;
}

/** Body accepted by POST /api/orders. */
export interface CreateOrderInput {
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: OrderItem[];
  payment: {
    method: OrderPaymentMethod;
    screenshotUrl?: string;
    screenshotPublicId?: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
}
