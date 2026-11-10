import { User, Gig, Order, Review, Payment } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TTL_MS = 60 * 1000; // anonymous visitors hit this on the login page, so cache it for a minute
let cache = { at: 0, stats: null };

const shorten = (s, n = 200) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

// GET /api/public/stats  (aggregates only, plus one short public review quote)
export const publicStats = asyncHandler(async (req, res) => {
  if (cache.stats && Date.now() - cache.at < TTL_MS) return res.json({ success: true, stats: cache.stats });

  const [freelancers, gigs, completedOrders, ratings, released, recent] = await Promise.all([
    User.countDocuments({ role: "freelancer", isActive: true }),
    Gig.countDocuments({ status: "published" }),
    Order.countDocuments({ status: "completed" }),
    Review.aggregate([{ $match: { isHidden: false } }, { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: { status: "released" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Review.find({ isHidden: false, rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("client", "firstName lastName")
      .populate("gig", "title status")
      .lean(),
  ]);

  // Only quote reviews of gigs that are still published
  const quote = recent.find((r) => r.gig?.status === "published" && r.client);

  const stats = {
    freelancers,
    gigs,
    completedOrders,
    reviews: {
      count: ratings[0]?.count || 0,
      average: ratings[0] ? Math.round(ratings[0].avg * 10) / 10 : 0,
    },
    simulatedVolume: released[0]?.total || 0,
    latestReview: quote
      ? {
          rating: quote.rating,
          comment: shorten(quote.comment),
          author: `${quote.client.firstName} ${(quote.client.lastName || "")[0] || ""}.`,
          gigTitle: quote.gig.title,
        }
      : null,
  };

  cache = { at: Date.now(), stats };
  res.json({ success: true, stats });
});