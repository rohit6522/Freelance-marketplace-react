import { User, Gig, Order, Review, Category, ModerationLog } from "../models/index.js";
import { runInTransaction } from "../utils/transaction.js";
import { slugify } from "../utils/slugify.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";
import { disconnectUser } from "../realtime/socket.js";

const paging = (q, def) => ({
  page: Math.max(1, parseInt(q.page, 10) || 1),
  limit: Math.min(50, Math.max(1, parseInt(q.limit, 10) || def)),
});
const pages = (total, limit) => Math.ceil(total / limit);
const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
const countBy = (Model, field) => Model.aggregate([{ $group: { _id: `$${field}`, n: { $sum: 1 } } }]);

const record = (admin, action, targetType, target, reason, label) =>
  ModerationLog.create({
    admin: admin._id, action, targetType, target,
    reason: reason || undefined, label: label || undefined,
  });
// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [roles, gigs, orders, total, withReports, hidden, suspended] = await Promise.all([
    User.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: "$role", n: { $sum: 1 } } }]),
    countBy(Gig, "status"),
    countBy(Order, "status"),
    Review.countDocuments(),
    Review.countDocuments({ "reports.0": { $exists: true }, isHidden: false }),
    Review.countDocuments({ isHidden: true }),
    User.countDocuments({ isActive: false, deletedAt: null }),
  ]);
  res.json({
    success: true,
    stats: {
      users: toMap(roles),
      suspendedUsers: suspended,
      gigs: toMap(gigs),
      orders: toMap(orders),
      reviews: { total, withReports, hidden },
    },
  });
});

// GET /api/admin/reviews?filter=reported|hidden|all
export const listReviews = asyncHandler(async (req, res) => {
  const filter = req.query.filter || "reported";
  const match =
    filter === "reported" ? { "reports.0": { $exists: true }, isHidden: false } : filter === "hidden" ? { isHidden: true } : {};
  const { page, limit } = paging(req.query, 8);

  const [reviews, total] = await Promise.all([
    Review.find(match)
      .sort({ updatedAt: -1 }) // newest report activity first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("client", "firstName lastName email")
      .populate("freelancer", "firstName lastName email")
      .populate("gig", "title")
      .populate("reports.user", "firstName lastName")
      .lean(),
    Review.countDocuments(match),
  ]);
  res.json({ success: true, reviews, pagination: { page, limit, total, pages: pages(total, limit) } });
});

// PATCH /api/admin/reviews/:id/visibility   { hidden, reason }
export const setReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  const { hidden, reason } = req.body;
  if (review.isHidden === hidden) throw new ApiError(409, hidden ? "Review is already hidden" : "Review is already visible");

  review.isHidden = hidden;
  await review.save();
  // Ratings are always recalculated from visible reviews only
  await Promise.all([recalcGigStats(review.gig), recalcFreelancerStats(review.freelancer)]);
  await record(req.user, hidden ? "review_hidden" : "review_unhidden", "review", review._id, reason);

  res.json({ success: true, review });
});

// POST /api/admin/reviews/:id/dismiss-reports   { reason? }
export const dismissReports = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (!review.reports.length) throw new ApiError(409, "This review has no reports to dismiss");

  review.reports = [];
  await review.save();
  await record(req.user, "reports_dismissed", "review", review._id, req.body.reason);
  res.json({ success: true, review });
});

// GET /api/admin/users?role=&status=suspended&q=
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req.query, 15);
  const match = {};
  if (req.query.role) match.role = req.query.role;

  if (req.query.status === "suspended") { match.isActive = false; match.deletedAt = null; }

  const q = (req.query.q || "").trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(match)
      .select("firstName lastName email role isActive deletedAt createdAt avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(match),
  ]);
  res.json({ success: true, users, pagination: { page, limit, total, pages: pages(total, limit) } });
});

// PATCH /api/admin/users/:id/status   { isActive, reason }
export const setUserStatus = asyncHandler(async (req, res) => {

  const target = await User.findById(req.params.id).select("role isActive deletedAt");
  if (!target) throw new ApiError(404, "User not found");
  if (target.deletedAt) throw new ApiError(400, "Deleted accounts can't be changed");
  if (String(target._id) === String(req.user._id)) throw new ApiError(400, "You can't change your own status");
  if (target.role === "admin") throw new ApiError(403, "Admin accounts can't be suspended here");

  const { isActive, reason } = req.body;
  if (target.isActive === isActive) throw new ApiError(409, isActive ? "User is already active" : "User is already suspended");

  await User.findByIdAndUpdate(target._id, { isActive });

  let pausedGigs = 0;
  if (!isActive) {
    // A suspended seller's gigs must not stay visible or orderable; they are paused, not deleted
    const r = await Gig.updateMany({ freelancer: target._id, status: "published" }, { status: "paused" });
    pausedGigs = r.modifiedCount;
    disconnectUser(target._id); // close their live socket connections
  }

  await record(req.user, isActive ? "user_reactivated" : "user_suspended", "user", target._id, reason);
  res.json({ success: true, isActive, pausedGigs });
});

