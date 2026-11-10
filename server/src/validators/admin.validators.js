import { body, query } from "express-validator";

const paging = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50"),
];

const optionalReason = body("reason").optional({ values: "falsy" }).isString().trim().isLength({ max: 500 }).withMessage("Reason is too long");

// A reason of 5+ characters is mandatory for the "negative" action (hide / suspend)
const reasonRequiredWhen = (field, value, message) =>
  body("reason").custom((v, { req }) => {
    if (req.body[field] === value && (!v || String(v).trim().length < 5)) throw new Error(message);
    return true;
  });

export const pageRules = paging;

export const listReviewsRules = [
  query("filter").optional().isIn(["reported", "hidden", "all"]).withMessage("Invalid filter"),
  ...paging,
];

export const visibilityRules = [
  body("hidden").isBoolean().withMessage("hidden must be true or false").toBoolean(),
  optionalReason,
  reasonRequiredWhen("hidden", true, "A reason (at least 5 characters) is required to hide a review"),
];

export const dismissRules = [optionalReason];

export const listUsersRules = [
  query("role").optional({ values: "falsy" }).isIn(["client", "freelancer", "admin"]).withMessage("Invalid role"),
  query("status").optional({ values: "falsy" }).isIn(["suspended"]).withMessage("Invalid status"),
  query("q").optional({ values: "falsy" }).isString().isLength({ max: 100 }).withMessage("Search is too long"),
  ...paging,
];

export const userStatusRules = [
  body("isActive").isBoolean().withMessage("isActive must be true or false").toBoolean(),
  optionalReason,
  reasonRequiredWhen("isActive", false, "A reason (at least 5 characters) is required to suspend a user"),
];