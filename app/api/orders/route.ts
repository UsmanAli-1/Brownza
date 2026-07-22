import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations/order";
import {
  createOrder,
  deleteAllOrders,
  listOrders,
} from "@/lib/services/order-service";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import type { CreateOrderInput } from "@/types/order";

export const runtime = "nodejs";

/** Public — place an order. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const order = await createOrder(parsed.data as CreateOrderInput);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

/** Admin only — list orders (optional status + search filters). */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;
    const search = searchParams.get("search") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 20),
    );
    const result = await listOrders({ status, search, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/orders", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }
}

/** Admin only — delete ALL orders (and their Cloudinary screenshots). */
export async function DELETE() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await deleteAllOrders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/orders", error);
    return NextResponse.json(
      { error: "Failed to delete orders" },
      { status: 500 },
    );
  }
}
