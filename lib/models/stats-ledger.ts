import mongoose, { Schema, type Model } from "mongoose";

export interface StatsLedgerDoc {
  singleton: "global";
  ordersCreated: number;
  revenueCreated: number;
  deliveredOrders: number;
  /** Product-price-only revenue (subtotal) of delivered orders — delivery
   * charges are tracked separately in `deliveredDeliveryRevenue` and must
   * never be folded back into this figure. */
  deliveredRevenue: number;
  /** Sum of `deliveryFee` across delivered orders — kept apart from product
   * revenue so "Total revenue" reflects sales, not delivery logistics. */
  deliveredDeliveryRevenue: number;
}

const StatsLedgerSchema = new Schema<StatsLedgerDoc>({
  singleton: { type: String, required: true, unique: true, default: "global" },
  ordersCreated: { type: Number, default: 0 },
  revenueCreated: { type: Number, default: 0 },
  deliveredOrders: { type: Number, default: 0 },
  deliveredRevenue: { type: Number, default: 0 },
  deliveredDeliveryRevenue: { type: Number, default: 0 },
});

export const StatsLedger: Model<StatsLedgerDoc> =
  (mongoose.models.StatsLedger as Model<StatsLedgerDoc>) ||
  mongoose.model<StatsLedgerDoc>("StatsLedger", StatsLedgerSchema);

export async function getLedger(): Promise<StatsLedgerDoc> {
  const doc = await StatsLedger.findOneAndUpdate(
    { singleton: "global" },
    { $setOnInsert: { singleton: "global" } },
    { upsert: true, returnDocument: "after" },
  ).lean();
  return doc as unknown as StatsLedgerDoc;
}

export async function recordOrderCreated(total: number): Promise<void> {
  await StatsLedger.updateOne(
    { singleton: "global" },
    { $inc: { ordersCreated: 1, revenueCreated: total } },
    { upsert: true },
  );
}

export async function recordOrderDelivered(
  productRevenue: number,
  deliveryRevenue: number,
): Promise<void> {
  await StatsLedger.updateOne(
    { singleton: "global" },
    {
      $inc: {
        deliveredOrders: 1,
        deliveredRevenue: productRevenue,
        deliveredDeliveryRevenue: deliveryRevenue,
      },
    },
    { upsert: true },
  );
}