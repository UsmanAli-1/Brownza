import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order, type OrderDoc } from "@/lib/models/order";
import { Activity } from "@/lib/models/activity";
import { getLedger, recordOrderCreated, recordOrderDelivered } from "@/lib/models/stats-ledger";
import { recordMonthlyDelivered, getMonthlyRevenue } from "@/lib/models/monthly-stats";
import { nextSequence } from "@/lib/models/counter";
import { cloudinary } from "@/lib/cloudinary";
import { logActivity } from "@/lib/services/activity-service";
import { canTransition } from "@/lib/order-status";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import type {
  AnalyticsData,
  CreateOrderInput,
  DashboardStats,
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

// ---- Mutations ----

export async function createOrder(
  input: CreateOrderInput,
): Promise<OrderRecord> {
  await connectToDatabase();
  const seq = await nextSequence("orderNumber");
  const created = await Order.create({
    orderNumber: `BRZ-${seq}`,
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

  // Neither the ledger increment nor the activity log needs to block the
  // customer's response — the order is already saved and confirmed by this
  // point, so both run fire-and-forget instead of adding two more
  // sequential round-trips to every checkout.
  void recordOrderCreated(record.total).catch((err) =>
    console.error("recordOrderCreated failed", err),
  );
  void logActivity({
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

  // Logging never needs to block the admin's response — the status change
  // is already saved by this point.
  if (next === "cancelled") {
    void logActivity({
      type: "order.cancelled",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} cancelled${
        record.cancellationReason ? `: ${record.cancellationReason}` : ""
      }`,
    });
  } else if (next === "delivered") {
    // Both ledgers record here — "delivered" is terminal, so this revenue
    // is permanently counted regardless of what happens to the order
    // document afterward, including deletion. Run together, fire-and-forget.
    // Product revenue (subtotal) and delivery-charge revenue are tracked
    // separately so "Total/Monthly revenue" reflect sales only, not the
    // delivery fee collected alongside them.
    void Promise.all([
      recordOrderDelivered(record.subtotal, record.deliveryFee),
      recordMonthlyDelivered(record.subtotal),
    ]).catch((err) => console.error("delivered ledger update failed", err));

    void logActivity({
      type: "order.delivered",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} delivered`,
    });
  } else if (next === "accepted") {
    void logActivity({
      type: "order.accepted",
      orderId: record._id,
      orderNumber: record.orderNumber,
      message: `Order ${record.orderNumber} accepted`,
    });
  } else {
    void logActivity({
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
    { returnDocument: "after" },
  ).lean<OrderLean>();
  if (!doc) return null;
  const record = serialize(doc);
  void logActivity({
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
  todayOnly?: boolean;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (opts.status) filter.status = opts.status;
  if (opts.todayOnly) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: start };
  }
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
  todayOnly?: boolean;
  sort?: "operational" | "recent";
}

export async function listOrders(
  opts: ListOrdersOptions = {},
): Promise<PaginatedOrders> {
  await connectToDatabase();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));
  const match = buildFilter(opts);

  const result = (await Order.aggregate([
    { $match: match },
    ...(opts.sort === "recent"
      ? [{ $sort: { createdAt: -1 as const } }]
      : [
          {
            $addFields: {
              _sortGroup: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$status", "delivered"] }, then: 1 },
                    { case: { $eq: ["$status", "cancelled"] }, then: 2 },
                  ],
                  default: 0,
                },
              },
            },
          },
          { $sort: { _sortGroup: 1 as const, createdAt: -1 as const } },
        ]),
    {
      $facet: {
        data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        count: [{ $count: "total" }],
      },
    },
  ])
    // The "operational" sort's _sortGroup is computed, not indexed, so
    // large result sets can exceed Mongo's default 100MB in-memory sort
    // limit — let it spill to disk rather than throwing.
    .allowDiskUse(true)) as { data: OrderLean[]; count: { total: number }[] }[];

  const facet = result[0];
  const total = facet?.count[0]?.total ?? 0;
  return {
    orders: (facet?.data ?? []).map(serialize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface CustomerExportRow {
  orderNumber: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  createdAt: string;
}

const EXPORT_LIMIT = 20_000;

/** Customer contact details only, for the All Orders CSV export — respects the current search/status filter, ignores pagination. */
export async function listCustomerExport(opts: {
  status?: OrderStatus;
  search?: string;
}): Promise<CustomerExportRow[]> {
  await connectToDatabase();
  const filter = buildFilter(opts);
  const docs = await Order.find(filter)
    .select(
      "orderNumber customer.name customer.phone customer.whatsapp customer.email delivery.address delivery.city createdAt",
    )
    .sort({ createdAt: -1 })
    .limit(EXPORT_LIMIT)
    .lean<OrderLean[]>();

  return docs.map((o) => ({
    orderNumber: o.orderNumber,
    name: o.customer.name,
    phone: o.customer.phone,
    whatsapp: o.customer.whatsapp,
    email: o.customer.email,
    address: o.delivery.address,
    city: o.delivery.city,
    createdAt: new Date(o.createdAt).toISOString(),
  }));
}

interface TodayFacet {
  byStatus: { _id: OrderStatus; count: number }[];
  total: { count: number }[];
  revenue: { _id: null; revenue: number }[];
  deliveryCharges: { _id: null; deliveryCharges: number }[];
}

export interface TodayStats {
  todayOrders: number;
  /** Product-price-only revenue (subtotal) of orders delivered today. */
  todayRevenue: number;
  /** Delivery-fee total of orders delivered today — tracked separately from
   * product revenue. */
  todayDeliveryCharges: number;
  byStatus: Record<OrderStatus, number>;
}

export async function getTodayStats(): Promise<TodayStats> {
  await connectToDatabase();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const result = (await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        total: [{ $count: "count" }],
        revenue: [
          { $match: { status: "delivered" } },
          { $group: { _id: null, revenue: { $sum: "$subtotal" } } },
        ],
        deliveryCharges: [
          { $match: { status: "delivered" } },
          { $group: { _id: null, deliveryCharges: { $sum: "$deliveryFee" } } },
        ],
      },
    },
  ])) as TodayFacet[];

  const facet = result[0];
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;
  for (const row of facet.byStatus) byStatus[row._id] = row.count;

  return {
    todayOrders: facet.total[0]?.count ?? 0,
    todayRevenue: facet.revenue[0]?.revenue ?? 0,
    todayDeliveryCharges: facet.deliveryCharges[0]?.deliveryCharges ?? 0,
    byStatus,
  };
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await Order.findById(id).lean<OrderLean>();
  return doc ? serialize(doc) : null;
}

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

