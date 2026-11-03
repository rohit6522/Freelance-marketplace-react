import { User, FreelancerProfile, PortfolioProject } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { uploadBuffer, deleteAsset } from "../services/upload.service.js";
import { assertOwnedImages, ownedPublicIds } from "../utils/assets.js";

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
  const data = pick(req.body, ["firstName", "lastName", "companyName", "domainFocus", "phone"]);
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
  const data = pick(req.body, PORTFOLIO_FIELDS);
  assertOwnedImages(data.images, req.user._id);
  const project = await PortfolioProject.create({ ...data, freelancer: req.user._id });
  res.status(201).json({ success: true, project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await PortfolioProject.findOne({ _id: req.params.id, freelancer: req.user._id });
  if (!project) throw new ApiError(404, "Portfolio project not found");

  const data = pick(req.body, PORTFOLIO_FIELDS);
  assertOwnedImages(data.images, req.user._id);
  const before = ownedPublicIds(project.images, req.user._id);
  project.set(data);
  await project.save();

  const keep = new Set(ownedPublicIds(project.images, req.user._id));
  await Promise.all(before.filter((id) => !keep.has(id)).map((id) => deleteAsset(id)));
  res.json({ success: true, project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await PortfolioProject.findOneAndDelete({ _id: req.params.id, freelancer: req.user._id });
  if (!project) throw new ApiError(404, "Portfolio project not found");
  await Promise.all(ownedPublicIds(project.images, req.user._id).map((id) => deleteAsset(id)));
  res.json({ success: true, message: "Project deleted" });
});

// POST /api/profile/avatar   (multipart field: image)
export const updateAvatar = asyncHandler(async (req, res) => {
  const result = await uploadBuffer(req.file.buffer, {
    folder: "avatars",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "auto" }],
  });
  const oldPublicId = req.user.avatar?.publicId;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url: result.secure_url, publicId: result.public_id } },
    { new: true }
  );
  await deleteAsset(oldPublicId); // remove the previous avatar from Cloudinary
  res.json({ success: true, user });
});