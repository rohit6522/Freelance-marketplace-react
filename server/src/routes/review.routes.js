import { Router } from "express";
import {
  createReview, listReviews, replyToReview, reportReview, myReviews, updateReview,
} from "../controllers/review.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import {
  createReviewRules, listReviewsRules, replyRules, reportRules, updateReviewRules,
} from "../validators/review.validators.js";

const router = Router();

router.get("/", listReviewsRules, validate, listReviews); // public
router.get("/mine", protect, authorize("client"), myReviews);
router.post("/", protect, authorize("client"), createReviewRules, validate, createReview);
router.patch("/:id", protect, authorize("client"), idRule, updateReviewRules, validate, updateReview);
router.post("/:id/reply", protect, authorize("freelancer"), idRule, replyRules, validate, replyToReview);
router.post("/:id/report", protect, idRule, reportRules, validate, reportReview);

export default router;