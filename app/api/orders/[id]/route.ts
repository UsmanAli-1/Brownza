import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { updateOrderSchema } from "@/lib/validations/order";
import {
  getOrderById,
  InvalidTransitionError,
  updateOrderStatus,
  verifyOrderPayment,
} from "@/lib/services/order-service";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

/** Admin only — fetch a single order. */
export async function GET(_req: Request, ctx: Context) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

/** Admin only — update status and/or verify payment. */
export async function PATCH(req: Request, ctx: Context) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  try {
    let order = null;
    if (parsed.data.verifyPayment) {
      order = await verifyOrderPayment(id);
    }
    if (parsed.data.status) {
      order = await updateOrderStatus(
        id,
        parsed.data.status,
        parsed.data.cancellationReason,
      );
    }
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or nothing to update" },
        { status: 404 },
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("PATCH /api/orders/[id]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
