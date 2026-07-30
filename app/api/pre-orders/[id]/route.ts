import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deletePreOrder, getPreOrderById } from "@/lib/services/pre-order-service";

export const runtime = "nodejs";

/** Admin only — single pre-order detail. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const preOrder = await getPreOrderById(id);
  if (!preOrder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ preOrder });
}

/** Admin only — delete a pre-order submission. */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deletePreOrder(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}