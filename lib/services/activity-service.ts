import type mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Activity, type ActivityDoc, type ActivityType } from "@/lib/models/activity";
import type { ActivityRecord } from "@/types/order";

type ActivityLean = ActivityDoc & { _id: mongoose.Types.ObjectId };

export async function logActivity(input: {
  type: ActivityType;
  orderId: string | mongoose.Types.ObjectId;
  orderNumber: string;
  message: string;
}): Promise<void> {
  try {
    await Activity.create(input);
  } catch (error) {
    // Activity logging must never break the primary action.
    console.error("logActivity failed", error);
  }
}

export async function getRecentActivity(limit = 20): Promise<ActivityRecord[]> {
  await connectToDatabase();
  const docs = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<ActivityLean[]>();
  return docs.map((d) => ({
    _id: d._id.toString(),
    type: d.type,
    orderId: d.orderId.toString(),
    orderNumber: d.orderNumber,
    message: d.message,
    createdAt: new Date(d.createdAt).toISOString(),
  }));
}
