import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

export async function uploadBuffer(buffer, { folder, resourceType = "image", transformation } = {}) {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, "File uploads are not configured on this server");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `gigcraft/${folder}`,
        resource_type: resourceType,
        unique_filename: true,
        use_filename: false,
        ...(transformation ? { transformation } : {}),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId, resourceType = "image") {
  if (!publicId || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message); // never block the request
  }
}