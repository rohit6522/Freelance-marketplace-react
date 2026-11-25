import mongoose from "mongoose";

const customOfferSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 1 },
    deliveryDays: { type: Number, required: true, min: 1 },
    revisions: { type: Number, default: 1, min: 0 },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { _id: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: {
      type: String,
      trim: true,
      maxlength: 3000,
      required: function () {
        return !this.customOffer;
      },
    },
    attachments: [{ url: String, name: String, size: Number, publicId: String, _id: false }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    customOffer: customOfferSchema,
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);