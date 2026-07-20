import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order, type OrderDoc } from "@/lib/models/order";
import { cloudinary } from "@/lib/cloudinary";
import { emitOrderEvent } from "@/lib/events";
import { logActivity } from "@/lib/services/activity-service";
import { canTransition } from "@/lib/order-status";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import type {
  AnalyticsData,
  CreateOrderInput,
  DashboardStats,
  OrderEvent,
  OrderRecord,
  OrderTrackView,
  PaginatedOrders,
} from "@/types/order";

type OrderLean = OrderDoc & { _id: mongoose.Types.ObjectId };

export class InvalidTransitionError extends Error {
  constructor(
    public from: OrderStatus,
    public to: OrderStatus,
  ) {
    super(`Cannot change order status from "${from}" to "${to}"`);
    this.name = "InvalidTransitionError";
  }
}

function serialize(o: OrderLean): OrderRecord {
  return {
    _id: o._id.toString(),
    orderNumber: o.orderNumber,
    customer: {
      name: o.customer.name,
      phone: o.customer.phone,
      whatsapp: o.customer.whatsapp,
      email: o.customer.email,
    },
    delivery: {
      address: o.delivery.address,
      city: o.delivery.city,
      notes: o.delivery.notes,
    },
    items: o.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    payment: {
      method: o.payment.method,
      screenshotUrl: o.payment.screenshotUrl,
      screenshotPublicId: o.payment.screenshotPublicId,
      paymentVerified: o.payment.paymentVerified,
      paymentVerifiedAt: o.payment.paymentVerifiedAt
        ? new Date(o.payment.paymentVerifiedAt).toISOString()
        : null,
    },
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: o.status,
    cancellationReason: o.cancellationReason,
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
  };
}

function broadcast(record: OrderRecord, type: OrderEvent["type"]): void {
  emitOrderEvent({
    type,
    orderId: record._id,
    orderNumber: record.orderNumber,
    status: record.status,
    paymentVerified: record.payment.paymentVerified,
    cancellationReason: record.cancellationReason,
  });
}

// ---- Mutations ----

export async function createOrder(
  input: CreateOrderInput,
): Promise<OrderRecord> {
  await connectToDatabase();
  const count = await Order.countDocuments();
  const created = await Order.create({
    orderNumber: `BRZ-${count + 1}`,
    customer: input.customer,
    delivery: input.delivery,
    items: input.items,
    payment: {
      method: input.payment.method,
      screenshotUrl: input.payment.screenshotUrl,
      screenshotPublicId: input.payment.screenshotPublicId,
      paymentVerified: false,
      paymentVerifiedAt: null,
    },
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: "pending",
  });
  const record = serialize(created.toObject() as unknown as OrderLean);
  broadcast(record, "order.created");
  await logActivity({
    type: "order.created",
    orderId: record._id,
    orderNumber: record.orderNumber,
    message: `New order ${record.orderNumber} received`,
  });
  return record;
}

export async function updateOrderStatus(
  id: string,
  next: OrderStatus,
  reason?: string,
): Promise<OrderRecord | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await Order.findById(id);
  if (!doc) return null;

  if (!canTransition(doc.status, next)) {
    throw new InvalidTransitionError(doc.status, next);
  }

  doc.status = next;
  if (next === "cancelled") {
    doc.cancellationReason = reason?.trim() || undefined;
  }
  await doc.save();

  const record = serialize(doc.toObject() as unknown as OrderLean);

  if (next === "cancelled") {
    broadcast(record, "order.cancelled");
    await logActivity({
      type: "order.cancelled",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} cancelled${
        record.cancellationReason ? `: ${record.cancellationReason}` : ""
      }`,
    });
  } else if (next === "delivered") {
    broadcast(record, "order.delivered");
    await logActivity({
      type: "order.delivered",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} delivered`,
    });
  } else if (next === "accepted") {
    broadcast(record, "order.updated");
    await logActivity({
      type: "order.accepted",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} accepted`,
    });
  } else {
    broadcast(record, "order.updated");
    await logActivity({
      type: "status.updated",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} marked ${next.replace(/-/g, " ")}`,
    });
  }

  return record;
}

export async function verifyOrderPayment(
  id: string,
): Promise<OrderRecord | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await Order.findByIdAndUpdate(
    id,
    {
      "payment.paymentVerified": true,
      "payment.paymentVerifiedAt": new Date(),
    },
    { new: true },
  ).lean<OrderLean>();
  if (!doc) return null;
  const record = serialize(doc);
  broadcast(record, "payment.verified");
  await logActivity({
    type: "payment.verified",
    orderId: record._id,
    orderNumber: record.orderNumber,
    message: `Payment verified for ${record.orderNumber}`,
  });
  return record;
}

// ---- Reads ----

