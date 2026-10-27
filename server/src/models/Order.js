import mongoose from "mongoose";
import crypto from "crypto";

export const ORDER_STATUSES = [
  "pending",
  "in_progress",
  "delivered",
  "revision_requested",
  "completed",
  "cancelled",
];

const { Schema } = mongoose;

const fileSchema = new Schema(
  { url: { type: String, required: true }, name: String, size: Number, publicId: String },
  { _id: false }
);

const deliverySchema = new Schema({
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  files: [fileSchema],
  deliveredAt: { type: Date, default: Date.now },
});

const historySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String, trim: true, maxlength: 500 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true }, // e.g. GC-9F2A1C
    gig: { type: Schema.Types.ObjectId, ref: "Gig", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packageTier: { type: String, enum: ["basic", "standard", "premium"], required: true },
    // Snapshot so later gig edits never change an existing order
    packageSnapshot: {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      deliveryDays: { type: Number, required: true },
      revisions: { type: Number, required: true },
      features: [String],
    },
    price: { type: Number, required: true, min: 0 }, // always set by the server
    requirements: { type: String, required: [true, "Project requirements are required"], trim: true, maxlength: 5000 },
    attachments: [fileSchema],
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    dueDate: Date,
    revisionsUsed: { type: Number, default: 0, min: 0 },
    deliveries: [deliverySchema],
    statusHistory: [historySchema],
    cancelReason: { type: String, trim: true, maxlength: 500 },
    completedAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre("validate", async function () {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `GC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }
});

orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ freelancer: 1, status: 1, createdAt: -1 });
orderSchema.index({ gig: 1, status: 1 });

export const Order = mongoose.model("Order", orderSchema);