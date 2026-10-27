import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ["basic", "conversational", "fluent", "native"], default: "conversational" },
  },
  { _id: false }
);

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null }, // null = present
  },
  { _id: false }
);

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    title: { type: String, trim: true, maxlength: 100 },
    bio: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 100 },
    skills: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      validate: [(v) => v.length <= 30, "A maximum of 30 skills is allowed"],
    },
    languages: [languageSchema],
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    hourlyRate: { type: Number, min: 0 },
    sellerLevel: { type: String, enum: ["rising", "level2", "pro", "top_rated"], default: "rising" },
    workHistory: [workSchema],
    // Derived stats, recalculated from real reviews/orders by rating.service.js
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedOrders: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

freelancerProfileSchema.index({ skills: 1 });
freelancerProfileSchema.index({ experienceYears: 1 });

export const FreelancerProfile = mongoose.model("FreelancerProfile", freelancerProfileSchema);