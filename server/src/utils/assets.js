import { ApiError } from "./ApiError.js";

// Uploads are stored under gigcraft/<purpose>/<userId>/..., so a publicId proves who uploaded it.
const isOwn = (publicId, userId) => typeof publicId === "string" && publicId.startsWith("gigcraft/") && publicId.includes(`/${userId}/`);

// Reject images that reference someone else's Cloudinary assets (images without publicId, e.g. external URLs, are allowed)
export function assertOwnedImages(images = [], userId) {
  for (const img of images) {
    if (img.publicId && !isOwn(img.publicId, userId)) throw new ApiError(400, "Invalid image reference");
  }
}

// Only ever delete assets that sit in the caller's own folder
export const ownedPublicIds = (images = [], userId) =>
  images.map((i) => i.publicId).filter((id) => isOwn(id, userId));