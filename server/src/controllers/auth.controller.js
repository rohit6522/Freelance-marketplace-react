import crypto from "crypto";
import { env } from "../config/env.js";
import { User, FreelancerProfile } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTokenCookie, clearTokenCookie } from "../utils/token.js";
import { sendEmail } from "../services/email.service.js";
import { passwordResetEmail, passwordChangedEmail } from "../services/emailTemplates.js";
import { disconnectUser } from "../realtime/socket.js";

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
  const { email, password, remember } = req.body;

  const user = await User.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password (prevents account enumeration)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been disabled");
  sendTokenCookie(res, user._id, remember !== false && remember !== "false");
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
const RESET_MINUTES = 15;
const RESEND_COOLDOWN_MS = 60 * 1000;

export const forgotPassword = asyncHandler(async (req, res) => {
  const genericMessage = "If an account exists for that email, a reset link has been sent.";
  const user = await User.findOne({ email: req.body.email }).select("+passwordResetExpires");

  if (user && user.isActive) {
    // At most one email per minute per account (prevents mail-bombing someone)
    const issuedAt = user.passwordResetExpires ? user.passwordResetExpires.getTime() - RESET_MINUTES * 60 * 1000 : 0;
    if (Date.now() - issuedAt >= RESEND_COOLDOWN_MS) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = hashToken(rawToken); // only the hash is stored
      user.passwordResetExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const url = `${env.clientUrl}/reset-password/${rawToken}`;
      // Deliberately not awaited: the response time must not reveal whether the account exists
      sendEmail({ to: user.email, ...passwordResetEmail({ name: user.firstName, url, minutes: RESET_MINUTES }) });
    }
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
  disconnectUser(user._id);
  sendEmail({ to: user.email, ...passwordChangedEmail({ name: user.firstName }) });
  sendTokenCookie(res, user._id);
  res.json({ success: true, message: "Password updated", user });
});


// PUT /api/auth/change-password   (logged in)
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new ApiError(400, "Current password is incorrect");
  }
  if (req.body.currentPassword === req.body.newPassword) {
    throw new ApiError(400, "New password must be different from the current one");
  }
  user.password = req.body.newPassword;
  await user.save(); // also invalidates all older tokens via passwordChangedAt
  disconnectUser(user._id);
  sendEmail({ to: user.email, ...passwordChangedEmail({ name: user.firstName }) });
  sendTokenCookie(res, user._id); // keep this device logged in
  res.json({ success: true, message: "Password updated" });
});