// GET /api/admin/log
export const listLog = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req.query, 20);
  const [logs, total] = await Promise.all([
    ModerationLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("admin", "firstName lastName")
      .lean(),
    ModerationLog.countDocuments(),
  ]);

  const ids = (type) => logs.filter((l) => l.targetType === type).map((l) => l.target);
  const [users, reviews] = await Promise.all([
    User.find({ _id: { $in: ids("user") } }).select("firstName lastName email").lean(),
    Review.find({ _id: { $in: ids("review") } }).select("gig").populate("gig", "title").lean(),
  ]);
  const userMap = new Map(users.map((u) => [String(u._id), `${u.firstName} ${u.lastName} (${u.email})`]));
  const reviewMap = new Map(reviews.map((r) => [String(r._id), r.gig?.title ? `Review on "${r.gig.title}"` : "Review"]));

  res.json({
    success: true,
    logs: logs.map((l) => ({
      ...l,
      targetLabel:
        l.targetType === "category"
          ? l.label || "(deleted)"
          : (l.targetType === "user" ? userMap : reviewMap).get(String(l.target)) || "(deleted)",
    })),
    pagination: { page, limit, total, pages: pages(total, limit) },
  });
});



// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
async function categoriesWithCounts() {
  const [cats, published, total] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    Gig.aggregate([{ $match: { status: "published" } }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
    Gig.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const pub = new Map(published.map((r) => [String(r._id), r.n]));
  const all = new Map(total.map((r) => [String(r._id), r.n]));
  return cats.map((c) => ({
    ...c,
    publishedGigs: pub.get(String(c._id)) || 0,
    totalGigs: all.get(String(c._id)) || 0,
  }));
}

// GET /api/admin/categories
export const listCategoriesAdmin = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: await categoriesWithCounts() });
});

// POST /api/admin/categories   { name, description? }
export const createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name.replace(/\s+/g, " ");
  const slug = slugify(name);
  // "Data & AI" and "Data and AI" give the same link name, so they count as the same category
  if (await Category.exists({ $or: [{ slug }, { name }] })) {
    throw new ApiError(409, "A category with this name (or a very similar one) already exists");
  }
  const last = await Category.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
  const category = await Category.create({
    name,
    slug,
    description: req.body.description || undefined,
    icon: "category",
    sortOrder: (last?.sortOrder ?? -1) + 1,
  });
  await record(req.user, "category_created", "category", category._id, null, category.name);
  res.status(201).json({ success: true, category });
});

// PATCH /api/admin/categories/:id   { name?, description? }
export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new ApiError(404, "Category not found");

  const before = cat.name;
  if (req.body.name !== undefined) {
    const name = req.body.name.replace(/\s+/g, " ");
    const clash = await Category.exists({ _id: { $ne: cat._id }, $or: [{ name }, { slug: slugify(name) }] });
    if (clash) throw new ApiError(409, "Another category already uses this name (or a very similar one)");
    cat.name = name; // the slug stays as it was, so existing links keep working
  }
  if (req.body.description !== undefined) cat.description = req.body.description || undefined;
  await cat.save();

  await record(req.user, "category_updated", "category", cat._id, before !== cat.name ? `Renamed from "${before}"` : null, cat.name);
  res.json({ success: true, category: cat });
});

// PUT /api/admin/categories/order   { ids: [every category id, in the new order] }
export const reorderCategories = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const have = new Set((await Category.find().select("_id").lean()).map((c) => String(c._id)));
  if (new Set(ids).size !== ids.length || ids.length !== have.size || !ids.every((id) => have.has(id))) {
    throw new ApiError(409, "The category list changed. Reload the page and try again.");
  }
  await Category.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: i } } } })));
  res.json({ success: true });
});

// DELETE /api/admin/categories/:id   { moveTo?, reason? }
export const deleteCategory = asyncHandler(async (req, res) => {
  const { moveTo, reason } = req.body || {}; // a DELETE without a body leaves req.body undefined
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new ApiError(404, "Category not found");
  if ((await Category.countDocuments()) <= 1) throw new ApiError(409, "At least one category must exist");
  if (moveTo && String(moveTo) === String(cat._id)) throw new ApiError(400, "Choose a different category to move the gigs to");

  const total = await Gig.countDocuments({ category: cat._id });
  if (total > 0) {
    if (!moveTo) {
      throw new ApiError(409, `${total} gig${total === 1 ? " uses" : "s use"} this category. Choose another category to move them to.`);
    }
    if (!(await Category.exists({ _id: moveTo }))) throw new ApiError(400, "The category to move gigs to does not exist");
  }

  await runInTransaction(async (session) => {
    if (total > 0) await Gig.updateMany({ category: cat._id }, { category: moveTo }, { session });
    await Category.deleteOne({ _id: cat._id }, { session });
  });

  await record(req.user, "category_deleted", "category", cat._id, reason || (total ? `${total} gig(s) moved` : null), cat.name);
  res.json({ success: true, movedGigs: total });
});