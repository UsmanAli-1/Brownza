import { NextResponse } from "next/server";
import { getOrderTrackById } from "@/lib/services/order-service";

export const runtime = "nodejs";

/** Public — customer-safe order tracking view fetched by Mongo id. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const order = await getOrderTrackById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
