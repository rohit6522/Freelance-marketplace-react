import mongoose from "mongoose";
import { Gig, Category, User, FreelancerProfile, Order, Favorite } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { assertOwnedImages, ownedPublicIds } from "../utils/assets.js";
import { deleteAsset } from "../services/upload.service.js";
import { escapeRegex, correctQuery } from "../services/search.service.js";

const ACTIVE_ORDER_STATUSES = ["pending", "in_progress", "delivered", "revision_requested"];
const EDITABLE = ["title", "description", "category", "tags", "images", "packages", "addons"];

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

function buildGigAggregationPipeline({
  match,
  sort,
  page,
  limit,
  levels = [],
  minExperience,
}) {
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
  if (levels.length) profileMatch["profile.sellerLevel"] = { $in: levels };
  if (minExperience !== undefined) {
    profileMatch["profile.experienceYears"] = { $gte: Number(minExperience) };
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
    popular: { completedOrders: -1, ratingAverage: -1, _id: -1 },
  }[sort] || { ratingAverage: -1, completedOrders: -1, _id: -1 };

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

  return pipeline;
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
      return res.json({ success: true, gigs: [], pagination: { page, limit, total: 0, pages: 0 }, didYouMean: null, isFallback: false });
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

  const levels = csv(req.query.levels);
  const pipeline = buildGigAggregationPipeline({
    match,
    sort,
    page,
    limit,
    levels,
    minExperience: req.query.minExperience,
  });

  const [result] = await Gig.aggregate(pipeline);
  const total = result.total[0]?.n || 0;

  // If text query yielded results, return them immediately
  if (total > 0 || !q || !q.trim()) {
    return res.json({
      success: true,
      gigs: result.items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      didYouMean: null,
      isFallback: false,
    });
  }

  // Typo tolerance / fuzzy regex fallback when 0 exact results match
  const rawQ = q.trim();
  const [allTags, dbCategories] = await Promise.all([
    Gig.distinct("tags", { status: "published" }),
    Category.find().select("name slug").lean(),
  ]);

  const dictionary = [...(allTags || []), ...dbCategories.map((c) => c.name)];
  const { corrected, hasCorrection } = correctQuery(rawQ, dictionary);
  const didYouMean = hasCorrection ? corrected : null;

  const rawEscaped = escapeRegex(rawQ);
  const fallbackConditions = [
    { title: { $regex: rawEscaped, $options: "i" } },
    { tags: { $regex: rawEscaped, $options: "i" } },
    { description: { $regex: rawEscaped, $options: "i" } },
  ];

  if (didYouMean) {
    const meanEscaped = escapeRegex(didYouMean);
    fallbackConditions.push(
      { title: { $regex: meanEscaped, $options: "i" } },
      { tags: { $regex: meanEscaped, $options: "i" } }
    );
  }

  const fallbackMatch = { ...match };
  delete fallbackMatch.$text;
  fallbackMatch.$or = fallbackConditions;

  const fallbackPipeline = buildGigAggregationPipeline({
    match: fallbackMatch,
    sort,
    page,
    limit,
    levels,
    minExperience: req.query.minExperience,
  });

  const [fallbackResult] = await Gig.aggregate(fallbackPipeline);
  const fallbackTotal = fallbackResult?.total[0]?.n || 0;

  return res.json({
    success: true,
    gigs: fallbackResult?.items || [],
    pagination: {
      page,
      limit,
      total: fallbackTotal,
      pages: Math.ceil(fallbackTotal / limit),
    },
    didYouMean,
    isFallback: fallbackTotal > 0,
  });
});

