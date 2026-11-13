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


const NAME_RX = /^[A-Za-z0-9][A-Za-z0-9 &/,'().+-]*$/;

const nameRule = (optional) => {
  const base = body("name");
  const chain = optional ? base.optional() : base;
  return chain
    .isString().withMessage("Name is required")
    .trim()
    .isLength({ min: 2, max: 40 }).withMessage("Name must be 2-40 characters")
    .matches(NAME_RX).withMessage("Use letters, numbers, spaces and & / , ' ( ) . + - only");
};

export const categoryBodyRules = [
  nameRule(false),
  body("description").optional({ values: "falsy" }).isString().trim().isLength({ max: 200 }).withMessage("Description must be 200 characters or fewer"),
];

export const categoryUpdateRules = [
  nameRule(true),
  body("description").optional().isString().withMessage("Invalid description").trim().isLength({ max: 200 }).withMessage("Description must be 200 characters or fewer"),
  body().custom((_, { req }) => {
    const b = req.body || {};
    if (b.name === undefined && b.description === undefined) throw new Error("Nothing to update");
    return true;
  }),
];

export const reorderRules = [
  body("ids").isArray({ min: 1, max: 100 }).withMessage("ids must be a list"),
  body("ids.*").isMongoId().withMessage("Invalid category id"),
];

export const deleteCategoryRules = [
  body("moveTo").optional({ values: "falsy" }).isMongoId().withMessage("Invalid category to move gigs to"),
  optionalReason,
];