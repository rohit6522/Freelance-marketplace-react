import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true }, // one review per order
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      validate: { validator: Number.isInteger, message: "Rating must be a whole number" },
    },
    comment: { type: String, required: [true, "Written feedback is required"], trim: true, maxlength: 1500 },
    reply: { text: { type: String, trim: true, maxlength: 1000 }, at: Date }, // seller response
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, trim: true, maxlength: 300 },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ gig: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);