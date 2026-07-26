import { connectToDatabase } from "@/lib/db/mongoose";
import { PreOrder, type PreOrderDoc, type PreOrderType } from "@/lib/models/pre-order";

export interface CreatePreOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  orderType: PreOrderType;
  description: string;
}

export async function createPreOrder(
  input: CreatePreOrderInput,
): Promise<PreOrderDoc & { _id: string }> {
  await connectToDatabase();
  const doc = await PreOrder.create(input);
  return doc.toObject({ flattenObjectIds: true }) as PreOrderDoc & { _id: string };
}

export async function listPreOrders() {
  await connectToDatabase();
  return PreOrder.find().sort({ createdAt: -1 }).lean();
}