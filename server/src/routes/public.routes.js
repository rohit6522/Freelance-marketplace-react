import { Router } from "express";
import { publicStats } from "../controllers/public.controller.js";

const router = Router();
router.get("/stats", publicStats);
export default router;