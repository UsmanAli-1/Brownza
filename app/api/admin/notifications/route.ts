import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Order } from "@/lib/models/order";
import { PreOrder } from "@/lib/models/pre-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NewOrderNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
}

interface NewPreOrderNotification {
  id: string;
  fullName: string;
}

/**
 * Polled by the admin dashboard instead of the old SSE stream — Vercel's
 * serverless functions can't hold a long-lived in-memory EventEmitter
 * connection open across instances, so the previous "instant" push silently
 * missed events whenever the create and the listener landed on different
 * instances. Polling trades instant delivery for a bounded (~poll-interval)
 * delay that always eventually shows the truth from Mongo.
 */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new URL(req.url).searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  const createdAt =
    sinceDate && !Number.isNaN(sinceDate.getTime())
      ? { $gt: sinceDate }
      : { $gt: new Date(Date.now() - 15_000) };

  await connectToDatabase();
  const [orders, preOrders] = await Promise.all([
    Order.find({ createdAt })
      .select("orderNumber customer.name total")
      .sort({ createdAt: 1 })
      .limit(50)
      .lean(),
    PreOrder.find({ createdAt })
      .select("fullName")
      .sort({ createdAt: 1 })
      .limit(50)
      .lean(),
  ]);

  const newOrders: NewOrderNotification[] = orders.map((o) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    total: o.total,
  }));
  const newPreOrders: NewPreOrderNotification[] = preOrders.map((p) => ({
    id: p._id.toString(),
    fullName: p.fullName,
  }));

  return NextResponse.json({
    newOrders,
    newPreOrders,
    serverTime: new Date().toISOString(),
  });
}
