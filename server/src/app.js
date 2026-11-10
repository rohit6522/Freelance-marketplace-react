import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { sanitizeBody } from "./middleware/sanitize.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import gigRoutes from "./routes/gig.routes.js";
import freelancerRoutes from "./routes/freelancer.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import compression from "compression";
import publicRoutes from "./routes/public.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Behind a proxy (Render, Heroku, nginx) set TRUST_PROXY=1 so rate limits and secure cookies see the real client
if (env.trustProxy) app.set("trust proxy", env.trustProxy);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://placehold.co"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "upgrade-insecure-requests": env.nodeEnv === "production" ? [] : null,
        "connect-src": ["'self'", env.clientWsUrl],
      },
    },
  })
);
app.use(compression()); // gzip responses (the JS bundle shrinks to roughly a third)


app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeBody);
app.use(cookieParser());
if (env.nodeEnv === "development") app.use(morgan("dev"));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: env.apiRateLimit, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "GigCraft API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// Optional single-service deployment: Express also serves the built React app (same origin = simple cookies)
if (env.serveClient) {
  const dist = path.resolve(__dirname, "../../client/dist");
  // Vite puts a content hash in every file name under /assets, so these can be cached for a year.
  // fallthrough:false makes a missing file a real 404 (never the index.html page, which would break script loading).
  app.use("/assets", express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true, fallthrough: false }));
  app.use(express.static(dist)); // index.html and other files are revalidated on every load
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "/api",
//   withCredentials: true, // httpOnly auth cookie
// });

app.use(notFound);
app.use(errorHandler);

export default app;