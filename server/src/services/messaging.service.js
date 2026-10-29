import { EventEmitter } from "events";
import mongoose from "mongoose";
import { Conversation, Message } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";

// Socket.IO hook for later:  messageEvents.on("message:created", ({ message, conversation }) => io.to(...).emit(...))
export const messageEvents = new EventEmitter();

// Non-participants get a 404 so conversation ids can't be probed
export async function getConversationForUser(conversationId, userId) {
  const convo = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!convo) throw new ApiError(404, "Conversation not found");
  return convo;
}

export async function sendMessage({ conversation, senderId, text, attachments = [] }) {
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text,
    attachments,
    readBy: [senderId],
  });
  conversation.lastMessage = { text: text.slice(0, 200), sender: senderId, at: message.createdAt };
  await conversation.save(); // also bumps updatedAt so the list sorts by activity
  messageEvents.emit("message:created", { message, conversation });
  return message;
}

export async function markRead(conversationId, userId) {
  const res = await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
  return res.modifiedCount;
}

export async function unreadCounts(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const convos = await Conversation.find({ participants: uid }).select("_id").lean();
  const rows = await Message.aggregate([
    { $match: { conversation: { $in: convos.map((c) => c._id) }, readBy: { $ne: uid } } },
    { $group: { _id: "$conversation", n: { $sum: 1 } } },
  ]);
  const byConversation = new Map(rows.map((r) => [String(r._id), r.n]));
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  return { byConversation, total };
}