// ---- Dashboard + analytics ----

interface DashboardFacet {
  byStatus: { _id: OrderStatus; count: number }[];
  today: { _id: null; count: number }[];
  todayRevenue: { _id: null; revenue: number }[];
  pendingOnline: { count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ledger, facetResult] = await Promise.all([
    getLedger(),
    Order.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          today: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
          todayRevenue: [
            { $match: { status: "delivered", createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, revenue: { $sum: "$subtotal" } } },
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
    ]) as Promise<DashboardFacet[]>,
  ]);

  const facet = facetResult[0];
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;
  for (const row of facet.byStatus) byStatus[row._id] = row.count;

  return {
    total: ledger.ordersCreated,
    byStatus,
    todayOrders: facet.today[0]?.count ?? 0,
    todayRevenue: facet.todayRevenue[0]?.revenue ?? 0,
    totalRevenue: ledger.deliveredRevenue,
    totalDeliveryRevenue: ledger.deliveredDeliveryRevenue,
    pendingOnlinePayments: facet.pendingOnline[0]?.count ?? 0,
  };
}

interface AnalyticsFacet {
  topProducts: { _id: string; quantity: number; revenue: number }[];
  thisWeek: { count: number }[];
  thisMonth: { count: number }[];
  avgDeliveryFee: { _id: null; avg: number }[];
}

/**
 * `revenueThisMonth` now comes from the permanent MonthlyStats ledger
 * (lib/models/monthly-stats.ts) instead of live-aggregating the Order
 * collection — that's what makes it survive deleting orders. Order counts
 * (this week/month) and average delivery fee stay live, since those reflect
 * the current operational state rather than a historical financial record.
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  await connectToDatabase();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueThisMonth, result] = await Promise.all([
    getMonthlyRevenue(),
    Order.aggregate([
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
          avgDeliveryFee: [
            { $group: { _id: null, avg: { $avg: "$deliveryFee" } } },
          ],
        },
      },
    ]) as Promise<AnalyticsFacet[]>,
  ]);

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
    revenueThisMonth,
    averageDeliveryFee: Math.round(facet.avgDeliveryFee[0]?.avg ?? 0),
  };
}

// ---- Deletion (Cloudinary + Mongo) ----

async function deleteCloudinaryByPublicIds(
  publicIds: string[],
): Promise<{ deleted: number; failed: number }> {
  const ids = publicIds.filter(Boolean);
  let deleted = 0;
  let failed = 0;
  const BATCH = 100;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    try {
      const res = await cloudinary.api.delete_resources(chunk);
      const outcomes = (res.deleted ?? {}) as Record<string, string>;
      deleted += Object.values(outcomes).filter((v) => v === "deleted").length;
    } catch (error) {
      console.error("Cloudinary batch delete failed", error);
      failed += chunk.length;
    }
  }
  return { deleted, failed };
}

async function collectScreenshotPublicIds(
  filter: Record<string, unknown>,
): Promise<string[]> {
  const docs = await Order.find(
    { ...filter, "payment.screenshotPublicId": { $exists: true, $ne: null } },
    { "payment.screenshotPublicId": 1 },
  ).lean<{ payment: { screenshotPublicId?: string } }[]>();
  return docs
    .map((d) => d.payment.screenshotPublicId)
    .filter((x): x is string => !!x);
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  await connectToDatabase();
  const doc = await Order.findById(id).lean<OrderLean>();
  if (!doc) return false;
  if (doc.payment.screenshotPublicId) {
    await deleteCloudinaryByPublicIds([doc.payment.screenshotPublicId]);
  }
  await Order.deleteOne({ _id: doc._id });
  await Activity.deleteMany({ orderNumber: doc.orderNumber });
  return true;
}

export interface DeleteAllOrdersResult {
  deletedOrders: number;
  deletedScreenshots: number;
}

export async function deleteAllOrders(): Promise<DeleteAllOrdersResult> {
  await connectToDatabase();
  const publicIds = await collectScreenshotPublicIds({});
  await deleteCloudinaryByPublicIds(publicIds);
  const del = await Order.deleteMany({});
  await Activity.deleteMany({});
  return {
    deletedOrders: del.deletedCount ?? 0,
    deletedScreenshots: publicIds.length,
  };
}