import { Router } from "express";
import {
  getStats, listReviews, setReviewVisibility, dismissReports, listUsers, setUserStatus, listLog,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import {
  pageRules, listReviewsRules, visibilityRules, dismissRules, listUsersRules, userStatusRules,
} from "../validators/admin.validators.js";

const router = Router();
router.use(protect, authorize("admin")); // every admin route: valid login + admin role

router.get("/stats", getStats);
router.get("/reviews", listReviewsRules, validate, listReviews);
router.patch("/reviews/:id/visibility", idRule, visibilityRules, validate, setReviewVisibility);
router.post("/reviews/:id/dismiss-reports", idRule, dismissRules, validate, dismissReports);
router.get("/users", listUsersRules, validate, listUsers);
router.patch("/users/:id/status", idRule, userStatusRules, validate, setUserStatus);
router.get("/log", pageRules, validate, listLog);

export default router;