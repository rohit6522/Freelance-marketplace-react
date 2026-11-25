import mongoose from "mongoose";
import { Review, Order, Gig, FreelancerProfile } from "../models/index.js";

const round1 = (n) => Math.round(n * 10) / 10;

// Several reviews or approvals can finish at the same moment, and each triggers a recalculation.
// A slow run that started EARLIER must never overwrite the result of one that started LATER.
// So each run records when it started (before reading anything) and only writes if no newer run has already written.
const notOlderThan = (startedAt) => ({
  $or: [{ statsComputedAt: null }, { statsComputedAt: { $lte: startedAt } }],
});

export async function recalcGigStats(gigId) {
  const startedAt = new Date();
  const id = new mongoose.Types.ObjectId(gigId);
  const [agg] = await Review.aggregate([
    { $match: { gig: id, isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const completed = await Order.countDocuments({ gig: id, status: "completed" });
  await Gig.updateOne(
    { _id: id, ...notOlderThan(startedAt) },
    {
      ratingAverage: agg ? round1(agg.avg) : 0,
      ratingCount: agg ? agg.count : 0,
      completedOrders: completed,
      statsComputedAt: startedAt,
    }
  );
}

export function calculateSellerLevel({ completedOrders = 0, ratingAverage = 0, ratingCount = 0 } = {}) {
  // Top Rated: 20+ completed orders, 4.8+ rating, at least 5 reviews
  if (completedOrders >= 20 && ratingAverage >= 4.8 && ratingCount >= 5) {
    return "top_rated";
  }
  // Pro Verified: 10+ completed orders, 4.5+ rating, at least 3 reviews
  if (completedOrders >= 10 && ratingAverage >= 4.5 && ratingCount >= 3) {
    return "pro";
  }
  // Level 2 Seller: 5+ completed orders, 4.0+ rating, at least 1 review
  if (completedOrders >= 5 && ratingAverage >= 4.0 && ratingCount >= 1) {
    return "level2";
  }
  // Default entry tier for all new sellers
  return "rising";
}

export async function recalcFreelancerStats(userId) {
  const startedAt = new Date();
  const id = new mongoose.Types.ObjectId(userId);
  const [agg] = await Review.aggregate([
    { $match: { freelancer: id, isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const completed = await Order.countDocuments({ freelancer: id, status: "completed" });
  const avg = agg ? round1(agg.avg) : 0;
  const count = agg ? agg.count : 0;

  const currentProfile = await FreelancerProfile.findOne({ user: id }).select("sellerLevel").lean();
  const calculatedLevel = calculateSellerLevel({
    completedOrders: completed,
    ratingAverage: avg,
    ratingCount: count,
  });

  const LEVEL_RANKS = { rising: 0, level2: 1, pro: 2, top_rated: 3 };
  const currentRank = LEVEL_RANKS[currentProfile?.sellerLevel] || 0;
  const newRank = LEVEL_RANKS[calculatedLevel] || 0;

  // Upgrade level if newly qualified, preserving any higher admin-assigned tiers
  const finalLevel = newRank > currentRank ? calculatedLevel : (currentProfile?.sellerLevel || calculatedLevel);

  await FreelancerProfile.updateOne(
    { user: id, ...notOlderThan(startedAt) },
    {
      ratingAverage: avg,
      ratingCount: count,
      completedOrders: completed,
      sellerLevel: finalLevel,
      statsComputedAt: startedAt,
    }
  );
}