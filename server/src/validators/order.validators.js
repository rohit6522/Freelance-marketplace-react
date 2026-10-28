import { body, query } from "express-validator";

export const createOrderRules = [
  body("gigId").isMongoId().withMessage("A valid gig is required"),
  body("tier").isIn(["basic", "standard", "premium"]).withMessage("Package must be basic, standard or premium"),
  body("requirements").isString().trim().isLength({ min: 20, max: 5000 })
    .withMessage("Project requirements must be 20-5000 characters"),
  // Note: price / payment status are deliberately NOT read from the request.
];

export const listOrdersRules = [
  query("status").optional().isString().isLength({ max: 120 }),
  query("q").optional().isString().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50"),
];

export const deliverRules = [
  body("message").isString().trim().isLength({ min: 5, max: 2000 }).withMessage("Delivery message must be 5-2000 characters"),
  body("files").optional().isArray({ max: 10 }).withMessage("A maximum of 10 files per delivery"),
  body("files.*.url").isURL({ protocols: ["https"], require_protocol: true }).withMessage("File URLs must be valid https URLs"),
  body("files.*.name").optional().isString().trim().isLength({ max: 200 }),
  body("files.*.size").optional().isInt({ min: 0 }),
];

export const revisionRules = [
  body("message").isString().trim().isLength({ min: 5, max: 1000 }).withMessage("Revision notes must be 5-1000 characters"),
];

export const cancelRules = [
  body("reason").isString().trim().isLength({ min: 5, max: 500 }).withMessage("A cancellation reason (5-500 characters) is required"),
];