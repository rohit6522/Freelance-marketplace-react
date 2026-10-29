import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  startConversation, listConversations, unreadCount, listMessages, postMessage, readConversation,
} from "../controllers/conversation.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import { startConversationRules, sendMessageRules, listMessagesRules } from "../validators/conversation.validators.js";

const router = Router();
router.use(protect);

const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You are sending messages too quickly." },
});

router.get("/unread-count", unreadCount); // before "/:id"
router.get("/", listConversations);
router.post("/", startConversationRules, validate, startConversation);
router.get("/:id/messages", idRule, listMessagesRules, validate, listMessages);
router.post("/:id/messages", sendLimiter, idRule, sendMessageRules, validate, postMessage);
router.post("/:id/read", idRule, validate, readConversation);

export default router;