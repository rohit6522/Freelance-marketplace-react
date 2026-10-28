import { User, FreelancerProfile, PortfolioProject } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";

const PROFILE_FIELDS = ["title", "bio", "location", "skills", "languages", "experienceYears", "hourlyRate", "workHistory"];
const PORTFOLIO_FIELDS = ["title", "description", "industry", "metric", "durationWeeks", "deliverables", "images", "externalLink"];

// GET /api/profile/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = req.user.role === "freelancer"
    ? await FreelancerProfile.findOne({ user: req.user._id }).lean()
    : null;
  res.json({ success: true, user: req.user, profile });
});

// PUT /api/profile/account   (any logged-in user)
export const updateAccount = asyncHandler(async (req, res) => {
  const data = pick(req.body, ["firstName", "lastName", "companyName", "domainFocus"]);
  const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// PUT /api/profile/freelancer   (freelancer only)
export const updateFreelancerProfile = asyncHandler(async (req, res) => {
  const data = pick(req.body, PROFILE_FIELDS); // ratings / seller level can never be set from here
  let profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) profile = new FreelancerProfile({ user: req.user._id });
  profile.set(data);
  await profile.save();
  res.json({ success: true, profile });
});

// ---- Portfolio (freelancer only) ----

// GET /api/portfolio/mine
export const myPortfolio = asyncHandler(async (req, res) => {
  const projects = await PortfolioProject.find({ freelancer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, projects });
});

// POST /api/portfolio
export const createProject = asyncHandler(async (req, res) => {
  const project = await PortfolioProject.create({ ...pick(req.body, PORTFOLIO_FIELDS), freelancer: req.user._id });
  res.status(201).json({ success: true, project });
});

// PUT /api/portfolio/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await PortfolioProject.findOne({ _id: req.params.id, freelancer: req.user._id });
  if (!project) throw new ApiError(404, "Portfolio project not found");
  project.set(pick(req.body, PORTFOLIO_FIELDS));
  await project.save();
  res.json({ success: true, project });
});

// DELETE /api/portfolio/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await PortfolioProject.findOneAndDelete({ _id: req.params.id, freelancer: req.user._id });
  if (!project) throw new ApiError(404, "Portfolio project not found");
  res.json({ success: true, message: "Project deleted" });
});