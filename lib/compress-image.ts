/**
 * Client-side downscale + re-encode before uploading a payment screenshot.
 * A phone-camera screenshot can be several MB; the upload round-trip to
 * Cloudinary is the single biggest contributor to "placing an order feels
 * slow" (measured ~1.3s for a 1x1px test file — real screenshots are much
 * bigger and slower). Shrinking to a reasonable max dimension and
 * re-encoding as JPEG cuts the payload (and therefore upload time)
 * dramatically with no visible quality loss for a payment-proof screenshot.
 *
 * Falls back to the original file untouched if compression fails or the
 * browser lacks the needed APIs (createImageBitmap) — never blocks checkout.
 */
export async function compressImageForUpload(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  if (typeof createImageBitmap === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], "screenshot.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
