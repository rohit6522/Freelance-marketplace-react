import { Router } from "express";
import {
  getStats, listReviews, setReviewVisibility, dismissReports, listUsers, setUserStatus, listLog,
  listCategoriesAdmin, createCategory, updateCategory, reorderCategories, deleteCategory,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import {
  pageRules, listReviewsRules, visibilityRules, dismissRules, listUsersRules, userStatusRules,
  categoryBodyRules, categoryUpdateRules, reorderRules, deleteCategoryRules,
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

router.get("/categories", listCategoriesAdmin);
router.post("/categories", categoryBodyRules, validate, createCategory);
router.put("/categories/order", reorderRules, validate, reorderCategories);
router.patch("/categories/:id", idRule, categoryUpdateRules, validate, updateCategory);
router.delete("/categories/:id", idRule, deleteCategoryRules, validate, deleteCategory);

export default router;