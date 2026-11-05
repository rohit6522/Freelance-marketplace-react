import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { COOKIE_NAME } from "../utils/token.js";
import { messageEvents } from "../services/messaging.service.js";

let io = null;
const room = (userId) => `user:${userId}`; // one private room per user

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
    maxHttpBufferSize: 1e4, // clients never send data, so keep this tiny
    connectTimeout: 10000,
  });

  // Same checks as the REST `protect` middleware, using the httpOnly cookie
  io.use(async (socket, next) => {
    try {
      const token = cookie.parse(socket.handshake.headers.cookie || "")[COOKIE_NAME];
      if (!token) return next(new Error("unauthorized"));
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id).select("+passwordChangedAt");
      if (!user || !user.isActive) return next(new Error("unauthorized"));
      if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
        return next(new Error("unauthorized"));
      }
      socket.data.userId = String(user._id);
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(room(socket.data.userId)); // no client events are handled on purpose
  });

  // messaging.service already emits this event for every saved message
  messageEvents.on("message:created", ({ message, conversation }) => {
    const payload = { conversationId: String(conversation._id), message: message.toJSON() };
    conversation.participants.forEach((p) => io.to(room(p)).emit("message:new", payload));
  });

  return io;
}

// Tells both parties that an order changed (the page then reloads it through the normal REST API)
export function notifyOrderUpdated(order) {
  if (!io) return;
  io.to(room(order.client)).to(room(order.freelancer)).emit("order:updated", {
    orderId: String(order._id),
    status: order.status,
  });
}

// Existing sockets were authenticated with the old password, so drop them when it changes
export function disconnectUser(userId) {
  io?.in(room(userId)).disconnectSockets(true);
}