import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import gigRoutes from "./routes/gig.routes.js";
import freelancerRoutes from "./routes/freelancer.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.nodeEnv === "development") app.use(morgan("dev"));

// General rate limit (stricter limits will be added on auth routes later)
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "GigCraft API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/portfolio", portfolioRoutes);
// More routes will be mounted here in later steps
// More routes will be mounted here in later steps

app.use(notFound);
app.use(errorHandler);

export default app;