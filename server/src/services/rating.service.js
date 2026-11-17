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

export async function recalcFreelancerStats(userId) {
  const startedAt = new Date();
  const id = new mongoose.Types.ObjectId(userId);
  const [agg] = await Review.aggregate([
    { $match: { freelancer: id, isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const completed = await Order.countDocuments({ freelancer: id, status: "completed" });
  await FreelancerProfile.updateOne(
    { user: id, ...notOlderThan(startedAt) },
    {
      ratingAverage: agg ? round1(agg.avg) : 0,
      ratingCount: agg ? agg.count : 0,
      completedOrders: completed,
      statsComputedAt: startedAt,
    }
  );
}