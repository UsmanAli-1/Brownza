import mongoose, { Schema, type Model } from "mongoose";

/**
 * One document per calendar month, incremented the instant an order is
 * delivered — never touched by order deletion. This is what makes
 * "Monthly revenue" survive deleting the underlying orders, same reasoning
 * as StatsLedger for lifetime totals.
 */
export interface MonthlyStatsDoc {
  /** "YYYY-MM", e.g. "2026-07" */
  month: string;
  orders: number;
  revenue: number;
}

const MonthlyStatsSchema = new Schema<MonthlyStatsDoc>({
  month: { type: String, required: true, unique: true },
  orders: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
});

export const MonthlyStats: Model<MonthlyStatsDoc> =
  (mongoose.models.MonthlyStats as Model<MonthlyStatsDoc>) ||
  mongoose.model<MonthlyStatsDoc>("MonthlyStats", MonthlyStatsSchema);

export function currentMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function recordMonthlyDelivered(total: number): Promise<void> {
  await MonthlyStats.updateOne(
    { month: currentMonthKey() },
    { $inc: { orders: 1, revenue: total } },
    { upsert: true },
  );
}

export async function getMonthlyRevenue(
  month: string = currentMonthKey(),
): Promise<number> {
  const doc = await MonthlyStats.findOne({ month }).lean();
  return doc?.revenue ?? 0;
}
