import { User, Gig } from "../models/index.js";
import { env } from "../config/env.js";
import { sendEmail } from "./email.service.js";
import { orderNotificationEmail, newMessageEmail } from "./emailTemplates.js";

/**
 * Asynchronously notify participants about an order status change via email.
 */
export async function notifyOrderNotification(order, status, actionDetails = null) {
  try {
    if (!order) return;

    // Load full client, freelancer, and gig details
    const [client, freelancer, gig] = await Promise.all([
      User.findById(order.client).select("firstName email emailNotifications").lean(),
      User.findById(order.freelancer).select("firstName email emailNotifications").lean(),
      Gig.findById(order.gig).select("title").lean(),
    ]);

    const gigTitle = gig?.title || order.packageSnapshot?.name || "Custom Order";
    const orderUrl = `${env.clientUrl}/orders/${order._id}`;
    const price = order.packageSnapshot?.price || 0;

    // Determine target recipient based on event
    let target = null;
    if (status === "created" || status === "revision_requested" || status === "completed") {
      target = freelancer;
    } else if (status === "accepted" || status === "delivered") {
      target = client;
    } else if (status === "cancelled") {
      // For cancellation, notify both participants if available
      const recipients = [client, freelancer].filter(
        (u) => u && u.email && u.emailNotifications !== false
      );
      for (const recipient of recipients) {
        sendEmail({
          to: recipient.email,
          ...orderNotificationEmail({
            recipientName: recipient.firstName,
            orderNumber: order.orderNumber,
            gigTitle,
            status,
            price,
            actionDetails,
            orderUrl,
          }),
        }).catch((err) => console.warn("[notification] Order cancel email error:", err.message));
      }
      return;
    }

    if (target && target.email && target.emailNotifications !== false) {
      await sendEmail({
        to: target.email,
        ...orderNotificationEmail({
          recipientName: target.firstName,
          orderNumber: order.orderNumber,
          gigTitle,
          status,
          price,
          actionDetails,
          orderUrl,
        }),
      });
    }
  } catch (err) {
    console.warn("[notification] Order notification error:", err.message);
  }
}

/**
 * Asynchronously notify the recipient about a new direct chat message via email.
 */
export async function notifyMessageNotification({ conversation, sender, text }) {
  try {
    if (!conversation || !sender) return;
    const recipientId = conversation.participants.find((p) => String(p._id || p) !== String(sender._id || sender));
    if (!recipientId) return;

    const recipient = await User.findById(recipientId).select("firstName email emailNotifications").lean();
    if (recipient && recipient.email && recipient.emailNotifications !== false) {
      await sendEmail({
        to: recipient.email,
        ...newMessageEmail({
          recipientName: recipient.firstName,
          senderName: sender.firstName || "A GigCraft member",
          messageSnippet: (text || "Sent an attachment").slice(0, 200),
          conversationUrl: `${env.clientUrl}/messages`,
        }),
      });
    }
  } catch (err) {
    console.warn("[notification] Message notification error:", err.message);
  }
}
