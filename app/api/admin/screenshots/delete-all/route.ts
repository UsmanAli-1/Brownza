import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteAllScreenshots } from "@/lib/services/order-service";

export const runtime = "nodejs";

/** Admin only — delete all payment screenshots (Cloudinary + DB refs). */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await deleteAllScreenshots();
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/admin/screenshots/delete-all", error);
    return NextResponse.json(
      { error: "Failed to delete screenshots" },
      { status: 500 },
    );
  }
}
