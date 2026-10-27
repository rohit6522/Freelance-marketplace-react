import mongoose from "mongoose";

const portfolioProjectSchema = new mongoose.Schema(
  {
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 2000 },
    industry: { type: String, trim: true, maxlength: 60 },
    metric: { type: String, trim: true, maxlength: 100 },
    durationWeeks: { type: Number, min: 1, max: 520 },
    deliverables: [{ type: String, trim: true, maxlength: 80 }],
    images: [{ url: { type: String, required: true }, publicId: String }],
    externalLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, "External link must start with http:// or https://"],
    },
  },
  { timestamps: true }
);

export const PortfolioProject = mongoose.model("PortfolioProject", portfolioProjectSchema);