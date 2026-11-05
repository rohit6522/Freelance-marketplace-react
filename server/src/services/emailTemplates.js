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