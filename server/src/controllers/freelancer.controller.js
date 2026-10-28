import { User, FreelancerProfile, Gig, PortfolioProject } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/freelancers/:id   (:id is the freelancer's USER id)
export const getFreelancer = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "freelancer", isActive: true })
    .select("firstName lastName avatar createdAt")
    .lean();
  if (!user) throw new ApiError(404, "Freelancer not found");

  const [profile, gigs, portfolio] = await Promise.all([
    FreelancerProfile.findOne({ user: user._id }).lean(),
    Gig.find({ freelancer: user._id, status: "published" })
      .select("title images startingPrice minDeliveryDays ratingAverage ratingCount tags category")
      .sort({ createdAt: -1 })
      .lean(),
    PortfolioProject.find({ freelancer: user._id }).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({ success: true, freelancer: { ...user, profile }, gigs, portfolio });
});