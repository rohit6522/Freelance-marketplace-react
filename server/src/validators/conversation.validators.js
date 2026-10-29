import { body, query } from "express-validator";

export const startConversationRules = [
  body("orderId").optional().isMongoId().withMessage("Invalid order id"),
  body("gigId").optional().isMongoId().withMessage("Invalid gig id"),
  body("freelancerId").optional().isMongoId().withMessage("Invalid freelancer id"),
  body().custom((value) => {
    const given = ["orderId", "gigId", "freelancerId"].filter((k) => value[k]);
    if (given.length !== 1) throw new Error("Provide exactly one of orderId, gigId or freelancerId");
    return true;
  }),
];

export const sendMessageRules = [
  body("text").isString().trim().isLength({ min: 1, max: 3000 }).withMessage("Message must be 1-3000 characters"),
  body("attachments").optional().isArray({ max: 5 }).withMessage("A maximum of 5 attachments"),
  body("attachments.*.url").isURL({ protocols: ["https"], require_protocol: true }).withMessage("Attachment URLs must be valid https URLs"),
];

export const listMessagesRules = [
  query("before").optional().isMongoId().withMessage("Invalid cursor"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
];