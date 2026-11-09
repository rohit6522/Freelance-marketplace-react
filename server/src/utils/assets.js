import { ApiError } from "./ApiError.js";

// Uploads are stored as gigcraft/<gigs|portfolio>/<userId>/<random-name>, so the path proves who uploaded them.
// Exact pattern: no extra path segments, no "." or ".." names, no other folders.
const isOwn = (publicId, userId) => {
  const uid = String(userId);
  if (typeof publicId !== "string" || !/^[a-f0-9]{24}$/i.test(uid)) return false;
  return new RegExp(`^gigcraft/(?:gigs|portfolio)/${uid}/(?!\\.)[\\w.-]+$`).test(publicId);
};

// Reject images that reference someone else's Cloudinary assets (external URLs without a publicId are allowed)
export function assertOwnedImages(images = [], userId) {
  for (const img of images) {
    if (img.publicId && !isOwn(img.publicId, userId)) throw new ApiError(400, "Invalid image reference");
  }
}

// Only ever delete assets that sit in the caller's own folder
export const ownedPublicIds = (images = [], userId) =>
  images.map((i) => i.publicId).filter((id) => isOwn(id, userId));