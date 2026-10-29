import { Conversation, Message, Gig, Order, User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { getConversationForUser, sendMessage, markRead, unreadCounts } from "../services/messaging.service.js";

const PERSON = "firstName lastName avatar role companyName";

// POST /api/conversations   { orderId } | { gigId } | { freelancerId }
export const startConversation = asyncHandler(async (req, res) => {
  const me = req.user;
  const { orderId, gigId, freelancerId } = req.body;
  let other, gig, order;

  if (orderId) {
    order = await Order.findById(orderId);
    const mine = order && (String(order.client) === String(me._id) || String(order.freelancer) === String(me._id));
    if (!mine) throw new ApiError(404, "Order not found");
    other = String(order.client) === String(me._id) ? order.freelancer : order.client;
    gig = order.gig;
  } else {
    if (me.role !== "client") {
      throw new ApiError(403, "Only clients can start a conversation with a seller. Sellers reply from their inbox or orders.");
    }
    if (gigId) {
      const g = await Gig.findOne({ _id: gigId, status: "published" }).select("freelancer");
      if (!g) throw new ApiError(404, "Gig not found");
      other = g.freelancer;
      gig = g._id;
    } else {
      const seller = await User.findOne({ _id: freelancerId, role: "freelancer", isActive: true }).select("_id");
      if (!seller) throw new ApiError(404, "Freelancer not found");
      other = seller._id;
    }
  }

  // One general conversation per pair, plus one per order
  let convo = await Conversation.findOne({
    participants: { $all: [me._id, other] },
    order: order ? order._id : null,
  });
  let created = false;
  if (!convo) {
    convo = await Conversation.create({ participants: [me._id, other], gig, order: order?._id });
    created = true;
  }
  await convo.populate("participants", PERSON);
  res.status(created ? 201 : 200).json({ success: true, conversation: convo });
});

// GET /api/conversations
export const listConversations = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [convos, total, unread] = await Promise.all([
    Conversation.find({ participants: me })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participants", PERSON)
      .populate("gig", "title")
      .populate("order", "orderNumber status")
      .lean(),
    Conversation.countDocuments({ participants: me }),
    unreadCounts(me),
  ]);

  const conversations = convos.map((c) => ({
    _id: c._id,
    other: c.participants.find((p) => String(p._id) !== String(me)),
    gig: c.gig,
    order: c.order,
    lastMessage: c.lastMessage,
    unreadCount: unread.byConversation.get(String(c._id)) || 0,
    updatedAt: c.updatedAt,
  }));

  res.json({
    success: true,
    conversations,
    unreadTotal: unread.total,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/conversations/unread-count   (navbar badge)
export const unreadCount = asyncHandler(async (req, res) => {
  const { total } = await unreadCounts(req.user._id);
  res.json({ success: true, unread: total });
});

// GET /api/conversations/:id/messages?before=<messageId>&limit=30  (oldest -> newest)
export const listMessages = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  await convo.populate("participants", PERSON);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const filter = { conversation: convo._id };
  if (req.query.before) filter._id = { $lt: req.query.before };

  const rows = await Message.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = rows.length > limit;
  const messages = rows.slice(0, limit).reverse();

  res.json({ success: true, conversation: convo, messages, hasMore });
});

// POST /api/conversations/:id/messages
export const postMessage = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const message = await sendMessage({
    conversation: convo,
    senderId: req.user._id,
    text: req.body.text,
    attachments: (req.body.attachments || []).map((f) => pick(f, ["url", "name", "size", "publicId"])),
  });
  res.status(201).json({ success: true, message });
});

// POST /api/conversations/:id/read
export const readConversation = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const updated = await markRead(convo._id, req.user._id);
  res.json({ success: true, marked: updated });
});