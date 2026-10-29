import { Order, Payment, Gig, Review, Favorite, FreelancerProfile, ORDER_STATUSES } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { unreadCounts } from "../services/messaging.service.js";

const statusMap = (rows) => {
  const m = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => (m[r._id] = r.n));
  return m;
};
const moneyMap = (rows) => {
  const m = { pending: 0, held: 0, released: 0, refunded: 0, failed: 0 };
  rows.forEach((r) => (m[r._id] = r.amount));
  return m;
};
const countByStatus = (match) =>
  Order.aggregate([{ $match: match }, { $group: { _id: "$status", n: { $sum: 1 } } }]);

// % of completed orders whose first delivery landed before the due date (null = no data yet)
async function onTimeRate(match) {
  const orders = await Order.find({ ...match, status: "completed", dueDate: { $ne: null } })
    .select("dueDate deliveries.deliveredAt")
    .lean();
  if (!orders.length) return { rate: null, sampleSize: 0 };
  const onTime = orders.filter(
    (o) => o.deliveries?.[0] && new Date(o.deliveries[0].deliveredAt) <= new Date(o.dueDate)
  ).length;
  return { rate: Math.round((onTime / orders.length) * 100), sampleSize: orders.length };
}

// GET /api/dashboard/client
export const clientDashboard = asyncHandler(async (req, res) => {
  const me = req.user._id;

  const [statusRows, payRows, saved, unread, recent, onTime, reviewsWritten] = await Promise.all([
    countByStatus({ client: me }),
    Payment.aggregate([{ $match: { payer: me } }, { $group: { _id: "$status", amount: { $sum: "$amount" } } }]),
    Favorite.countDocuments({ user: me }),
    unreadCounts(me),
    Order.find({ client: me })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber status price dueDate createdAt packageSnapshot.title gig freelancer")
      .populate("gig", "title images")
      .populate("freelancer", "firstName lastName avatar")
      .lean(),
    onTimeRate({ client: me }),
    Review.countDocuments({ client: me }),
  ]);

  const s = statusMap(statusRows);
  const money = moneyMap(payRows);

  res.json({
    success: true,
    isSimulated: true,
    stats: {
      totalOrders: Object.values(s).reduce((a, b) => a + b, 0),
      activePipeline: s.pending + s.in_progress + s.revision_requested,
      awaitingReview: s.delivered, // delivered, waiting for the client to approve
      completedOrders: s.completed,
      cancelledOrders: s.cancelled,
      reviewsPending: Math.max(0, s.completed - reviewsWritten),
      escrowHeld: money.held,
      totalSpent: money.released,
      savedGigs: saved,
      unreadMessages: unread.total,
      onTimeCompletion: onTime, // { rate, sampleSize }
    },
    recentOrders: recent,
  });
});

// GET /api/dashboard/freelancer
export const freelancerDashboard = asyncHandler(async (req, res) => {
  const me = req.user._id;

  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCMonth(since.getUTCMonth() - 5); // last 6 months including this one

  const [statusRows, payRows, monthRows, gigRows, profile, unread, recent, topGigs, onTime] = await Promise.all([
    countByStatus({ freelancer: me }),
    Payment.aggregate([{ $match: { payee: me } }, { $group: { _id: "$status", amount: { $sum: "$amount" } } }]),
    Payment.aggregate([
      { $match: { payee: me, status: "released", releasedAt: { $gte: since } } },
      { $group: { _id: { y: { $year: "$releasedAt" }, m: { $month: "$releasedAt" } }, amount: { $sum: "$amount" } } },
    ]),
    Gig.aggregate([{ $match: { freelancer: me } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    FreelancerProfile.findOne({ user: me }).select("ratingAverage ratingCount completedOrders sellerLevel").lean(),
    unreadCounts(me),
    Order.find({ freelancer: me })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber status price dueDate createdAt packageSnapshot.title gig client")
      .populate("gig", "title images")
      .populate("client", "firstName lastName avatar companyName")
      .lean(),
    Gig.find({ freelancer: me })
      .sort({ completedOrders: -1, ratingAverage: -1 })
      .limit(3)
      .select("title status startingPrice ratingAverage ratingCount completedOrders")
      .lean(),
    onTimeRate({ freelancer: me }),
  ]);

  const s = statusMap(statusRows);
  const money = moneyMap(payRows);
  const gigsByStatus = { draft: 0, published: 0, paused: 0 };
  gigRows.forEach((g) => (gigsByStatus[g._id] = g.n));

  // Fill months with no earnings so the chart always has 6 points
  const monthly = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth() + i, 1));
    const row = monthRows.find((r) => r._id.y === d.getUTCFullYear() && r._id.m === d.getUTCMonth() + 1);
    monthly.push({
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      year: d.getUTCFullYear(),
      amount: row ? row.amount : 0,
    });
  }

  res.json({
    success: true,
    isSimulated: true,
    stats: {
      awaitingAcceptance: s.pending,
      activeOrders: s.in_progress + s.revision_requested,
      awaitingClientReview: s.delivered,
      completedOrders: s.completed,
      cancelledOrders: s.cancelled,
      earnings: {
        released: money.released, // paid out
        pendingInEscrow: money.held,
        thisMonth: monthly[monthly.length - 1].amount,
        monthly,
      },
      ratingAverage: profile?.ratingAverage || 0,
      ratingCount: profile?.ratingCount || 0,
      sellerLevel: profile?.sellerLevel || "rising",
      gigs: gigsByStatus,
      unreadMessages: unread.total,
      onTimeDelivery: onTime, // { rate, sampleSize }
    },
    recentOrders: recent,
    topGigs,
  });
});