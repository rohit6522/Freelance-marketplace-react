import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const COOKIE_NAME = "token";

export const signToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: `${env.cookieDays}d` });

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
});

export const sendTokenCookie = (res, userId, remember = true) =>
  res.cookie(COOKIE_NAME, signToken(userId), {
    ...cookieOptions(),
    // no maxAge = session cookie (cleared when the browser closes)
    ...(remember ? { maxAge: env.cookieDays * 24 * 60 * 60 * 1000 } : {}),
  });
export const clearTokenCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());