function buildFilter(opts: {
  status?: OrderStatus;
  search?: string;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (opts.status) filter.status = opts.status;
  if (opts.search) {
    const rx = new RegExp(
      opts.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = [
      { orderNumber: rx },
      { "customer.name": rx },
      { "customer.phone": rx },
      { "customer.whatsapp": rx },
    ];
  }
  return filter;
}

export interface ListOrdersOptions {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listOrders(
  opts: ListOrdersOptions = {},
): Promise<PaginatedOrders> {
  await connectToDatabase();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));
  const filter = buildFilter(opts);

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<OrderLean[]>(),
    Order.countDocuments(filter),
  ]);

  return {
    orders: docs.map(serialize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLatestOrders(limit = 8): Promise<OrderRecord[]> {
  await connectToDatabase();
  const docs = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<OrderLean[]>();
  return docs.map(serialize);
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await Order.findById(id).lean<OrderLean>();
  return doc ? serialize(doc) : null;
}

/** Customer-safe tracking view fetched by Mongo id (non-enumerable). */
export async function getOrderTrackById(
  id: string,
): Promise<OrderTrackView | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const o = await Order.findById(id).lean<OrderLean>();
  if (!o) return null;
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    cancellationReason: o.cancellationReason,
    paymentMethod: o.payment.method,
    paymentVerified: o.payment.paymentVerified,
    items: o.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    deliveryArea: o.delivery.city,
    customerFirstName: o.customer.name.split(" ")[0] || o.customer.name,
    createdAt: new Date(o.createdAt).toISOString(),
  };
}

// ---- Dashboard + analytics (single aggregation each) ----

interface DashboardFacet {
  byStatus: { _id: OrderStatus; count: number }[];
  overall: { _id: null; count: number; sum: number }[];
  deliveredRevenue: { _id: null; revenue: number }[];
  today: { _id: null; count: number }[];
  todayRevenue: { _id: null; revenue: number }[];
  pendingOnline: { count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = (await Order.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        overall: [
          { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: "$total" } } },
        ],
        deliveredRevenue: [
          { $match: { status: "delivered" } },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ],
        today: [
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
        todayRevenue: [
          { $match: { status: "delivered", createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ],
        pendingOnline: [
          {
            $match: {
              "payment.method": "ONLINE",
              "payment.paymentVerified": false,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ])) as DashboardFacet[];

  const facet = result[0];
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;
  for (const row of facet.byStatus) byStatus[row._id] = row.count;

  const total = facet.overall[0]?.count ?? 0;
  const sumAll = facet.overall[0]?.sum ?? 0;

  return {
    total,
    byStatus,
    todayOrders: facet.today[0]?.count ?? 0,
    todayRevenue: facet.todayRevenue[0]?.revenue ?? 0,
    totalRevenue: facet.deliveredRevenue[0]?.revenue ?? 0,
    pendingOnlinePayments: facet.pendingOnline[0]?.count ?? 0,
    averageOrderValue: total > 0 ? Math.round(sumAll / total) : 0,
  };
}

interface AnalyticsFacet {
  topProducts: { _id: string; quantity: number; revenue: number }[];
  thisWeek: { count: number }[];
  thisMonth: { count: number }[];
  revenueThisMonth: { _id: null; revenue: number }[];
  avgDeliveryFee: { _id: null; avg: number }[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  await connectToDatabase();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = (await Order.aggregate([
    {
      $facet: {
        topProducts: [
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productName",
              quantity: { $sum: "$items.quantity" },
              revenue: {
                $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
              },
            },
          },
          { $sort: { quantity: -1 } },
          { $limit: 5 },
        ],
        thisWeek: [
          { $match: { createdAt: { $gte: startOfWeek } } },
          { $count: "count" },
        ],
        thisMonth: [
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $count: "count" },
        ],
        revenueThisMonth: [
          { $match: { status: "delivered", createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ],
        avgDeliveryFee: [
          { $group: { _id: null, avg: { $avg: "$deliveryFee" } } },
        ],
      },
    },
  ])) as AnalyticsFacet[];

  const facet = result[0];
  const topProducts = facet.topProducts.map((p) => ({
    productName: p._id,
    quantity: p.quantity,
    revenue: p.revenue,
  }));

  return {
    topProducts,
    mostOrderedProduct: topProducts[0]?.productName ?? null,
    ordersThisWeek: facet.thisWeek[0]?.count ?? 0,
    ordersThisMonth: facet.thisMonth[0]?.count ?? 0,
    revenueThisMonth: facet.revenueThisMonth[0]?.revenue ?? 0,
    averageDeliveryFee: Math.round(facet.avgDeliveryFee[0]?.avg ?? 0),
  };
}

// ---- Cloudinary screenshot cleanup ----

export interface DeleteScreenshotsResult {
  deleted: number;
  failed: number;
  ordersUpdated: number;
}

export async function deleteAllScreenshots(): Promise<DeleteScreenshotsResult> {
  await connectToDatabase();
  const docs = await Order.find(
    { "payment.screenshotPublicId": { $exists: true, $ne: null } },
    { "payment.screenshotPublicId": 1 },
  ).lean<{ payment: { screenshotPublicId?: string } }[]>();

  const publicIds = docs
    .map((d) => d.payment.screenshotPublicId)
    .filter((x): x is string => !!x);

  let deleted = 0;
  let failed = 0;
  const BATCH = 100; // Cloudinary delete_resources accepts up to 100 ids/call

  for (let i = 0; i < publicIds.length; i += BATCH) {
    const chunk = publicIds.slice(i, i + BATCH);
    try {
      const res = await cloudinary.api.delete_resources(chunk);
      const outcomes = (res.deleted ?? {}) as Record<string, string>;
      deleted += Object.values(outcomes).filter((v) => v === "deleted").length;
    } catch (error) {
      console.error("Cloudinary batch delete failed", error);
      failed += chunk.length;
    }
  }

  const upd = await Order.updateMany(
    { "payment.screenshotPublicId": { $exists: true } },
    { $unset: { "payment.screenshotUrl": "", "payment.screenshotPublicId": "" } },
  );

  return { deleted, failed, ordersUpdated: upd.modifiedCount };
}
