import assert from "node:assert/strict";

const BASE = process.env.API_URL || "http://localhost:5000/api";
const PASSWORD = "Password123!";

class Session {
  constructor() {
    this.cookie = "";
  }
  async call(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie?.() || []) {
      const pair = c.split(";")[0];
      if (pair.startsWith("token=")) this.cookie = pair === "token=" ? "" : pair;
    }
    let data = null;
    try { data = await res.json(); } catch { /* empty body */ }
    return { status: res.status, data };
  }
  get(p) { return this.call("GET", p); }
  post(p, b = {}) { return this.call("POST", p, b); }
  put(p, b) { return this.call("PUT", p, b); }
  patch(p, b) { return this.call("PATCH", p, b); }
  del(p) { return this.call("DELETE", p); }
}

let passed = 0;
let failed = 0;
async function step(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}\n      ${String(err.message).split("\n")[0]}`);
  }
}
const expectStatus = (r, status) =>
  assert.equal(r.status, status, `expected ${status}, got ${r.status} (${r.data?.message || "no message"})`);
const expectOneOf = (r, list) => assert.ok(list.includes(r.status), `expected one of ${list}, got ${r.status} (${r.data?.message || ""})`);

const anon = new Session();
const client = new Session();
const marcus = new Session();
const elena = new Session();
const fresh = new Session();
const ctx = {};

console.log(`\nGigCraft smoke test against ${BASE}\n`);

console.log("Public API");
await step("health check", async () => expectStatus(await anon.get("/health"), 200));
await step("categories: at least 8", async () => {
  const r = await anon.get("/categories");
  expectStatus(r, 200);
  assert.ok(r.data.categories.length >= 8);
  ctx.categoryId = r.data.categories[0]._id;
});
await step("gigs: pagination", async () => {
  const r = await anon.get("/gigs?limit=2&page=1");
  expectStatus(r, 200);
  assert.equal(r.data.gigs.length, 2);
  assert.ok(r.data.pagination.total >= 6);
});
await step("gigs: price filter + ascending sort", async () => {
  const r = await anon.get("/gigs?minPrice=100&maxPrice=300&sort=price_asc");
  expectStatus(r, 200);
  const prices = r.data.gigs.map((g) => g.startingPrice);
  assert.ok(prices.length > 0);
  assert.ok(prices.every((p) => p >= 100 && p <= 300));
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});
await step("gigs: keyword search", async () => {
  const r = await anon.get("/gigs?q=figma");
  expectStatus(r, 200);
  assert.ok(r.data.gigs.length >= 1);
});
await step("gigs: invalid filter is rejected (400)", async () => expectStatus(await anon.get("/gigs?minRating=9"), 400));
await step("find Marcus's gig and read its packages", async () => {
  const list = await anon.get("/gigs?limit=50");
  const gig = list.data.gigs.find((g) => g.seller.firstName === "Marcus");
  assert.ok(gig, "seed data missing: run `npm run seed` first");
  ctx.gigId = gig._id;
  ctx.marcusId = gig.seller._id;
  const detail = await anon.get(`/gigs/${gig._id}`);
  expectStatus(detail, 200);
  ctx.basicPrice = detail.data.gig.packages.basic.price;
  assert.ok(ctx.basicPrice > 0);
});

console.log("\nAuthentication and authorization");
await step("anonymous: /auth/me is 401", async () => expectStatus(await anon.get("/auth/me"), 401));
await step("anonymous: cannot place an order (401)", async () => expectStatus(await anon.post("/orders", {}), 401));
await step("anonymous: cannot upload (401)", async () => expectStatus(await anon.post("/uploads/image?purpose=gig", {}), 401));
await step("wrong password is rejected (401)", async () =>
  expectStatus(await anon.post("/auth/login", { email: "client@gigcraft.test", password: "wrong-password" }), 401));
await step("operator injection in login is rejected (400)", async () =>
  expectStatus(await anon.call("POST", "/auth/login", { email: { $ne: "" }, password: { $ne: "" } }), 400));
await step("client logs in with a cookie session", async () => {
  const r = await client.post("/auth/login", { email: "client@gigcraft.test", password: PASSWORD });
  expectStatus(r, 200);
  assert.equal(r.data.user.role, "client");
  assert.ok(client.cookie.startsWith("token="));
  assert.equal(r.data.user.password, undefined, "password must never be returned");
});
await step("/auth/me restores the session", async () => {
  const r = await client.get("/auth/me");
  expectStatus(r, 200);
  assert.equal(r.data.user.email, "client@gigcraft.test");
});
await step("client cannot create gigs (403)", async () => expectStatus(await client.post("/gigs", {}), 403));
await step("client cannot open the freelancer dashboard (403)", async () => expectStatus(await client.get("/dashboard/freelancer"), 403));
await step("register: invalid email (400)", async () =>
  expectStatus(await anon.post("/auth/register", { firstName: "A", lastName: "B", email: "nope", password: "Secret123", role: "client", acceptTerms: true }), 400));
await step("register: duplicate email (409)", async () =>
  expectStatus(await anon.post("/auth/register", { firstName: "A", lastName: "B", email: "client@gigcraft.test", password: "Secret123", role: "client", acceptTerms: true }), 409));
await step("register: new freelancer gets a session and a profile", async () => {
  const r = await fresh.post("/auth/register", {
    firstName: "Smoke", lastName: "Tester", email: `smoke_${Date.now()}@example.com`,
    password: "Secret123", role: "freelancer", acceptTerms: true,
  });
  expectStatus(r, 201);
  const me = await fresh.get("/profile/me");
  expectStatus(me, 200);
  assert.ok(me.data.profile, "freelancer profile should be created");
});

console.log("\nOrder lifecycle (client <-> Marcus, escrow simulated)");
await step("Marcus and Elena log in", async () => {
  expectStatus(await marcus.post("/auth/login", { email: "marcus@gigcraft.test", password: PASSWORD }), 200);
  expectStatus(await elena.post("/auth/login", { email: "elena@gigcraft.test", password: PASSWORD }), 200);
});
await step("checkout ignores a tampered price and status", async () => {
  const r = await client.post("/orders", {
    gigId: ctx.gigId, tier: "basic", price: 1, status: "completed",
    requirements: "Smoke test order: build a responsive landing page with a pricing section.",
  });
  expectStatus(r, 201);
  assert.equal(r.data.order.price, ctx.basicPrice);
  assert.equal(r.data.order.status, "pending");
  assert.equal(r.data.payment.status, "held");
  assert.equal(r.data.payment.isSimulated, true);
  ctx.orderId = r.data.order._id;
});
await step("invalid transition: complete while pending (409)", async () => expectStatus(await client.post(`/orders/${ctx.orderId}/complete`), 409));
await step("wrong role: the client cannot accept (403)", async () => expectStatus(await client.post(`/orders/${ctx.orderId}/accept`), 403));
await step("non-participants get 404 for the order", async () => expectStatus(await elena.get(`/orders/${ctx.orderId}`), 404));
await step("Marcus accepts: in_progress with a due date", async () => {
  const r = await marcus.post(`/orders/${ctx.orderId}/accept`);
  expectStatus(r, 200);
  assert.equal(r.data.order.status, "in_progress");
  assert.ok(r.data.order.dueDate);
});
await step("Marcus delivers", async () => {
  const r = await marcus.post(`/orders/${ctx.orderId}/deliver`, {
    message: "First delivery attached.", files: [{ url: "https://example.com/v1.zip", name: "v1.zip", size: 1024 }],
  });
  expectStatus(r, 200);
  assert.equal(r.data.order.status, "delivered");
});
await step("client requests a revision (uses one)", async () => {
  const r = await client.post(`/orders/${ctx.orderId}/revision`, { message: "Please adjust the hero spacing." });
  expectStatus(r, 200);
  assert.equal(r.data.order.status, "revision_requested");
  assert.equal(r.data.order.revisionsUsed, 1);
});
await step("Marcus re-delivers", async () => {
  const r = await marcus.post(`/orders/${ctx.orderId}/deliver`, { message: "Revised delivery attached." });
  expectStatus(r, 200);
  assert.equal(r.data.order.deliveries.length, 2);
});
await step("client approves: completed and escrow released", async () => {
  expectStatus(await client.post(`/orders/${ctx.orderId}/complete`), 200);
  const r = await client.get(`/orders/${ctx.orderId}`);
  assert.equal(r.data.order.status, "completed");
  assert.equal(r.data.payment.status, "released");
});
await step("Marcus's payment summary includes the payout", async () => {
  const r = await marcus.get("/payments/mine");
  expectStatus(r, 200);
  assert.ok(r.data.summary.released >= ctx.basicPrice);
  assert.equal(r.data.isSimulated, true);
});
await step("cancel flow: pending order is cancelled and refunded", async () => {
  const o = await client.post("/orders", { gigId: ctx.gigId, tier: "basic", requirements: "Second smoke test order to be cancelled shortly." });
  expectStatus(o, 201);
  const c = await client.post(`/orders/${o.data.order._id}/cancel`, { reason: "Changed my mind about scope." });
  expectStatus(c, 200);
  assert.equal(c.data.order.status, "cancelled");
  const detail = await client.get(`/orders/${o.data.order._id}`);
  assert.equal(detail.data.payment.status, "refunded");
});

console.log("\nReviews and ratings");
await step("rating out of range is rejected (400)", async () =>
  expectStatus(await client.post("/reviews", { orderId: ctx.orderId, rating: 9, comment: "Way too many stars here." }), 400));
await step("client reviews the completed order", async () => {
  const r = await client.post("/reviews", { orderId: ctx.orderId, rating: 4, comment: "Solid work and clear communication." });
  expectStatus(r, 201);
  ctx.reviewId = r.data.review._id;
});
await step("duplicate review is rejected (409)", async () =>
  expectStatus(await client.post("/reviews", { orderId: ctx.orderId, rating: 5, comment: "Trying to review twice again." }), 409));
await step("gig rating is calculated from stored reviews", async () => {
  const gig = await anon.get(`/gigs/${ctx.gigId}`);
  const reviews = await anon.get(`/reviews?gig=${ctx.gigId}`);
  expectStatus(reviews, 200);
  assert.equal(gig.data.gig.ratingCount, reviews.data.summary.count);
  assert.equal(gig.data.gig.ratingAverage, reviews.data.summary.average);
  assert.ok(reviews.data.summary.count >= 2);
});
await step("only the reviewed freelancer can reply", async () => {
  expectStatus(await client.post(`/reviews/${ctx.reviewId}/reply`, { text: "I should not be able to do this." }), 403);
  expectStatus(await elena.post(`/reviews/${ctx.reviewId}/reply`, { text: "Not my review either, so no." }), 403);
  const r = await marcus.post(`/reviews/${ctx.reviewId}/reply`, { text: "Thank you!" });
  expectStatus(r, 200);
  assert.equal(r.data.review.reply.text, "Thank you!");
});

console.log("\nMessaging");
await step("client opens the order conversation", async () => {
  const r = await client.post("/conversations", { orderId: ctx.orderId });
  expectOneOf(r, [200, 201]);
  ctx.convoId = r.data.conversation._id;
});
await step("empty message is rejected (400)", async () =>
  expectStatus(await client.post(`/conversations/${ctx.convoId}/messages`, { text: "" }), 400));
await step("client sends a message", async () =>
  expectStatus(await client.post(`/conversations/${ctx.convoId}/messages`, { text: "Hi Marcus, quick question about the files." }), 201));
await step("Marcus has unread messages; reading clears them", async () => {
  let r = await marcus.get("/conversations");
  expectStatus(r, 200);
  assert.ok(r.data.conversations.find((c) => c._id === ctx.convoId).unreadCount >= 1);
  expectStatus(await marcus.post(`/conversations/${ctx.convoId}/read`), 200);
  r = await marcus.get("/conversations");
  assert.equal(r.data.conversations.find((c) => c._id === ctx.convoId).unreadCount, 0);
});
await step("non-participants cannot read the conversation (404)", async () =>
  expectStatus(await elena.get(`/conversations/${ctx.convoId}/messages`), 404));

console.log("\nFavorites");
await step("save, list and remove a favorite", async () => {
  expectStatus(await client.post("/favorites", { gigId: ctx.gigId }), 200);
  expectStatus(await client.post("/favorites", { gigId: ctx.gigId }), 200); // idempotent
  let ids = await client.get("/favorites/ids");
  assert.ok(ids.data.ids.includes(ctx.gigId));
  expectStatus(await client.del(`/favorites/${ctx.gigId}`), 200);
  ids = await client.get("/favorites/ids");
  assert.ok(!ids.data.ids.includes(ctx.gigId));
});
await step("cannot favorite your own gig (400)", async () =>
  expectStatus(await marcus.post("/favorites", { gigId: ctx.gigId }), 400));

console.log("\nGig management (Marcus)");
const gigBody = {
  title: "I will run a smoke test gig lifecycle end to end",
  category: null,
  description: "This gig exists only to exercise the create, publish, pause and delete workflow of the GigCraft API.",
  tags: ["smoke"],
  images: [],
  packages: {
    basic: { title: "Basic", description: "Basic package", price: 50, deliveryDays: 2, revisions: 1, features: ["One thing"] },
    standard: { title: "Standard", description: "Standard package", price: 100, deliveryDays: 4, revisions: 2, features: ["Two things"] },
    premium: { title: "Premium", description: "Premium package", price: 200, deliveryDays: 7, revisions: -1, features: ["Three things"] },
  },
};
await step("create a draft gig", async () => {
  const r = await marcus.post("/gigs", { ...gigBody, category: ctx.categoryId });
  expectStatus(r, 201);
  assert.equal(r.data.gig.status, "draft");
  assert.equal(r.data.gig.startingPrice, 50);
  ctx.newGigId = r.data.gig._id;
});
await step("draft is hidden from the public (404)", async () => expectStatus(await anon.get(`/gigs/${ctx.newGigId}`), 404));
await step("publishing without images fails (400)", async () =>
  expectStatus(await marcus.patch(`/gigs/${ctx.newGigId}/status`, { status: "published" }), 400));
await step("add an image, then publish", async () => {
  expectStatus(await marcus.put(`/gigs/${ctx.newGigId}`, { ...gigBody, category: ctx.categoryId, images: [{ url: "https://placehold.co/800x500/png" }] }), 200);
  const r = await marcus.patch(`/gigs/${ctx.newGigId}/status`, { status: "published" });
  expectStatus(r, 200);
  assert.equal(r.data.gig.status, "published");
});
await step("published gig is listed in the marketplace", async () => {
  const r = await anon.get("/gigs?sort=newest&limit=50");
  assert.ok(r.data.gigs.some((g) => g._id === ctx.newGigId));
});
await step("another freelancer cannot edit it (403)", async () =>
  expectStatus(await elena.put(`/gigs/${ctx.newGigId}`, { ...gigBody, category: ctx.categoryId }), 403));
await step("pausing hides it", async () => {
  expectStatus(await marcus.patch(`/gigs/${ctx.newGigId}/status`, { status: "paused" }), 200);
  const r = await anon.get("/gigs?sort=newest&limit=50");
  assert.ok(!r.data.gigs.some((g) => g._id === ctx.newGigId));
  expectStatus(await anon.get(`/gigs/${ctx.newGigId}`), 404);
});
await step("a gig with orders cannot be deleted (409)", async () => expectStatus(await marcus.del(`/gigs/${ctx.gigId}`), 409));
await step("delete the test gig", async () => expectStatus(await marcus.del(`/gigs/${ctx.newGigId}`), 200));

console.log("\nDashboards");
await step("freelancer dashboard shows real earnings", async () => {
  const r = await marcus.get("/dashboard/freelancer");
  expectStatus(r, 200);
  assert.ok(r.data.stats.completedOrders >= 1);
  assert.ok(r.data.stats.earnings.released >= ctx.basicPrice);
  assert.equal(r.data.stats.earnings.monthly.length, 6);
});
await step("client dashboard shows real spend", async () => {
  const r = await client.get("/dashboard/client");
  expectStatus(r, 200);
  assert.ok(r.data.stats.totalSpent >= ctx.basicPrice);
});

console.log(`\n${failed === 0 ? "All checks passed" : "Some checks FAILED"}: ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);