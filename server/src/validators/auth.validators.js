import { body, param } from "express-validator";

const email = body("email")
  .isString().withMessage("Email is required")
  .trim().toLowerCase()
  .isEmail().withMessage("Please provide a valid email");

const strongPassword = (field) =>
  body(field)
    .isString().withMessage("Password is required")
    .isLength({ min: 8, max: 72 }).withMessage("Password must be 8-72 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain a letter")
    .matches(/\d/).withMessage("Password must contain a number");

export const registerRules = [
  body("firstName").isString().trim().isLength({ min: 1, max: 50 }).withMessage("First name is required"),
  body("lastName").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Last name is required"),
  email,
  strongPassword("password"),
  body("role").isIn(["client", "freelancer"]).withMessage("Role must be client or freelancer"),
  body("domainFocus").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }),
  body("marketingOptIn").optional().isBoolean().withMessage("Invalid value"),
  body("acceptTerms").equals("true").withMessage("You must accept the Terms of Service"),
];

export const loginRules = [
  email,
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("remember").optional().isBoolean().withMessage("Invalid value"),
];

export const forgotPasswordRules = [email];

export const resetPasswordRules = [
  param("token").isHexadecimal().isLength({ min: 64, max: 64 }).withMessage("Invalid reset token"),
  strongPassword("password"),
];


export const changePasswordRules = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
  strongPassword("newPassword"),
];