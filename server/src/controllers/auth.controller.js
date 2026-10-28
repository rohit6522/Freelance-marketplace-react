import crypto from "crypto";
import { env } from "../config/env.js";
import { User, FreelancerProfile } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTokenCookie, clearTokenCookie } from "../utils/token.js";

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, domainFocus, marketingOptIn } = req.body;

  if (await User.findOne({ email })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    firstName, lastName, email, password, role, domainFocus,
    marketingOptIn: marketingOptIn === true || marketingOptIn === "true",
  });

  if (role === "freelancer") {
    await FreelancerProfile.create({ user: user._id, title: domainFocus || "" });
  }

  sendTokenCookie(res, user._id);
  res.status(201).json({ success: true, user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password (prevents account enumeration)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been disabled");

  sendTokenCookie(res, user._id);
  res.json({ success: true, user });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out" });
};

// GET /api/auth/me   (used to restore the session on page refresh)
export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const genericMessage = "If an account exists for that email, a reset link has been sent.";
  const user = await User.findOne({ email: req.body.email });

  if (user && user.isActive) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(rawToken); // only the hash is stored
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;
    // No email service in this college project: the link is printed in the server console.
    // Later you can swap this for Nodemailer/Resend without changing the API.
    console.log(`\n[DEV] Password reset link for ${user.email}:\n${resetUrl}\n`);
  }

  res.json({ success: true, message: genericMessage });
});

// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(req.params.token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenCookie(res, user._id);
  res.json({ success: true, message: "Password updated", user });
});