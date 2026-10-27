import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [(v) => v.length === 2, "A conversation needs exactly 2 participants"],
    },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: Date,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ order: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);