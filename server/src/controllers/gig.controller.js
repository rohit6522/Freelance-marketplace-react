import mongoose from "mongoose";
import { Gig, Category, User, FreelancerProfile, Order, Favorite } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";

const ACTIVE_ORDER_STATUSES = ["pending", "in_progress", "delivered", "revision_requested"];
const EDITABLE = ["title", "description", "category", "tags", "images", "packages"];

const csv = (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

async function getOwnedGig(id, userId) {
  const gig = await Gig.findById(id);
  if (!gig) throw new ApiError(404, "Gig not found");
  if (String(gig.freelancer) !== String(userId)) {
    throw new ApiError(403, "You can only manage your own gigs");
  }
  return gig;
}

async function assertCategoryExists(id) {
  if (!(await Category.exists({ _id: id }))) throw new ApiError(400, "Category does not exist");
}

// ---------------------------------------------------------------------------
// GET /api/gigs  (public: search + filters + sorting + pagination, server-side)
// ---------------------------------------------------------------------------
export const listGigs = asyncHandler(async (req, res) => {
  const { q, category, sort = "relevance" } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const match = { status: "published" };

  if (q && q.trim()) match.$text = { $search: q.trim().slice(0, 100) };

  if (category) {
    const key = String(category);
    const cat = mongoose.isValidObjectId(key)
      ? await Category.findById(key)
      : await Category.findOne({ slug: key.toLowerCase() });
    if (!cat) {
      return res.json({ success: true, gigs: [], pagination: { page, limit, total: 0, pages: 0 } });
    }
    // include sub-categories of the selected category
    const ids = (await Category.find({ $or: [{ _id: cat._id }, { parent: cat._id }] }).select("_id")).map((c) => c._id);
    match.category = { $in: ids };
  }

  // Budget filters on the cheapest package (startingPrice)
  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    match.startingPrice = {};
    if (req.query.minPrice !== undefined) match.startingPrice.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice !== undefined) match.startingPrice.$lte = Number(req.query.maxPrice);
  }
  if (req.query.maxDelivery !== undefined) match.minDeliveryDays = { $lte: Number(req.query.maxDelivery) };
  if (req.query.minRating !== undefined) match.ratingAverage = { $gte: Number(req.query.minRating) };

  const tags = csv(req.query.tags).map((t) => t.toLowerCase());
  if (tags.length) match.tags = { $in: tags };

  const pipeline = [{ $match: match }];
  if (match.$text) pipeline.push({ $addFields: { score: { $meta: "textScore" } } });

  // Join freelancer profile (seller level / experience filters)
  pipeline.push(
    {
      $lookup: {
        from: FreelancerProfile.collection.name,
        localField: "freelancer",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: "$profile" }
  );

  const profileMatch = {};
  const levels = csv(req.query.levels);
  if (levels.length) profileMatch["profile.sellerLevel"] = { $in: levels };
  if (req.query.minExperience !== undefined) {
    profileMatch["profile.experienceYears"] = { $gte: Number(req.query.minExperience) };
  }
  if (Object.keys(profileMatch).length) pipeline.push({ $match: profileMatch });

  // Seller name + avatar
  pipeline.push(
    {
      $lookup: {
        from: User.collection.name,
        localField: "freelancer",
        foreignField: "_id",
        as: "seller",
        pipeline: [{ $project: { firstName: 1, lastName: 1, avatar: 1 } }],
      },
    },
    { $unwind: "$seller" }
  );

  const sortStage = {
    relevance: match.$text
      ? { score: -1, ratingAverage: -1, _id: -1 }
      : { ratingAverage: -1, completedOrders: -1, _id: -1 },
    newest: { createdAt: -1, _id: -1 },
    price_asc: { startingPrice: 1, _id: 1 },
    price_desc: { startingPrice: -1, _id: -1 },
    rating: { ratingAverage: -1, ratingCount: -1, _id: -1 },
    rating: { ratingAverage: -1, ratingCount: -1, _id: -1 },
    popular: { completedOrders: -1, ratingAverage: -1, _id: -1 },
  }[sort];

  pipeline.push({
    $facet: {
      items: [
        { $sort: sortStage },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            title: 1,
            tags: 1,
            category: 1,
            startingPrice: 1,
            minDeliveryDays: 1,
            ratingAverage: 1,
            ratingCount: 1,
            createdAt: 1,
            thumbnail: { $arrayElemAt: ["$images.url", 0] },
            sellerLevel: "$profile.sellerLevel",
            seller: 1,
          },
        },
      ],
      total: [{ $count: "n" }],
    },
  });

  const [result] = await Gig.aggregate(pipeline);
  const total = result.total[0]?.n || 0;

  res.json({
    success: true,
    gigs: result.items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ---------------------------------------------------------------------------
// GET /api/gigs/:id  (public for published gigs, owner can see own drafts)
// ---------------------------------------------------------------------------
export const getGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate("category", "name slug").lean();
  if (!gig) throw new ApiError(404, "Gig not found");

  const isOwner = req.user && String(req.user._id) === String(gig.freelancer);
  if (gig.status !== "published" && !isOwner) throw new ApiError(404, "Gig not found");

  const [seller, profile] = await Promise.all([
    User.findById(gig.freelancer).select("firstName lastName avatar createdAt").lean(),
    FreelancerProfile.findOne({ user: gig.freelancer }).lean(),
  ]);

  res.json({ success: true, gig, seller: { ...seller, profile } });
});

