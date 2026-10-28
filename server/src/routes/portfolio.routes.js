import { Router } from "express";
import { myPortfolio, createProject, updateProject, deleteProject } from "../controllers/profile.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import { portfolioRules } from "../validators/profile.validators.js";

const router = Router();
router.use(protect, authorize("freelancer"));

router.get("/mine", myPortfolio);
router.post("/", portfolioRules, validate, createProject);
router.put("/:id", idRule, portfolioRules, validate, updateProject);
router.delete("/:id", idRule, validate, deleteProject);

export default router;