import { Router } from "express";
import { uploadImage } from "../middleware/upload.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

import {
  getMyProfile, updateAccount, updateFreelancerProfile, updateAvatar, deleteAccount,
} from "../controllers/profile.controller.js";
import { accountRules, freelancerProfileRules, deleteAccountRules } from "../validators/profile.validators.js";

const router = Router();
router.use(protect);
const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.authRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

router.delete("/account", deleteLimiter, deleteAccountRules, validate, deleteAccount);
router.get("/me", getMyProfile);
router.put("/account", accountRules, validate, updateAccount);
router.put("/freelancer", authorize("freelancer"), freelancerProfileRules, validate, updateFreelancerProfile);
router.post("/avatar", uploadImage, updateAvatar); // add under the other routes

export default router;