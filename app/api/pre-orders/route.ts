import { NextResponse } from "next/server";
import { createPreOrder } from "@/lib/services/pre-order-service";
import { preOrderSchema } from "@/lib/validations/pre-order";

export const runtime = "nodejs";

/** Public — submit a pre-order enquiry. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = preOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid pre-order data", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const preOrder = await createPreOrder({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      orderType: parsed.data.orderType,
      description: parsed.data.description,
    });
    return NextResponse.json({ preOrder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pre-orders", error);
    return NextResponse.json({ error: "Failed to submit pre-order" }, { status: 500 });
  }
}