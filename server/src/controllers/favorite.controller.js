import { Favorite, Gig } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/favorites   { gigId }   (idempotent)
export const addFavorite = asyncHandler(async (req, res) => {
  const gig = await Gig.findOne({ _id: req.body.gigId, status: "published" }).select("freelancer");
  if (!gig) throw new ApiError(404, "Gig not found");
  if (String(gig.freelancer) === String(req.user._id)) throw new ApiError(400, "You cannot save your own gig");

  await Favorite.updateOne(
    { user: req.user._id, gig: gig._id },
    { $setOnInsert: { user: req.user._id, gig: gig._id } },
    { upsert: true }
  );
  res.json({ success: true, saved: true });
});

// DELETE /api/favorites/:gigId
export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, gig: req.params.gigId });
  res.json({ success: true, saved: false });
});

// GET /api/favorites/ids   -> used to paint the heart icons on listing pages
export const favoriteIds = asyncHandler(async (req, res) => {
  const favs = await Favorite.find({ user: req.user._id }).select("gig").lean();
  res.json({ success: true, ids: favs.map((f) => String(f.gig)) });
});

// GET /api/favorites   -> "Saved Gigs" dashboard page
export const listFavorites = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const favs = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const gigs = await Gig.find({ _id: { $in: favs.map((f) => f.gig) }, status: "published" })
    .select("title images tags startingPrice minDeliveryDays ratingAverage ratingCount freelancer")
    .populate("freelancer", "firstName lastName avatar")
    .lean();

  const byId = new Map(gigs.map((g) => [String(g._id), g]));
  const ordered = favs.map((f) => byId.get(String(f.gig))).filter(Boolean); // hides unpublished/deleted gigs

  res.json({
    success: true,
    gigs: ordered.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total: ordered.length, pages: Math.ceil(ordered.length / limit) },
  });
});