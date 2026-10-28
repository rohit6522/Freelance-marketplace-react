import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME } from "../utils/token.js";

// Requires a valid login
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  const header = req.headers.authorization;
  if (!token && header?.startsWith("Bearer ")) token = header.split(" ")[1];

  if (!token) throw new ApiError(401, "Not authenticated. Please log in.");

  const decoded = jwt.verify(token, env.jwtSecret); // throws -> errorHandler returns 401

  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user || !user.isActive) throw new ApiError(401, "Account not found or disabled.");

  if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new ApiError(401, "Password was changed. Please log in again.");
  }

  req.user = user;
  next();
});

// Role-based access: authorize("freelancer"), authorize("client", "freelancer")
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }
    next();
  };


  // Attaches req.user if a valid token exists, but never blocks the request
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id);
      if (user?.isActive) req.user = user;
    } catch {
      /* ignore invalid token for public routes */
    }
  }
  next();
});