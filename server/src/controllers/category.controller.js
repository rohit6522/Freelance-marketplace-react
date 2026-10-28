import { Category, Gig } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ sortOrder: 1 }).lean(),
    Gig.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    success: true,
    categories: categories.map((c) => ({ ...c, gigCount: countMap.get(String(c._id)) || 0 })),
  });
});