import mongoose from "mongoose";
import { Review, Order } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";

// POST /api/reviews  (client, completed orders only, one per order)
export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order || String(order.client) !== String(req.user._id)) throw new ApiError(404, "Order not found");
  if (order.status !== "completed") throw new ApiError(409, "You can only review completed orders");
  if (await Review.exists({ order: order._id })) throw new ApiError(409, "You have already reviewed this order");

  const review = await Review.create({
    order: order._id,
    gig: order.gig,
    client: req.user._id,
    freelancer: order.freelancer,
    rating,
    comment,
  });

  // Averages are always recalculated from stored reviews
  await Promise.all([recalcGigStats(order.gig), recalcFreelancerStats(order.freelancer)]);

  res.status(201).json({ success: true, review });
});

// GET /api/reviews?gig=<id>  or  ?freelancer=<userId>   (public)
export const listReviews = asyncHandler(async (req, res) => {
  const { gig, freelancer } = req.query;
  const filter = { isHidden: false };
  const aggMatch = { isHidden: false };
  if (gig) {
    filter.gig = gig;
    aggMatch.gig = new mongoose.Types.ObjectId(gig);
  }
  if (freelancer) {
    filter.freelancer = freelancer;
    aggMatch.freelancer = new mongoose.Types.ObjectId(freelancer);
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const sort = {
    recent: { createdAt: -1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
  }[req.query.sort || "recent"];

  const [reviews, total, dist] = await Promise.all([
    Review.find(filter)
      .select("-reports")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("client", "firstName lastName avatar")
      .populate("gig", "title")
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([{ $match: aggMatch }, { $group: { _id: "$rating", n: { $sum: 1 } } }]),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;
  dist.forEach((d) => {
    distribution[d._id] = d.n;
    sum += d._id * d.n;
    count += d.n;
  });

  res.json({
    success: true,
    summary: { average: count ? Math.round((sum / count) * 10) / 10 : 0, count, distribution },
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// POST /api/reviews/:id/reply  (the reviewed freelancer)
export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (String(review.freelancer) !== String(req.user._id)) {
    throw new ApiError(403, "You can only reply to reviews on your own work");
  }
  review.reply = { text: req.body.text, at: new Date() };
  await review.save();
  res.json({ success: true, review });
});

// POST /api/reviews/:id/report  (any logged-in user, stored for moderation)
export const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (String(review.client) === String(req.user._id)) throw new ApiError(400, "You cannot report your own review");
  if (review.reports.some((r) => String(r.user) === String(req.user._id))) {
    throw new ApiError(409, "You have already reported this review");
  }
  review.reports.push({ user: req.user._id, reason: req.body.reason });
  await review.save();
  res.json({ success: true, message: "Report submitted. Thank you." });
});

// GET /api/reviews/mine   (client) -> reviews I wrote + completed orders still waiting for a review
export const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ client: req.user._id })
    .select("-reports")
    .sort({ createdAt: -1 })
    .populate("gig", "title images")
    .populate("freelancer", "firstName lastName avatar")
    .lean();

  const pending = await Order.find({
    client: req.user._id,
    status: "completed",
    _id: { $nin: reviews.map((r) => r.order) },
  })
    .select("orderNumber price completedAt gig freelancer")
    .sort({ completedAt: -1 })
    .populate("gig", "title images")
    .populate("freelancer", "firstName lastName avatar")
    .lean();

  res.json({ success: true, reviews, pending });
});