// ---------------------------------------------------------------------------
// GET /api/gigs/suggestions  (public: autocomplete suggestions & typo hints)
// ---------------------------------------------------------------------------
export const gigSuggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 80);

  if (!q) {
    const [categories, allTags] = await Promise.all([
      Category.find({ parent: null }).select("name slug icon").sort({ sortOrder: 1 }).limit(5).lean(),
      Gig.distinct("tags", { status: "published" }),
    ]);
    return res.json({
      success: true,
      suggestions: {
        query: "",
        didYouMean: null,
        categories: categories.map((c) => ({ _id: c._id, name: c.name, slug: c.slug, icon: c.icon })),
        tags: (allTags || []).slice(0, 6),
        gigs: [],
      },
    });
  }

  const cleanQ = escapeRegex(q);

  const [categories, allTags, matchingGigs, dbCategories] = await Promise.all([
    Category.find({ name: { $regex: cleanQ, $options: "i" } })
      .select("name slug icon")
      .limit(4)
      .lean(),
    Gig.distinct("tags", { status: "published" }),
    Gig.find({
      status: "published",
      $or: [
        { title: { $regex: cleanQ, $options: "i" } },
        { tags: { $regex: cleanQ, $options: "i" } },
      ],
    })
      .select("title startingPrice category images ratingAverage completedOrders")
      .populate("category", "name slug")
      .sort({ ratingAverage: -1, completedOrders: -1 })
      .limit(4)
      .lean(),
    Category.find().select("name slug").lean(),
  ]);

  const matchingTags = (allTags || [])
    .filter((t) => t.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 5);

  const dictionary = [...(allTags || []), ...dbCategories.map((c) => c.name)];
  const { corrected, hasCorrection } = correctQuery(q, dictionary);
  const didYouMean = hasCorrection ? corrected : null;

  res.json({
    success: true,
    suggestions: {
      query: q,
      didYouMean,
      categories: categories.map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
      })),
      tags: matchingTags,
      gigs: matchingGigs.map((g) => ({
        _id: g._id,
        title: g.title,
        startingPrice: g.startingPrice,
        ratingAverage: g.ratingAverage,
        categoryName: g.category?.name || "",
        thumbnail: g.images?.[0]?.url || "",
      })),
    },
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
// GET /api/gigs/tags  (public - popular tags across published gigs)
// ---------------------------------------------------------------------------
export const getPopularTags = asyncHandler(async (req, res) => {
  const result = await Gig.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 30 },
  ]);
  const tags = result.map((r) => ({ tag: r._id, count: r.count }));
  res.json({ success: true, tags });
});

// ---------------------------------------------------------------------------
// POST /api/gigs
// ---------------------------------------------------------------------------
export const createGig = asyncHandler(async (req, res) => {
  const data = pick(req.body, EDITABLE);
  assertOwnedImages(data.images, req.user._id);
  await assertCategoryExists(data.category);

  const gig = new Gig({
    ...data,
    freelancer: req.user._id,
    status: req.body.status === "published" ? "published" : "draft",
  });
  await gig.save(); // hooks: startingPrice, "publish needs an image"

  res.status(201).json({ success: true, gig });
});

export const updateGig = asyncHandler(async (req, res) => {
  const gig = await getOwnedGig(req.params.id, req.user._id);
  const data = pick(req.body, EDITABLE);
  assertOwnedImages(data.images, req.user._id);
  if (data.category) await assertCategoryExists(data.category);

  const before = ownedPublicIds(gig.images, req.user._id);
  gig.set(data);
  await gig.save();

  // remove images the seller dropped from Cloudinary
  const keep = new Set(ownedPublicIds(gig.images, req.user._id));
  await Promise.all(before.filter((id) => !keep.has(id)).map((id) => deleteAsset(id)));

  res.json({ success: true, gig });
});

export const deleteGig = asyncHandler(async (req, res) => {
  const gig = await getOwnedGig(req.params.id, req.user._id);

  if (await Order.exists({ gig: gig._id })) {
    throw new ApiError(409, "This gig has orders and cannot be deleted. Pause it instead.");
  }
  const publicIds = ownedPublicIds(gig.images, req.user._id);
  await Promise.all([gig.deleteOne(), Favorite.deleteMany({ gig: gig._id })]);
  await Promise.all(publicIds.map((id) => deleteAsset(id)));
  res.json({ success: true, message: "Gig deleted" });
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
