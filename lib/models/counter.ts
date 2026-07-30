import mongoose, { Schema, type Model } from "mongoose";

/**
 * Atomic sequence counters, keyed by name (e.g. "orderNumber"). Replaces
 * `Order.countDocuments()` for numbering — a live count is both slow (full
 * collection count on every order) and racy (two concurrent checkouts can
 * read the same count and mint the same order number, only one of which
 * survives the unique-index write). `$inc` via `findOneAndUpdate` is a
 * single atomic operation, so concurrent callers always get distinct values.
 */
export interface CounterDoc {
  name: string;
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<CounterDoc> =
  (mongoose.models.Counter as Model<CounterDoc>) ||
  mongoose.model<CounterDoc>("Counter", CounterSchema);

/** Atomically increments and returns the next value for `name`, starting at 1. */
export async function nextSequence(name: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  ).lean();
  return (doc as unknown as CounterDoc).seq;
}
