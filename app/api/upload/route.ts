import { NextResponse } from "next/server";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Upload a payment screenshot to Cloudinary. Returns { url, publicId }. */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 8 MB)" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadPaymentScreenshot(buffer);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
