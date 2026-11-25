import { Conversation, Message, Gig, Order, User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { getConversationForUser, sendMessage, markRead, unreadCounts } from "../services/messaging.service.js";
import { notifyMessagesRead, notifyOrderUpdated } from "../realtime/socket.js";
import { notifyMessageNotification, notifyOrderNotification } from "../services/notification.service.js";
import { createSimulatedPayment } from "../services/payment.service.js";
import { runInTransaction } from "../utils/transaction.js";

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
// GET /api/conversations/:id/messages?before=<messageId>&limit=30  (oldest -> newest)
export const listMessages = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  await convo.populate("participants", PERSON);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const filter = { conversation: convo._id };
  if (req.query.before) filter._id = { $lt: req.query.before };

  const rows = await Message.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit).reverse();

  // If the other person turned read status off, never reveal when they read my messages (old reads included)
  const other = convo.participants.find((p) => String(p._id) !== String(req.user._id));
  const otherSettings = other ? await User.findById(other._id).select("shareMessageStatus").lean() : null;
  const messages =
    otherSettings?.shareMessageStatus === false
      ? page.map((m) =>
          String(m.sender) === String(req.user._id)
            ? { ...m, readBy: (m.readBy || []).filter((id) => String(id) !== String(other._id)) }
            : m
        )
      : page;

  res.json({ success: true, conversation: convo, messages, hasMore });
});

// POST /api/conversations/:id/messages
export const postMessage = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const otherId = convo.participants.find((p) => String(p) !== String(req.user._id));
  const other = await User.findById(otherId).select("isActive");
  if (!other?.isActive) throw new ApiError(409, "This person's account is no longer active, so you can't send them messages.");
  const message = await sendMessage({
    conversation: convo,
    senderId: req.user._id,
    text: req.body.text,
    attachments: (req.body.attachments || []).map((f) => pick(f, ["url", "name", "size", "publicId"])),
  });
  notifyMessageNotification({ conversation: convo, sender: req.user, text: req.body.text }).catch(() => {});
  res.status(201).json({ success: true, message });
});

// POST /api/conversations/:id/read
export const readConversation = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const updated = await markRead(convo._id, req.user._id);

  // Tell the sender their messages were read, unless the reader turned read status off
  if (updated > 0 && req.user.shareMessageStatus !== false) {
    const latest = await Message.findOne({ conversation: convo._id, sender: { $ne: req.user._id } })
      .sort({ _id: -1 })
      .select("_id")
      .lean();
    const other = convo.participants.find((p) => String(p) !== String(req.user._id));
    if (latest && other) {
      notifyMessagesRead({ conversationId: convo._id, readerId: req.user._id, to: other, upTo: latest._id });
    }
  }

  res.json({ success: true, marked: updated });
});

// POST /api/conversations/:id/custom-offer  (freelancer sends custom offer)
export const createCustomOffer = asyncHandler(async (req, res) => {
  const { gigId, title, description, price, deliveryDays, revisions } = req.body;
  const convo = await getConversationForUser(req.params.id, req.user._id);

  const otherId = convo.participants.find((p) => String(p) !== String(req.user._id));
  const other = await User.findById(otherId).select("isActive firstName email emailNotifications");
  if (!other?.isActive) throw new ApiError(409, "Recipient account is no longer active");

  const message = await Message.create({
    conversation: convo._id,
    sender: req.user._id,
    text: `Custom Offer: ${title} (₹${Number(price).toLocaleString()})`,
    readBy: [req.user._id],
    customOffer: {
      gig: gigId || convo.gig || undefined,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      deliveryDays: Number(deliveryDays),
      revisions: Number(revisions) ?? 1,
      status: "pending",
    },
  });

  convo.lastMessage = {
    text: `[Custom Offer] ${title} - ₹${Number(price).toLocaleString()}`,
    sender: req.user._id,
    at: message.createdAt,
  };
  await convo.save();

  notifyMessageNotification({
    conversation: convo,
    sender: req.user,
    text: `Custom Offer: ${title} (₹${price})`,
  }).catch(() => {});

  res.status(201).json({ success: true, message });
});

// POST /api/conversations/:id/messages/:messageId/accept-offer  (client accepts custom offer)
export const acceptCustomOffer = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const message = await Message.findOne({ _id: req.params.messageId, conversation: convo._id });
  if (!message || !message.customOffer) throw new ApiError(404, "Custom offer not found");
  if (message.customOffer.status !== "pending") throw new ApiError(409, `This offer is already ${message.customOffer.status}`);
  if (String(message.sender) === String(req.user._id)) throw new ApiError(400, "You cannot accept your own offer");

  const offer = message.customOffer;
  let gig = offer.gig ? await Gig.findById(offer.gig) : null;
  if (!gig) {
    gig = convo.gig ? await Gig.findById(convo.gig) : await Gig.findOne({ freelancer: message.sender, status: "published" });
  }

  const created = await runInTransaction(async (session) => {
    const order = new Order({
      gig: gig?._id || offer.gig,
      client: req.user._id,
      freelancer: message.sender,
      packageTier: "basic",
      isCustomOffer: true,
      packageSnapshot: {
        title: offer.title,
        price: offer.price,
        deliveryDays: offer.deliveryDays,
        revisions: offer.revisions,
        features: [offer.description],
      },
      price: offer.price,
      requirements: offer.description,
      status: "in_progress", // custom offers go directly in progress once accepted
      dueDate: new Date(Date.now() + offer.deliveryDays * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: "pending", by: req.user._id, note: "Custom offer accepted" },
        { status: "in_progress", by: message.sender, note: "Order automatically started upon acceptance" },
      ],
    });
    await order.save({ session });
    const payment = await createSimulatedPayment({ order, session });

    message.customOffer.status = "accepted";
    message.customOffer.order = order._id;
    await message.save({ session });

    return { order, payment };
  });

  notifyOrderUpdated(created.order);
  notifyOrderNotification(created.order, "created").catch(() => {});

  res.json({ success: true, order: created.order, message });
});

// POST /api/conversations/:id/messages/:messageId/decline-offer  (client declines custom offer)
export const declineCustomOffer = asyncHandler(async (req, res) => {
  const convo = await getConversationForUser(req.params.id, req.user._id);
  const message = await Message.findOne({ _id: req.params.messageId, conversation: convo._id });
  if (!message || !message.customOffer) throw new ApiError(404, "Custom offer not found");
  if (message.customOffer.status !== "pending") throw new ApiError(409, `This offer is already ${message.customOffer.status}`);
  if (String(message.sender) === String(req.user._id)) throw new ApiError(400, "You cannot decline your own offer");

  message.customOffer.status = "declined";
  await message.save();

  res.json({ success: true, message });
});