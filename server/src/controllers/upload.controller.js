import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadBuffer } from "../services/upload.service.js";

const IMAGE_PURPOSES = {
  gig: { folder: "gigs", transformation: [{ width: 1600, height: 1000, crop: "limit" }] },
  portfolio: { folder: "portfolio", transformation: [{ width: 1600, height: 1000, crop: "limit" }] },
};

// POST /api/uploads/image?purpose=gig|portfolio   (multipart field: image)
export const uploadImageFile = asyncHandler(async (req, res) => {
  const cfg = IMAGE_PURPOSES[req.query.purpose];
  const result = await uploadBuffer(req.file.buffer, { folder: cfg.folder, transformation: cfg.transformation });
  res.status(201).json({ success: true, image: { url: result.secure_url, publicId: result.public_id } });
});

// POST /api/uploads/file   (multipart field: file) - deliveries and order attachments
export const uploadDeliverableFile = asyncHandler(async (req, res) => {
  const isImage = req.file.mimetype.startsWith("image/");
  const result = await uploadBuffer(req.file.buffer, {
    folder: "files",
    resourceType: isImage ? "image" : "raw",
  });
  res.status(201).json({
    success: true,
    file: {
      url: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname.slice(0, 200),
      size: req.file.size,
    },
  });
});