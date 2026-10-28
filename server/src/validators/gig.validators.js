import { body, param, query } from "express-validator";

export const idRule = [param("id").isMongoId().withMessage("Invalid id")];

const tiers = ["basic", "standard", "premium"];

const packageRules = (tier) => {
  const label = tier[0].toUpperCase() + tier.slice(1);
  const p = `packages.${tier}`;
  return [
    body(`${p}.title`).isString().trim().isLength({ min: 2, max: 80 })
      .withMessage(`${label} package title is required (2-80 characters)`),
    body(`${p}.description`).isString().trim().isLength({ min: 5, max: 500 })
      .withMessage(`${label} package description is required (5-500 characters)`),
    body(`${p}.price`).isFloat({ min: 5, max: 100000 })
      .withMessage(`${label} package price must be between $5 and $100,000`),
    body(`${p}.deliveryDays`).isInt({ min: 1, max: 180 })
      .withMessage(`${label} package delivery must be 1-180 days`),
    body(`${p}.revisions`).isInt({ min: -1, max: 100 })
      .withMessage(`${label} package revisions must be -1 (unlimited) to 100`),
    body(`${p}.features`).optional().isArray({ max: 10 })
      .withMessage(`${label} package can have at most 10 features`),
    body(`${p}.features.*`).isString().trim().isLength({ min: 1, max: 120 })
      .withMessage(`${label} package features must be 1-120 characters`),
  ];
};

export const gigBodyRules = [
  body("title").isString().trim().isLength({ min: 15, max: 120 })
    .withMessage("Title must be 15-120 characters"),
  body("description").isString().trim().isLength({ min: 50, max: 5000 })
    .withMessage("Description must be 50-5000 characters"),
  body("category").isMongoId().withMessage("A valid category is required"),
  body("tags").optional().isArray({ max: 5 }).withMessage("A maximum of 5 tags is allowed"),
  body("tags.*").isString().trim().isLength({ min: 1, max: 30 }).withMessage("Tags must be 1-30 characters"),
  body("images").optional().isArray({ max: 5 }).withMessage("A maximum of 5 images is allowed"),
  body("images.*.url").isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Image URLs must be valid https URLs"),
  body("status").optional().isIn(["draft", "published"]).withMessage("Status must be draft or published"),
  ...tiers.flatMap(packageRules),
];

export const statusRule = [
  body("status").isIn(["draft", "published", "paused"]).withMessage("Status must be draft, published or paused"),
];

export const listGigsRules = [
  query("q").optional().isString().isLength({ max: 100 }).withMessage("Search is too long"),
  query("category").optional().isString().isLength({ max: 60 }),
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("Invalid minPrice"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Invalid maxPrice"),
  query("maxDelivery").optional().isInt({ min: 1 }).withMessage("Invalid maxDelivery"),
  query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("Invalid minRating"),
  query("minExperience").optional().isInt({ min: 0 }).withMessage("Invalid minExperience"),
  query("levels").optional().isString().isLength({ max: 100 }),
  query("tags").optional().isString().isLength({ max: 200 }),
  query("sort").optional().isIn(["relevance", "newest", "price_asc", "price_desc", "rating"])
    .withMessage("Invalid sort"),
];