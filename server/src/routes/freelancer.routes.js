import { Router } from "express";
import { param } from "express-validator";
import { getFreelancer } from "../controllers/freelancer.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.get("/:id", param("id").isMongoId().withMessage("Invalid id"), validate, getFreelancer);
export default router;