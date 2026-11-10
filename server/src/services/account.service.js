import crypto from "crypto";
import { User, FreelancerProfile, PortfolioProject, Gig, Order, Favorite } from "../models/index.js";
import { runInTransaction } from "../utils/transaction.js";
import { ownedPublicIds } from "../utils/assets.js";

export const ACTIVE_ORDER_STATUSES = ["pending", "in_progress", "delivered", "revision_requested"];

export const countActiveOrders = (userId) =>
  Order.countDocuments({
    status: { $in: ACTIVE_ORDER_STATUSES },
    $or: [{ client: userId }, { freelancer: userId }],
  });

// Removes personal data and anonymises the account. Returns the Cloudinary public ids to delete afterwards.
export async function deleteAccountData(userId) {
  const gigs = await Gig.find({ freelancer: userId }).select("images").lean();
  const withOrders = new Set((await Order.distinct("gig", { gig: { $in: gigs.map((g) => g._id) } })).map(String));
  const deletable = gigs.filter((g) => !withOrders.has(String(g._id)));
  const deletableIds = deletable.map((g) => g._id);
  const projects = await PortfolioProject.find({ freelancer: userId }).select("images").lean();

  const assets = [
    ...deletable.flatMap((g) => ownedPublicIds(g.images, userId)),
    ...projects.flatMap((p) => ownedPublicIds(p.images, userId)),
  ];

  await runInTransaction(async (session) => {
    await Favorite.deleteMany({ $or: [{ user: userId }, { gig: { $in: deletableIds } }] }, { session });
    await Gig.deleteMany({ _id: { $in: deletableIds } }, { session });
    // Gigs that have orders must stay (order history points at them), but they are hidden from the marketplace
    await Gig.updateMany({ freelancer: userId, _id: { $nin: deletableIds } }, { status: "paused" }, { session });
    await PortfolioProject.deleteMany({ freelancer: userId }, { session });
    await FreelancerProfile.deleteMany({ user: userId }, { session });

    const user = await User.findById(userId).select("+password").session(session);
    if (user.avatar?.publicId) assets.push(user.avatar.publicId);

    user.firstName = "Deleted";
    user.lastName = "User";
    user.email = `deleted-${user._id}@deleted.invalid`; // frees the real email for a new registration
    user.password = crypto.randomBytes(32).toString("hex"); // hashed on save; nobody knows it
    user.companyName = undefined;
    user.domainFocus = undefined;
    user.avatar = undefined;
    user.marketingOptIn = false;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save({ session });
  });

  return assets;
}