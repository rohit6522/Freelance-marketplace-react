import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },
    // pending -> held (simulated escrow) -> released | refunded ; or failed
    status: { type: String, enum: ["pending", "held", "released", "refunded", "failed"], default: "pending" },
    provider: { type: String, default: "simulated" },
    isSimulated: { type: Boolean, default: true }, // never a real transaction
    transactionRef: { type: String, unique: true, sparse: true },
    releasedAt: Date,
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);