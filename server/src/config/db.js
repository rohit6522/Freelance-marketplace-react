import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  // Fail fast with a readable reason instead of hanging for 30 seconds
  const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};