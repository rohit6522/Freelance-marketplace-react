import { env } from "../config/env.js";

const API_URL = "https://api.brevo.com/v3/smtp/email";

export const isEmailConfigured = Boolean(env.email.apiKey && env.email.from);

// Returns true when the provider accepted the email. Never throws, so a mail failure can't break a request.
export async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured) {
    if (env.nodeEnv === "production") {
      console.warn(`[email] Not configured (BREVO_API_KEY / EMAIL_FROM missing). Not sent: "${subject}"`);
    } else {
      console.log(`\n[DEV email] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    }
    return false;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "api-key": env.email.apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: env.email.fromName, email: env.email.from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Provider responded ${res.status}: ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err.message);
    return false;
  }
}