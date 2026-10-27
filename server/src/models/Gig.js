import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Package title is required"], trim: true, maxlength: 80 },
    description: { type: String, required: [true, "Package description is required"], trim: true, maxlength: 500 },
    price: { type: Number, required: [true, "Package price is required"], min: [5, "Minimum price is $5"] },
    deliveryDays: { type: Number, required: true, min: 1, max: 180 },
    revisions: { type: Number, required: true, min: -1, default: 1 }, // -1 = unlimited
    features: [{ type: String, trim: true, maxlength: 120 }],
  },
  { _id: false }
);

const gigSchema = new mongoose.Schema(
  {
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true, minlength: 15, maxlength: 120 },
    description: { type: String, required: [true, "Description is required"], trim: true, minlength: 50, maxlength: 5000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: [(v) => v.length <= 5, "A maximum of 5 tags is allowed"],
    },
    images: {
      type: [{ url: { type: String, required: true }, publicId: String }],
      validate: [(v) => v.length <= 5, "A maximum of 5 images is allowed"],
    },
    packages: {
      basic: { type: packageSchema, required: true },
      standard: { type: packageSchema, required: true },
      premium: { type: packageSchema, required: true },
    },
    status: { type: String, enum: ["draft", "published", "paused"], default: "draft" },

    // Derived fields so we can sort/filter on the server (set automatically, never from client)
    startingPrice: { type: Number, index: true },
    minDeliveryDays: { type: Number },

    // Derived stats, recalculated by rating.service.js
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedOrders: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

gigSchema.pre("validate", async function () {
  const { basic, standard, premium } = this.packages || {};
  const tiers = [basic, standard, premium].filter(Boolean);
  if (tiers.length) {
    this.startingPrice = Math.min(...tiers.map((t) => t.price));
    this.minDeliveryDays = Math.min(...tiers.map((t) => t.deliveryDays));
  }
  if (this.status === "published" && (!this.images || this.images.length === 0)) {
    this.invalidate("images", "At least one image is required to publish a gig");
  }
});

gigSchema.index({ title: "text", description: "text", tags: "text" });
gigSchema.index({ status: 1, category: 1, startingPrice: 1 });
gigSchema.index({ status: 1, ratingAverage: -1 });
gigSchema.index({ freelancer: 1, status: 1 });

export const Gig = mongoose.model("Gig", gigSchema);