// ---------------------------------------------------------------------------
// GET /api/gigs/mine  (freelancer: all own gigs with order stats)
// ---------------------------------------------------------------------------
export const myGigs = asyncHandler(async (req, res) => {
  const [gigs, counts] = await Promise.all([
    Gig.find({ freelancer: req.user._id }).populate("category", "name slug").sort({ updatedAt: -1 }).lean(),
    Order.aggregate([
      { $match: { freelancer: req.user._id } },
      {
        $group: {
          _id: "$gig",
          totalOrders: { $sum: 1 },
          activeOrders: { $sum: { $cond: [{ $in: ["$status", ACTIVE_ORDER_STATUSES] }, 1, 0] } },
        },
      },
    ]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c]));
  res.json({
    success: true,
    gigs: gigs.map((g) => ({
      ...g,
      totalOrders: map.get(String(g._id))?.totalOrders || 0,
      activeOrders: map.get(String(g._id))?.activeOrders || 0,
    })),
  });
});

// ---------------------------------------------------------------------------
// POST /api/gigs
// ---------------------------------------------------------------------------
export const createGig = asyncHandler(async (req, res) => {
  const data = pick(req.body, EDITABLE);
  await assertCategoryExists(data.category);

  const gig = new Gig({
    ...data,
    freelancer: req.user._id,
    status: req.body.status === "published" ? "published" : "draft",
  });
  await gig.save(); // runs hooks: startingPrice, "publish needs an image"

  res.status(201).json({ success: true, gig });
});

// ---------------------------------------------------------------------------
// PUT /api/gigs/:id  (full update by owner)
// ---------------------------------------------------------------------------
export const updateGig = asyncHandler(async (req, res) => {
  const gig = await getOwnedGig(req.params.id, req.user._id);
  const data = pick(req.body, EDITABLE);
  if (data.category) await assertCategoryExists(data.category);

  gig.set(data);
  await gig.save();
  res.json({ success: true, gig });
});

// ---------------------------------------------------------------------------
// PATCH /api/gigs/:id/status  (publish / pause / back to draft)
// ---------------------------------------------------------------------------
export const setGigStatus = asyncHandler(async (req, res) => {
  const gig = await getOwnedGig(req.params.id, req.user._id);
  gig.status = req.body.status;
  await gig.save();
  res.json({ success: true, gig });
});

// ---------------------------------------------------------------------------
// DELETE /api/gigs/:id
// ---------------------------------------------------------------------------
export const deleteGig = asyncHandler(async (req, res) => {
  const gig = await getOwnedGig(req.params.id, req.user._id);

  if (await Order.exists({ gig: gig._id })) {
    throw new ApiError(409, "This gig has orders and cannot be deleted. Pause it instead.");
  }
  await Promise.all([gig.deleteOne(), Favorite.deleteMany({ gig: gig._id })]);
  res.json({ success: true, message: "Gig deleted" });
});