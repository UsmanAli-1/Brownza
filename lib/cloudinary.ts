import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/** Upload a payment screenshot buffer to Cloudinary (payments folder). */
export async function uploadPaymentScreenshot(
  buffer: Buffer,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "brownza/payments", resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Deletes every payment screenshot in Cloudinary's brownza/payments folder,
 * independent of what's tracked in Mongo — catches orphaned uploads (e.g.
 * from an order that failed to save after the screenshot was already
 * uploaded) that per-order deletion can never reach since there's no Order
 * document to look the public id up from.
 */
export async function deleteAllPaymentScreenshots(): Promise<{
  deleted: number;
}> {
  const result = await cloudinary.api.delete_resources_by_prefix(
    "brownza/payments",
  );
  const outcomes = (result.deleted ?? {}) as Record<string, string>;
  return {
    deleted: Object.values(outcomes).filter((v) => v === "deleted").length,
  };
}

export { cloudinary };
