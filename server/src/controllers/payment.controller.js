import { Payment } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/payments/mine
// Client: what they paid.  Freelancer: what they earned. Powers the Earnings / vault widgets.
export const myPayments = asyncHandler(async (req, res) => {
  const side = req.user.role === "client" ? "payer" : "payee";
  const match = { [side]: req.user._id };

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [payments, total, grouped] = await Promise.all([
    Payment.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "order",
        select: "orderNumber status packageSnapshot.title gig",
        populate: { path: "gig", select: "title" },
      })
      .lean(),
    Payment.countDocuments(match),
    Payment.aggregate([{ $match: match }, { $group: { _id: "$status", amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);

  const summary = { held: 0, released: 0, refunded: 0, pending: 0, failed: 0 };
  grouped.forEach((g) => (summary[g._id] = g.amount));

  res.json({
    success: true,
    isSimulated: true,
    summary, // held = in simulated escrow, released = paid out / spent
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});