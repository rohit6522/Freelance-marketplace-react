import { Order, Gig, Payment, Review, ORDER_STATUSES } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { runInTransaction } from "../utils/transaction.js";
import { createSimulatedPayment, releasePayment, refundPayment } from "../services/payment.service.js";
import { applyTransition, revisionsLeft, nextStatusesFor } from "../services/order.service.js";
import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";

const csv = (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

// Loads an order and works out whether the user is its client or freelancer.
// Non-participants get a 404 so order ids can't be probed.
async function loadOrder(id, user, session) {
  const order = await Order.findById(id).session(session || null);
  if (!order) throw new ApiError(404, "Order not found");
  const uid = String(user._id);
  const role = String(order.client) === uid ? "client" : String(order.freelancer) === uid ? "freelancer" : null;
  if (!role) throw new ApiError(404, "Order not found");
  return { order, role };
}

// ---------------------------------------------------------------------------
// POST /api/orders  (client) - checkout: price comes from the gig, never the request
// ---------------------------------------------------------------------------
export const createOrder = asyncHandler(async (req, res) => {
  const { gigId, tier, requirements } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== "published") throw new ApiError(404, "Gig not found or unavailable");
  if (String(gig.freelancer) === String(req.user._id)) throw new ApiError(400, "You cannot order your own gig");

  const p = gig.packages[tier];

  const { order, payment } = await runInTransaction(async (session) => {
    const order = new Order({
      gig: gig._id,
      client: req.user._id,
      freelancer: gig.freelancer,
      packageTier: tier,
      packageSnapshot: {
        title: p.title,
        price: p.price,
        deliveryDays: p.deliveryDays,
        revisions: p.revisions,
        features: [...p.features],
      },
      price: p.price,
      requirements,
      status: "pending",
      statusHistory: [{ status: "pending", by: req.user._id, note: "Order placed" }],
    });
    await order.save({ session });
    const payment = await createSimulatedPayment({ order, session });
    return { order, payment };
  });

  res.status(201).json({
    success: true,
    order,
    payment,
    notice: "Simulated payment: no real money was charged.",
  });
});

// ---------------------------------------------------------------------------
// GET /api/orders  (own orders, role-aware) + status counts for the tabs
// ---------------------------------------------------------------------------
export const listOrders = asyncHandler(async (req, res) => {
  const side = req.user.role === "client" ? "client" : "freelancer";
  const base = { [side]: req.user._id };
  const filter = { ...base };

  const statuses = csv(req.query.status).filter((s) => ORDER_STATUSES.includes(s));
  if (statuses.length) filter.status = { $in: statuses };

  const q = (req.query.q || "").trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const gigIds = await Gig.distinct("_id", { title: rx });
    filter.$or = [{ orderNumber: rx }, { gig: { $in: gigIds } }];
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [orders, total, grouped] = await Promise.all([
    Order.find(filter)
      .select("-deliveries -statusHistory -attachments")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("gig", "title images")
      .populate("client", "firstName lastName avatar companyName")
      .populate("freelancer", "firstName lastName avatar")
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const counts = { all: 0 };
  ORDER_STATUSES.forEach((s) => (counts[s] = 0));
  grouped.forEach((g) => {
    counts[g._id] = g.n;
    counts.all += g.n;
  });

  res.json({ success: true, orders, counts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// ---------------------------------------------------------------------------
// GET /api/orders/:id
// ---------------------------------------------------------------------------
export const getOrder = asyncHandler(async (req, res) => {
  const { order, role } = await loadOrder(req.params.id, req.user);

  const [payment, review] = await Promise.all([
    Payment.findOne({ order: order._id }).lean(),
    Review.findOne({ order: order._id }).lean(),
  ]);

  await order.populate([
    { path: "gig", select: "title images category" },
    { path: "client", select: "firstName lastName avatar companyName" },
    { path: "freelancer", select: "firstName lastName avatar" },
  ]);

  res.json({
    success: true,
    order,
    payment,
    review,
    role,
    permissions: {
      nextStatuses: nextStatusesFor(order, role),
      revisionsLeft: revisionsLeft(order), // null = unlimited
      canReview: role === "client" && order.status === "completed" && !review,
    },
  });
});

// ---------------------------------------------------------------------------
// Status actions share one pattern: load -> validate transition -> mutate -> save
// ---------------------------------------------------------------------------
const act = (handler, after) =>
  asyncHandler(async (req, res) => {
    const order = await runInTransaction(async (session) => {
      const { order, role } = await loadOrder(req.params.id, req.user, session);
      await handler({ order, role, req, session });
      await order.save({ session });
      return order;
    });
    if (after) await after(order);
    res.json({ success: true, order });
  });

// POST /api/orders/:id/accept  (freelancer)
export const acceptOrder = act(({ order, role, req }) => {
  applyTransition(order, role, "in_progress", req.user._id, "Order accepted");
  order.dueDate = new Date(Date.now() + order.packageSnapshot.deliveryDays * 24 * 60 * 60 * 1000);
});

// POST /api/orders/:id/deliver  (freelancer) - first delivery or re-delivery after a revision
export const deliverOrder = act(({ order, role, req }) => {
  applyTransition(order, role, "delivered", req.user._id, "Work delivered");
  order.deliveries.push({
    message: req.body.message,
    files: (req.body.files || []).map((f) => pick(f, ["url", "name", "size"])),
  });
});

// POST /api/orders/:id/revision  (client)
export const requestRevision = act(({ order, role, req }) => {
  applyTransition(order, role, "revision_requested", req.user._id, req.body.message);
  if (revisionsLeft(order) === 0) throw new ApiError(409, "No revisions left for this package");
  order.revisionsUsed += 1;
});

// POST /api/orders/:id/complete  (client) - releases the simulated escrow
export const completeOrder = act(
  async ({ order, role, req, session }) => {
    applyTransition(order, role, "completed", req.user._id, "Order accepted by client");
    order.completedAt = new Date();
    await releasePayment(order._id, session);
  },
  (order) => Promise.all([recalcGigStats(order.gig), recalcFreelancerStats(order.freelancer)])
);

// POST /api/orders/:id/cancel  (client while pending; freelancer while pending/in progress/revision)
export const cancelOrder = act(async ({ order, role, req, session }) => {
  applyTransition(order, role, "cancelled", req.user._id, req.body.reason);
  order.cancelReason = req.body.reason;
  await refundPayment(order._id, session);
});