import mongoose, { Schema, type Model } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import type { OrderPaymentMethod } from "@/types/order";

/** Mongoose document shape (dates as `Date`). */
export interface OrderDoc {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    whatsapp: string;
    email?: string;
  };
  delivery: {
    address: string;
    city: string;
    notes?: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  payment: {
    method: OrderPaymentMethod;
    screenshotUrl?: string;
    screenshotPublicId?: string;
    paymentVerified: boolean;
    paymentVerifiedAt?: Date | null;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      whatsapp: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    delivery: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      notes: { type: String, trim: true },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: (v: unknown[]) => Array.isArray(v) && v.length > 0,
    },
    payment: {
      method: { type: String, enum: ["COD", "ONLINE"], required: true },
      screenshotUrl: { type: String },
      screenshotPublicId: { type: String },
      paymentVerified: { type: Boolean, default: false },
      paymentVerifiedAt: { type: Date, default: null },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true },
);

// Indexes tuned for the actual admin queries (list, filter, search, stats).
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "payment.method": 1, "payment.paymentVerified": 1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ "customer.name": 1 });
OrderSchema.index({ "customer.whatsapp": 1 });
// Note: the admin search's case-insensitive substring regex ($or across the
// fields above) still can't use these indexes for a seek — only exact/prefix
// matches can. They help other exact-match query paths; if search itself
// becomes a bottleneck at scale, switch to a MongoDB text/Atlas Search index
// (a matching-semantics change, not a drop-in swap) rather than more regex
// indexes.

// Reuse the compiled model across hot reloads.
export const Order: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) ||
  mongoose.model<OrderDoc>("Order", OrderSchema);
