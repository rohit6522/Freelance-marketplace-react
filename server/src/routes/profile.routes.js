import { Router } from "express";
import { getMyProfile, updateAccount, updateFreelancerProfile, updateAvatar } from "../controllers/profile.controller.js";
import { uploadImage } from "../middleware/upload.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { accountRules, freelancerProfileRules } from "../validators/profile.validators.js";

const router = Router();
router.use(protect);

router.get("/me", getMyProfile);
router.put("/account", accountRules, validate, updateAccount);
router.put("/freelancer", authorize("freelancer"), freelancerProfileRules, validate, updateFreelancerProfile);
router.post("/avatar", uploadImage, updateAvatar); // add under the other routes

export default router;