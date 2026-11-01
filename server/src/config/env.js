import dotenv from "dotenv";
dotenv.config();

["MONGO_URI", "JWT_SECRET"].forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
});

const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters in production");
  if (!process.env.CLIENT_URL) throw new Error("CLIENT_URL must be set in production");
}

const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
if (!["lax", "strict", "none"].includes(sameSite)) {
  throw new Error("COOKIE_SAME_SITE must be lax, strict or none");
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieDays: Number(process.env.JWT_COOKIE_DAYS) || 7,
  cookieSameSite: sameSite,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  apiRateLimit: Number(process.env.API_RATE_LIMIT) || 300,
  serveClient: process.env.SERVE_CLIENT === "true",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};