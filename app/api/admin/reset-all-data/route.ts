import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order } from "@/lib/models/order";
import { Activity } from "@/lib/models/activity";
import { PreOrder } from "@/lib/models/pre-order";
import { StatsLedger } from "@/lib/models/stats-ledger";
import { MonthlyStats } from "@/lib/models/monthly-stats";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Full, irreversible data wipe: every order, every pre-order/form
 * submission, every Cloudinary payment screenshot, and both revenue
 * ledgers reset to zero. Requires the admin password as an extra
 * confirmation layer beyond the session cookie, since this is destructive
 * and cannot be undone.
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  await connectToDatabase();

  // Clean up Cloudinary screenshots before wiping the orders that reference them.
  const withScreenshots = await Order.find(
    { "payment.screenshotPublicId": { $exists: true, $ne: null } },
    { "payment.screenshotPublicId": 1 },
  ).lean<{ payment: { screenshotPublicId?: string } }[]>();
  const publicIds = withScreenshots
    .map((d) => d.payment.screenshotPublicId)
    .filter((x): x is string => !!x);

  if (publicIds.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < publicIds.length; i += BATCH) {
      try {
        await cloudinary.api.delete_resources(publicIds.slice(i, i + BATCH));
      } catch (error) {
        console.error("Cloudinary cleanup failed during full reset", error);
      }
    }
  }

  await Promise.all([
    Order.deleteMany({}),
    Activity.deleteMany({}),
    PreOrder.deleteMany({}),
    MonthlyStats.deleteMany({}),
    StatsLedger.updateOne(
      { singleton: "global" },
      {
        $set: {
          ordersCreated: 0,
          revenueCreated: 0,
          deliveredOrders: 0,
          deliveredRevenue: 0,
        },
      },
      { upsert: true },
    ),
  ]);

  return NextResponse.json({ ok: true });
}