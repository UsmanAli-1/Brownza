import mongoose, { Schema, type Model } from "mongoose";
import { ORDER_TYPES } from "@/lib/validations/pre-order";

/**
 * PreOrderType mirrors the exact string union from
 * lib/validations/pre-order.ts (`ORDER_TYPES`) — kept as a type alias
 * rather than redeclared here, so the form, the Zod schema and the Mongo
 * schema can never drift out of sync with each other.
 */
export type PreOrderType = (typeof ORDER_TYPES)[number];

export const PRE_ORDER_STATUSES = ["new", "contacted", "closed"] as const;
export type PreOrderStatus = (typeof PRE_ORDER_STATUSES)[number];

export interface PreOrderDoc {
  fullName: string;
  phone: string;
  email?: string;
  orderType: PreOrderType;
  description: string;
  status: PreOrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PreOrderSchema = new Schema<PreOrderDoc>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    orderType: { type: String, enum: ORDER_TYPES, required: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: PRE_ORDER_STATUSES, default: "new" },
  },
  { timestamps: true },
);

PreOrderSchema.index({ createdAt: -1 });
PreOrderSchema.index({ status: 1, createdAt: -1 });

export const PreOrder: Model<PreOrderDoc> =
  (mongoose.models.PreOrder as Model<PreOrderDoc>) ||
  mongoose.model<PreOrderDoc>("PreOrder", PreOrderSchema);