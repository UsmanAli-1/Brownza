import mongoose, { Schema, type Model } from "mongoose";

export const ACTIVITY_TYPES = [
  "order.created",
  "order.accepted",
  "status.updated",
  "payment.verified",
  "order.cancelled",
  "order.delivered",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityDoc {
  type: ActivityType;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  message: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<ActivityDoc>(
  {
    type: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ActivitySchema.index({ createdAt: -1 });

export const Activity: Model<ActivityDoc> =
  (mongoose.models.Activity as Model<ActivityDoc>) ||
  mongoose.model<ActivityDoc>("Activity", ActivitySchema);
