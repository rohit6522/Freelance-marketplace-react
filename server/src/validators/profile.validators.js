import { body } from "express-validator";

export const accountRules = [
  body("firstName").optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage("First name must be 1-50 characters"),
  body("lastName").optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage("Last name must be 1-50 characters"),
  body("companyName").optional().isString().trim().isLength({ max: 100 }).withMessage("Company name is too long"),
  body("domainFocus").optional().isString().trim().isLength({ max: 100 }).withMessage("Domain focus is too long"),
];

export const freelancerProfileRules = [
  body("title").optional().isString().trim().isLength({ max: 100 }).withMessage("Title is too long"),
  body("bio").optional().isString().trim().isLength({ max: 2000 }).withMessage("Bio must be at most 2000 characters"),
  body("location").optional().isString().trim().isLength({ max: 100 }).withMessage("Location is too long"),
  body("skills").optional().isArray({ max: 30 }).withMessage("A maximum of 30 skills is allowed"),
  body("skills.*").isString().trim().isLength({ min: 1, max: 40 }).withMessage("Skills must be 1-40 characters"),
  body("languages").optional().isArray({ max: 10 }).withMessage("A maximum of 10 languages is allowed"),
  body("languages.*.name").isString().trim().notEmpty().withMessage("Language name is required"),
  body("languages.*.level").isIn(["basic", "conversational", "fluent", "native"]).withMessage("Invalid language level"),
  body("experienceYears").optional().isInt({ min: 0, max: 60 }).withMessage("Experience must be 0-60 years"),
  body("hourlyRate").optional().isFloat({ min: 0, max: 10000 }).withMessage("Invalid hourly rate"),
  body("workHistory").optional().isArray({ max: 20 }).withMessage("A maximum of 20 work history entries"),
  body("workHistory.*.title").isString().trim().notEmpty().withMessage("Work title is required"),
  body("workHistory.*.company").isString().trim().notEmpty().withMessage("Company is required"),
  body("workHistory.*.startYear").isInt({ min: 1970, max: 2100 }).withMessage("Invalid start year"),
  body("workHistory.*.endYear").optional({ values: "null" }).isInt({ min: 1970, max: 2100 }).withMessage("Invalid end year"),
];

export const portfolioRules = [
  body("title").isString().trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
  body("description").isString().trim().isLength({ min: 10, max: 2000 }).withMessage("Description must be 10-2000 characters"),
  body("industry").optional().isString().trim().isLength({ max: 60 }),
  body("metric").optional().isString().trim().isLength({ max: 100 }),
  body("durationWeeks").optional().isInt({ min: 1, max: 520 }).withMessage("Invalid duration"),
  body("deliverables").optional().isArray({ max: 10 }).withMessage("A maximum of 10 deliverables"),
  body("deliverables.*").isString().trim().isLength({ min: 1, max: 80 }),
  body("images").optional().isArray({ max: 6 }).withMessage("A maximum of 6 images"),
  body("images.*.url").isURL({ protocols: ["https"], require_protocol: true }).withMessage("Image URLs must be valid https URLs"),
  body("externalLink").optional({ values: "falsy" }).isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("External link must be a valid URL"),
];