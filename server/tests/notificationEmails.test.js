import test from "node:test";
import assert from "node:assert/strict";
import { orderNotificationEmail, newMessageEmail } from "../src/services/emailTemplates.js";

test("Order notification email templates", async (t) => {
  await t.test("generates created order email for freelancer", () => {
    const email = orderNotificationEmail({
      recipientName: "Alice",
      orderNumber: "ORD-1234",
      gigTitle: "Custom React Dashboard",
      status: "created",
      price: 5000,
      orderUrl: "https://example.com/orders/o1",
    });

    assert.match(email.subject, /New order received \(#ORD-1234\)/);
    assert.match(email.html, /Alice/);
    assert.match(email.html, /Custom React Dashboard/);
    assert.match(email.html, /5,000/);
    assert.match(email.html, /https:\/\/example\.com\/orders\/o1/);
    assert.match(email.text, /View order: https:\/\/example\.com\/orders\/o1/);
  });

  await t.test("generates accepted order email for client", () => {
    const email = orderNotificationEmail({
      recipientName: "Bob",
      orderNumber: "ORD-5678",
      gigTitle: "Logo Design",
      status: "accepted",
      orderUrl: "https://example.com/orders/o2",
    });

    assert.match(email.subject, /Your order is in progress \(#ORD-5678\)/);
    assert.match(email.html, /Bob/);
    assert.match(email.html, /Work is now underway/);
  });

  await t.test("generates delivered order email for client", () => {
    const email = orderNotificationEmail({
      recipientName: "Bob",
      orderNumber: "ORD-5678",
      gigTitle: "Logo Design",
      status: "delivered",
      orderUrl: "https://example.com/orders/o2",
    });

    assert.match(email.subject, /Work delivered for order #ORD-5678/);
    assert.match(email.html, /submitted their delivery/);
  });

  await t.test("generates revision requested email with details for freelancer", () => {
    const email = orderNotificationEmail({
      recipientName: "Alice",
      orderNumber: "ORD-9999",
      gigTitle: "SEO Optimization",
      status: "revision_requested",
      actionDetails: "Please change the header font",
      orderUrl: "https://example.com/orders/o3",
    });

    assert.match(email.subject, /Revision requested on order #ORD-9999/);
    assert.match(email.html, /Please change the header font/);
  });

  await t.test("generates cancelled order email with reason", () => {
    const email = orderNotificationEmail({
      recipientName: "Alice",
      orderNumber: "ORD-1111",
      gigTitle: "App UI",
      status: "cancelled",
      actionDetails: "Requirements changed",
      orderUrl: "https://example.com/orders/o4",
    });

    assert.match(email.subject, /Order #ORD-1111 cancelled/);
    assert.match(email.html, /Requirements changed/);
  });

  await t.test("properly escapes HTML to prevent XSS injection in emails", () => {
    const email = orderNotificationEmail({
      recipientName: "<script>alert(1)</script>",
      orderNumber: "ORD-XSS",
      gigTitle: "<b>Bold</b> & dangerous",
      status: "created",
      orderUrl: "https://example.com/orders/xss",
    });

    assert.doesNotMatch(email.html, /<script>/);
    assert.match(email.html, /&lt;script&gt;/);
    assert.match(email.html, /&lt;b&gt;Bold&lt;\/b&gt; &amp; dangerous/);
  });
});

test("Message notification email templates", async (t) => {
  await t.test("generates new message notification email with snippet", () => {
    const email = newMessageEmail({
      recipientName: "Charlie",
      senderName: "Diana",
      messageSnippet: "Hey, can we schedule a quick call?",
      conversationUrl: "https://example.com/messages",
    });

    assert.match(email.subject, /New message from Diana on GigCraft/);
    assert.match(email.html, /Charlie/);
    assert.match(email.html, /Diana/);
    assert.match(email.html, /Hey, can we schedule a quick call\?/);
    assert.match(email.html, /https:\/\/example\.com\/messages/);
    assert.match(email.text, /Diana sent you a message on GigCraft/);
  });
});
