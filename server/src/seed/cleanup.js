import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

import {
  User, FreelancerProfile, PortfolioProject, Gig, Order, Payment, Review, Favorite, Conversation, Message,ModerationLog
} from "../models/index.js";

import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";
import { ensureCategories } from "./categories.js";

const mode = (process.argv.find((a) => a.startsWith("--mode=")) || "").split("=")[1];
if (!["demo", "all"].includes(mode)) {
  console.error("Usage: node src/seed/cleanup.js --mode=demo|all");
  process.exit(1);
}

await connectDB();
const dbName = mongoose.connection.name;
const [users, gigs, orders] = await Promise.all([User.countDocuments(), Gig.countDocuments(), Order.countDocuments()]);

console.log(`\nCluster:  ${mongoose.connection.host}\nDatabase: ${dbName}\nContains: ${users} users, ${gigs} gigs, ${orders} orders`);
console.log(
  mode === "all"
    ? "\nMODE ALL: deletes EVERY user and all their data, then restores the 8 categories."
    : "\nMODE DEMO: deletes only demo accounts (@gigcraft.test and smoke_*@example.com) and everything linked to them. Real users stay."
);

const rl = readline.createInterface({ input, output });
const answer = await rl.question(`\nType the database name (${dbName}) to confirm: `);
rl.close();
if (answer.trim() !== dbName) {
  console.log("Name did not match. Nothing was changed.");
  await mongoose.disconnect();
  process.exit(0);
}

if (mode === "all") {
  await Promise.all(
    [
      User,
      FreelancerProfile,
      PortfolioProject,
      Gig,
      Order,
      Payment,
      Review,
      Favorite,
      Conversation,
      Message,
      ModerationLog,
    ].map((M) => M.deleteMany({}))
  );
  await ensureCategories();
  console.log("\nDone. Everything removed and the 8 categories restored.");
} else {
  const demo = await User.find({ email: { $regex: /(@gigcraft\.test$|^smoke_\d+@example\.com$)/i } }).select("_id");
  const uids = demo.map((u) => u._id);

  if (!uids.length) {
    console.log("\nNo demo accounts found. Nothing to remove.");
  } else {
    const gigIds = await Gig.distinct("_id", { freelancer: { $in: uids } });
    const orderIds = await Order.distinct("_id", {
      $or: [{ client: { $in: uids } }, { freelancer: { $in: uids } }, { gig: { $in: gigIds } }],
    });
    const reviewFilter = {
      $or: [{ client: { $in: uids } }, { freelancer: { $in: uids } }, { order: { $in: orderIds } }, { gig: { $in: gigIds } }],
    };
    const convoIds = await Conversation.distinct("_id", {
      $or: [{ participants: { $in: uids } }, { order: { $in: orderIds } }, { gig: { $in: gigIds } }],
    });

    // Real gigs/sellers whose rating or order counts will change once this data is gone
    const [badReviews, badOrders] = await Promise.all([
      Review.find(reviewFilter).select("gig freelancer").lean(),
      Order.find({ _id: { $in: orderIds } }).select("gig freelancer").lean(),
    ]);
    const demoGigs = new Set(gigIds.map(String));
    const demoUsers = new Set(uids.map(String));
    const affectedGigs = new Set();
    const affectedSellers = new Set();
    [...badReviews, ...badOrders].forEach((x) => {
      if (!demoGigs.has(String(x.gig))) affectedGigs.add(String(x.gig));
      if (!demoUsers.has(String(x.freelancer))) affectedSellers.add(String(x.freelancer));
    });

    await Message.deleteMany({ conversation: { $in: convoIds } });
    await Conversation.deleteMany({ _id: { $in: convoIds } });
    await Payment.deleteMany({ $or: [{ order: { $in: orderIds } }, { payer: { $in: uids } }, { payee: { $in: uids } }] });
    await Review.deleteMany(reviewFilter);
    await Favorite.deleteMany({ $or: [{ user: { $in: uids } }, { gig: { $in: gigIds } }] });
    await Order.deleteMany({ _id: { $in: orderIds } });
    await PortfolioProject.deleteMany({ freelancer: { $in: uids } });
    await FreelancerProfile.deleteMany({ user: { $in: uids } });
    await Gig.deleteMany({ _id: { $in: gigIds } });
    await ModerationLog.deleteMany({ admin: { $in: uids } });
    await User.deleteMany({ _id: { $in: uids } });

    for (const id of affectedGigs) await recalcGigStats(id);
    for (const id of affectedSellers) await recalcFreelancerStats(id);
    await ensureCategories();

    console.log(`\nDone. Removed ${uids.length} demo accounts, ${gigIds.length} gigs, ${orderIds.length} orders. Real users were kept.`);
  }
}

await mongoose.disconnect();