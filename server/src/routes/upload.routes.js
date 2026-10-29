import { Router } from "express";
import { query } from "express-validator";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadImage, uploadDeliverable } from "../middleware/upload.js";
import { uploadImageFile, uploadDeliverableFile } from "../controllers/upload.controller.js";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads. Please try again later." },
});

// Order matters: authenticate and rate-limit BEFORE the file is buffered
router.post(
  "/image",
  protect, uploadLimiter,
  query("purpose").isIn(["gig", "portfolio"]).withMessage("purpose must be gig or portfolio"),
  validate, uploadImage, uploadImageFile
);
router.post("/file", protect, uploadLimiter, uploadDeliverable, uploadDeliverableFile);

export default router;