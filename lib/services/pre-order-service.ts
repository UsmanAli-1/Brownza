import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PreOrder, type PreOrderDoc, type PreOrderType } from "@/lib/models/pre-order";
import { emitPreOrderEvent } from "@/lib/pre-order-events";

export interface CreatePreOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  orderType: PreOrderType;
  description: string;
  preferredDateTime: string;
}

export async function createPreOrder(
  input: CreatePreOrderInput,
): Promise<PreOrderDoc & { _id: string }> {
  await connectToDatabase();
  const doc = await PreOrder.create({
    ...input,
    preferredDateTime: new Date(input.preferredDateTime),
  });
  const record = doc.toObject({ flattenObjectIds: true }) as PreOrderDoc & { _id: string };

  emitPreOrderEvent({
    type: "preorder.created",
    id: record._id,
    fullName: record.fullName,
  });

  return record;
}

export async function listPreOrders() {
  await connectToDatabase();
  return PreOrder.find().sort({ createdAt: -1 }).lean();
}

export async function getPreOrderById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  return PreOrder.findById(id).lean();
}

export async function deletePreOrder(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  await connectToDatabase();
  const res = await PreOrder.deleteOne({ _id: id });
  return (res.deletedCount ?? 0) > 0;
}

export async function deleteAllPreOrders(): Promise<{ deletedCount: number }> {
  await connectToDatabase();
  const res = await PreOrder.deleteMany({});
  return { deletedCount: res.deletedCount ?? 0 };
}

export async function countUnreadPreOrders(): Promise<number> {
  await connectToDatabase();
  return PreOrder.countDocuments({ read: false });
}

export async function markAllPreOrdersRead(): Promise<void> {
  await connectToDatabase();
  await PreOrder.updateMany({ read: false }, { $set: { read: true } });
}

/** Marks a single request as read — called when its detail page is viewed,
 * so the unread badge decrements one at a time instead of clearing to zero
 * just because the admin opened the list. */
export async function markPreOrderRead(id: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(id)) return;
  await connectToDatabase();
  await PreOrder.updateOne({ _id: id, read: false }, { $set: { read: true } });
}