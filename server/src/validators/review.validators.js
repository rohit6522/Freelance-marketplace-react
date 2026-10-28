import { body, query } from "express-validator";

export const createReviewRules = [
  body("orderId").isMongoId().withMessage("A valid order is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be a whole number from 1 to 5"),
  body("comment").isString().trim().isLength({ min: 10, max: 1500 }).withMessage("Feedback must be 10-1500 characters"),
];

export const listReviewsRules = [
  query("gig").optional().isMongoId().withMessage("Invalid gig id"),
  query("freelancer").optional().isMongoId().withMessage("Invalid freelancer id"),
  query("gig").custom((value, { req }) => {
    if (!req.query.gig && !req.query.freelancer) throw new Error("Provide a gig or freelancer id");
    return true;
  }),
  query("sort").optional().isIn(["recent", "highest", "lowest"]).withMessage("Invalid sort"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

export const replyRules = [
  body("text").isString().trim().isLength({ min: 2, max: 1000 }).withMessage("Reply must be 2-1000 characters"),
];

export const reportRules = [
  body("reason").isString().trim().isLength({ min: 5, max: 300 }).withMessage("Report reason must be 5-300 characters"),
];