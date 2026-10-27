import mongoose from "mongoose";
import { Review, Order, Gig, FreelancerProfile } from "../models/index.js";

const round1 = (n) => Math.round(n * 10) / 10;

export async function recalcGigStats(gigId) {
  const id = new mongoose.Types.ObjectId(gigId);
  const [agg] = await Review.aggregate([
    { $match: { gig: id, isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const completed = await Order.countDocuments({ gig: id, status: "completed" });
  await Gig.findByIdAndUpdate(id, {
    ratingAverage: agg ? round1(agg.avg) : 0,
    ratingCount: agg ? agg.count : 0,
    completedOrders: completed,
  });
}

export async function recalcFreelancerStats(userId) {
  const id = new mongoose.Types.ObjectId(userId);
  const [agg] = await Review.aggregate([
    { $match: { freelancer: id, isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const completed = await Order.countDocuments({ freelancer: id, status: "completed" });
  await FreelancerProfile.findOneAndUpdate(
    { user: id },
    {
      ratingAverage: agg ? round1(agg.avg) : 0,
      ratingCount: agg ? agg.count : 0,
      completedOrders: completed,
    }
  );
}