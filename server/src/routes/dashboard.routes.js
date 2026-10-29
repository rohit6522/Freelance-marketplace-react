import { Router } from "express";
import { clientDashboard, freelancerDashboard } from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/client", authorize("client"), clientDashboard);
router.get("/freelancer", authorize("freelancer"), freelancerDashboard);

export default router;