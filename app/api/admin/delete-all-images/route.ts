import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteAllPaymentScreenshots } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Admin-only — wipes every payment screenshot in Cloudinary, independent of
 * any Order record. For cleaning up orphaned uploads; unrelated to (and
 * doesn't touch) deleting orders themselves.
 */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await deleteAllPaymentScreenshots();
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE all Cloudinary images", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 },
    );
  }
}
