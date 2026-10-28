import crypto from "crypto";
import { Payment } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";

// Simulated checkout: money is "held in escrow". No real transaction happens.
export async function createSimulatedPayment({ order, session }) {
  const payment = new Payment({
    order: order._id,
    payer: order.client,
    payee: order.freelancer,
    amount: order.price,
    status: "held",
    provider: "simulated",
    isSimulated: true,
    transactionRef: `SIM-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
  });
  await payment.save({ session });
  return payment;
}

const moveHeldPayment = async (orderId, status, session, extra = {}) => {
  const payment = await Payment.findOneAndUpdate(
    { order: orderId, status: "held" },
    { status, ...extra },
    { new: true, session }
  );
  if (!payment) throw new ApiError(409, "No held payment found for this order");
  return payment;
};

export const releasePayment = (orderId, session) =>
  moveHeldPayment(orderId, "released", session, { releasedAt: new Date() });

export const refundPayment = (orderId, session) =>
  moveHeldPayment(orderId, "refunded", session);