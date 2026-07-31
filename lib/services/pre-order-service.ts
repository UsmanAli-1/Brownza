import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PreOrder, type PreOrderDoc, type PreOrderType } from "@/lib/models/pre-order";

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

  return record;
}

export interface PaginatedPreOrders {
  submissions: (PreOrderDoc & { _id: mongoose.Types.ObjectId })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated — an unbounded `find()` here would slow down linearly with every
 * submission ever received, same problem `listOrders()` already solves for
 * the orders list. `createdAt: -1` is covered by the index on that field
 * (lib/models/pre-order.ts), so sorting doesn't require an in-memory sort.
 */
export async function listPreOrders(
  opts: { page?: number; pageSize?: number } = {},
): Promise<PaginatedPreOrders> {
  await connectToDatabase();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));

  const [submissions, total] = await Promise.all([
    PreOrder.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<(PreOrderDoc & { _id: mongoose.Types.ObjectId })[]>(),
    PreOrder.countDocuments(),
  ]);

  return {
    submissions,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
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