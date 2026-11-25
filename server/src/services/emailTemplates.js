const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const layout = (title, body) => `<!doctype html>
<html><body style="margin:0;background:#f8f9ff;font-family:Arial,Helvetica,sans-serif;color:#0b1c30;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #bdc9c1;">
<tr><td style="padding:20px 24px;border-bottom:1px solid #bdc9c1;font-size:20px;font-weight:bold;color:#005d42;letter-spacing:1px;">GIGCRAFT</td></tr>
<tr><td style="padding:24px;line-height:1.5;font-size:15px;"><h1 style="margin:0 0 16px;font-size:20px;">${title}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #bdc9c1;font-size:12px;color:#3e4943;">You received this email because of activity on your GigCraft account.</td></tr>
</table></td></tr></table></body></html>`;

export function passwordResetEmail({ name, url, minutes }) {
  return {
    subject: "Reset your GigCraft password",
    html: layout(
      "Reset your password",
      `<p>Hi ${esc(name)},</p>
       <p>We received a request to reset your password. This link works for ${minutes} minutes.</p>
       <p><a href="${esc(url)}" style="display:inline-block;background:#005d42;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold;">Reset password</a></p>
       <p style="font-size:13px;color:#3e4943;">If the button doesn't work, copy this link into your browser:<br>${esc(url)}</p>
       <p style="font-size:13px;color:#3e4943;">If you didn't ask for this, you can ignore this email. Your password stays the same.</p>`
    ),
    text: `Hi ${name},\n\nReset your GigCraft password (link valid for ${minutes} minutes):\n${url}\n\nIf you didn't ask for this, ignore this email.`,
  };
}

export function passwordChangedEmail({ name }) {
  return {
    subject: "Your GigCraft password was changed",
    html: layout(
      "Password changed",
      `<p>Hi ${esc(name)},</p>
       <p>Your password was just changed. If this was you, no action is needed.</p>
       <p>If it wasn't you, reset your password right away using "Forgot password" on the sign-in page.</p>`
    ),
    text: `Hi ${name},\n\nYour GigCraft password was just changed. If this wasn't you, reset it right away using "Forgot password" on the sign-in page.`,
  };
}

export function orderNotificationEmail({
  recipientName,
  orderNumber,
  gigTitle,
  status,
  price,
  actionDetails,
  orderUrl,
}) {
  let headline = "";
  let bodyContent = "";

  switch (status) {
    case "created":
      headline = `New order received (#${orderNumber})`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>Great news! You received a new order for <strong>${esc(gigTitle)}</strong> valued at <strong>₹${Number(price || 0).toLocaleString()}</strong>.</p>
        <p>Please review the order requirements and accept it to begin working.</p>`;
      break;
    case "accepted":
      headline = `Your order is in progress (#${orderNumber})`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>The freelancer has accepted your order for <strong>${esc(gigTitle)}</strong>. Work is now underway!</p>`;
      break;
    case "delivered":
      headline = `Work delivered for order #${orderNumber}`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>The freelancer has submitted their delivery for <strong>${esc(gigTitle)}</strong>.</p>
        <p>Please inspect the delivered work and either approve it to release funds or request a revision.</p>`;
      break;
    case "revision_requested":
      headline = `Revision requested on order #${orderNumber}`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>The client has requested a revision on <strong>${esc(gigTitle)}</strong>:</p>
        <blockquote style="margin:12px 0;padding:12px 16px;background:#f0f4f2;border-left:4px solid #005d42;font-style:italic;">
          ${esc(actionDetails || "Please check the order page for details.")}
        </blockquote>`;
      break;
    case "completed":
      headline = `Order #${orderNumber} completed!`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>The client approved your delivery for <strong>${esc(gigTitle)}</strong>! Escrow funds have been successfully released.</p>`;
      break;
    case "cancelled":
      headline = `Order #${orderNumber} cancelled`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p>
        <p>Order #${orderNumber} for <strong>${esc(gigTitle)}</strong> was cancelled.</p>
        ${actionDetails ? `<p><strong>Reason:</strong> ${esc(actionDetails)}</p>` : ""}`;
      break;
    default:
      headline = `Update on order #${orderNumber}`;
      bodyContent = `<p>Hi ${esc(recipientName)},</p><p>There is an update on order #${orderNumber} for <strong>${esc(gigTitle)}</strong>.</p>`;
  }

  const html = layout(
    headline,
    `${bodyContent}
     <p style="margin-top:24px;">
       <a href="${esc(orderUrl)}" style="display:inline-block;background:#005d42;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold;">View Order Details</a>
     </p>`
  );

  const text = `Hi ${recipientName},\n\n${headline}\nGig: ${gigTitle}\nView order: ${orderUrl}`;

  return {
    subject: `GigCraft: ${headline}`,
    html,
    text,
  };
}

export function newMessageEmail({ recipientName, senderName, messageSnippet, conversationUrl }) {
  return {
    subject: `New message from ${senderName} on GigCraft`,
    html: layout(
      `New message from ${esc(senderName)}`,
      `<p>Hi ${esc(recipientName)},</p>
       <p><strong>${esc(senderName)}</strong> sent you a message:</p>
       <blockquote style="margin:12px 0;padding:12px 16px;background:#f0f4f2;border-left:4px solid #005d42;font-style:italic;">
         ${esc(messageSnippet)}
       </blockquote>
       <p style="margin-top:24px;">
         <a href="${esc(conversationUrl)}" style="display:inline-block;background:#005d42;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold;">Reply on GigCraft</a>
       </p>`
    ),
    text: `Hi ${recipientName},\n\n${senderName} sent you a message on GigCraft:\n"${messageSnippet}"\n\nReply here:\n${conversationUrl}`,
  };
}
