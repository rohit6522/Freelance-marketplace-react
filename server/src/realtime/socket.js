import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { env } from "../config/env.js";
import { User, Conversation } from "../models/index.js";
import { COOKIE_NAME } from "../utils/token.js";
import { messageEvents } from "../services/messaging.service.js";

// cookie 1.x calls it parse, cookie 2.x renamed it parseCookie. Accept both so a package upgrade can't break startup.
const parseCookies = cookie.parseCookie ?? cookie.parse;

let io = null;
const room = (userId) => `user:${userId}`; // one private room per user

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_EVENTS = 30; // typing sends about one event per 2.5 seconds, so 30 per 10 seconds is generous
const PARTNER_CACHE_MAX = 100;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
    maxHttpBufferSize: 1e4, // events are tiny, so refuse anything big
    connectTimeout: 10000,
  });

  // Same checks as the REST `protect` middleware, using the httpOnly cookie
  io.use(async (socket, next) => {
    try {
      const token = parseCookies(socket.handshake.headers.cookie || "")[COOKIE_NAME];
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
    const me = socket.data.userId;
    socket.join(room(me));

    // The only event a client may send is "typing". It is validated, rate limited, and only ever
    // forwarded to the other person in a conversation the sender really belongs to.
    const partners = new Map(); // conversationId -> the other participant (a fact that never changes)
    let windowStart = Date.now();
    let count = 0;

    socket.on("typing", async (payload) => {
      const now = Date.now();
      if (now - windowStart > RATE_WINDOW_MS) {
        windowStart = now;
        count = 0;
      }
      if (++count > RATE_MAX_EVENTS) return; // too many: ignore

      if (!payload || typeof payload !== "object") return;
      const { conversationId, typing } = payload;
      if (typeof conversationId !== "string" || !OBJECT_ID.test(conversationId) || typeof typing !== "boolean") return;

      try {
        let partner = partners.get(conversationId);
        if (!partner) {
          const convo = await Conversation.findOne({ _id: conversationId, participants: me }).select("participants").lean();
          if (!convo) return; // not your conversation
          partner = convo.participants.map(String).find((p) => p !== me);
          if (!partner) return;
          if (partners.size >= PARTNER_CACHE_MAX) partners.clear();
          partners.set(conversationId, partner);
        }
        // Read fresh each time so turning the setting off (or a suspension) takes effect immediately
        const sender = await User.findById(me).select("shareMessageStatus isActive").lean();
        if (!sender || !sender.isActive || sender.shareMessageStatus === false) return;

        io.to(room(partner)).emit("typing", { conversationId, userId: me, typing });
      } catch {
        /* a failed lookup just means no indicator */
      }
    });
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

// Tells the sender that the other person has now read their messages (only called when the reader shares read status)
export function notifyMessagesRead({ conversationId, readerId, to, upTo }) {
  if (!io) return;
  io.to(room(to)).emit("messages:read", {
    conversationId: String(conversationId),
    readerId: String(readerId),
    upTo: String(upTo),
  });
}

// Existing sockets were authenticated with the old password, so drop them when it changes
export function disconnectUser(userId) {
  io?.in(room(userId)).disconnectSockets(true);
}