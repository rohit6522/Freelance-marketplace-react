import { Router } from "express";
import {
  createOrder, listOrders, getOrder, acceptOrder, deliverOrder,
  requestRevision, completeOrder, cancelOrder,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule } from "../validators/gig.validators.js";
import {
  createOrderRules, listOrdersRules, deliverRules, revisionRules, cancelRules,
} from "../validators/order.validators.js";

const router = Router();
router.use(protect);

router.post("/", authorize("client"), createOrderRules, validate, createOrder);
router.get("/", listOrdersRules, validate, listOrders);
router.get("/:id", idRule, validate, getOrder);

router.post("/:id/accept", authorize("freelancer"), idRule, validate, acceptOrder);
router.post("/:id/deliver", authorize("freelancer"), idRule, deliverRules, validate, deliverOrder);
router.post("/:id/revision", authorize("client"), idRule, revisionRules, validate, requestRevision);
router.post("/:id/complete", authorize("client"), idRule, validate, completeOrder);
router.post("/:id/cancel", idRule, cancelRules, validate, cancelOrder);

export default router;