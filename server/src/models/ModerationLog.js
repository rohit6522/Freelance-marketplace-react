import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["review_hidden", "review_unhidden", "reports_dismissed", "user_suspended", "user_reactivated"],
      required: true,
    },
    targetType: { type: String, enum: ["review", "user"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

moderationLogSchema.index({ createdAt: -1 });

export const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);