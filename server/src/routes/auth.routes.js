import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register, login, logout, getMe, forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerRules, loginRules, forgotPasswordRules, resetPasswordRules,
} from "../validators/auth.validators.js";

const router = Router();

// Strict limit on sensitive endpoints: 20 attempts / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordRules, validate, resetPassword);

export default router;