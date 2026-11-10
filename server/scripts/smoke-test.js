
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
      headers: {
        ...(body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    for (const c of res.headers.getSetCookie?.() || []) {
      const pair = c.split(";")[0];
      if (pair.startsWith("token=")) {
        this.cookie = pair === "token=" ? "" : pair;
      }
    }

    let data = null;

    try {
      data = await res.json();
    } catch {
      // Empty response body
    }

    return { status: res.status, data };
  }

  get(p) {
    return this.call("GET", p);
  }

  post(p, b = {}) {
    return this.call("POST", p, b);
  }

  put(p, b) {
    return this.call("PUT", p, b);
  }

  patch(p, b) {
    return this.call("PATCH", p, b);
  }

  del(p) {
    return this.call("DELETE", p);
  }
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
  assert.equal(
    r.status,
    status,
    `expected ${status}, got ${r.status} (${r.data?.message || "no message"})`
  );

const expectOneOf = (r, list) =>
  assert.ok(
    list.includes(r.status),
    `expected one of ${list}, got ${r.status} (${r.data?.message || ""})`
  );

// Sessions
const anon = new Session();
const client = new Session();
const rahul = new Session();
const priya = new Session();
const fresh = new Session();
const admin = new Session();

const ctx = {};

console.log(`\nGigCraft smoke test against ${BASE}\n`);

// =====================================================
// PUBLIC API
// =====================================================

console.log("Public API");

await step("health check", async () => {
  expectStatus(await anon.get("/health"), 200);
});

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
  const r = await anon.get(
    "/gigs?minPrice=2000&maxPrice=10000&sort=price_asc"
  );

  expectStatus(r, 200);

  const prices = r.data.gigs.map((g) => g.startingPrice);

  assert.ok(prices.length > 0);
  assert.ok(prices.every((p) => p >= 2000 && p <= 10000));
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

await step("gigs: keyword search", async () => {
  const r = await anon.get("/gigs?q=figma");

  expectStatus(r, 200);
  assert.ok(r.data.gigs.length >= 1);
});

await step("gigs: invalid filter is rejected (400)", async () => {
  expectStatus(await anon.get("/gigs?minRating=9"), 400);
});

await step("find Rahul's gig and read its packages", async () => {
  const list = await anon.get("/gigs?limit=50");

  expectStatus(list, 200);

  const gig = list.data.gigs.find(
    (g) => g.seller.firstName === "Rahul"
  );

  assert.ok(gig, "seed data missing: run npm run seed first");

  ctx.gigId = gig._id;
  ctx.rahulId = gig.seller._id;

  const detail = await anon.get(`/gigs/${gig._id}`);

  expectStatus(detail, 200);

  ctx.basicPrice = detail.data.gig.packages.basic.price;

  assert.ok(ctx.basicPrice > 0);
});

// =====================================================
// AUTHENTICATION AND AUTHORIZATION
// =====================================================

console.log("\nAuthentication and authorization");

await step("anonymous: /auth/me is 401", async () => {
  expectStatus(await anon.get("/auth/me"), 401);
});

await step("anonymous: cannot place an order (401)", async () => {
  expectStatus(await anon.post("/orders", {}), 401);
});

await step("anonymous: cannot upload (401)", async () => {
  expectStatus(
    await anon.post("/uploads/image?purpose=gig", {}),
    401
  );
});

await step("wrong password is rejected (401)", async () => {
  expectStatus(
    await anon.post("/auth/login", {
      email: "client@gigcraft.test",
      password: "wrong-password",
    }),
    401
  );
});

await step("operator injection in login is rejected (400)", async () => {
  expectStatus(
    await anon.call("POST", "/auth/login", {
      email: { $ne: "" },
      password: { $ne: "" },
    }),
    400
  );
});

await step("client logs in with a cookie session", async () => {
  const r = await client.post("/auth/login", {
    email: "client@gigcraft.test",
    password: PASSWORD,
  });

  expectStatus(r, 200);

  assert.equal(r.data.user.role, "client");
  assert.ok(client.cookie.startsWith("token="));
  assert.equal(r.data.user.password, undefined);
});

await step("/auth/me restores the session", async () => {
  const r = await client.get("/auth/me");

  expectStatus(r, 200);
  assert.equal(r.data.user.email, "client@gigcraft.test");
});

await step("client cannot create gigs (403)", async () => {
  expectStatus(await client.post("/gigs", {}), 403);
});

await step("client cannot open freelancer dashboard (403)", async () => {
  expectStatus(await client.get("/dashboard/freelancer"), 403);
});

await step("register: invalid email (400)", async () => {
  expectStatus(
    await anon.post("/auth/register", {
      firstName: "A",
      lastName: "B",
      email: "nope",
      password: "Secret123",
      role: "client",
      acceptTerms: true,
    }),
    400
  );
});

await step("register: duplicate email (409)", async () => {
  expectStatus(
    await anon.post("/auth/register", {
      firstName: "A",
      lastName: "B",
      email: "client@gigcraft.test",
      password: "Secret123",
      role: "client",
      acceptTerms: true,
    }),
    409
  );
});

await step("register: new freelancer gets a session and profile", async () => {
  const r = await fresh.post("/auth/register", {
    firstName: "Smoke",
    lastName: "Tester",
    email: `smoke_${Date.now()}@example.com`,
    password: "Secret123",
    role: "freelancer",
    acceptTerms: true,
  });

  expectStatus(r, 201);

  const me = await fresh.get("/profile/me");

  expectStatus(me, 200);
  assert.ok(me.data.profile);
});

// =====================================================
// ORDER LIFECYCLE
// =====================================================

console.log("\nOrder lifecycle (client <-> Rahul, escrow simulated)");

await step("Rahul and Priya log in", async () => {
  const r1 = await rahul.post("/auth/login", {
    email: "rahul@gigcraft.test",
    password: PASSWORD,
  });

  expectStatus(r1, 200);

  const r2 = await priya.post("/auth/login", {
    email: "priya@gigcraft.test",
    password: PASSWORD,
  });

  expectStatus(r2, 200);
});

await step("checkout ignores tampered price and status", async () => {
  const r = await client.post("/orders", {
    gigId: ctx.gigId,
    tier: "basic",
    price: 1,
    status: "completed",
    requirements:
      "Smoke test order: build a responsive landing page with a pricing section.",
  });

  expectStatus(r, 201);

  assert.equal(r.data.order.price, ctx.basicPrice);
  assert.equal(r.data.order.status, "pending");
  assert.equal(r.data.payment.status, "held");
  assert.equal(r.data.payment.isSimulated, true);

  ctx.orderId = r.data.order._id;
});

await step("invalid transition: complete while pending (409)", async () => {
  expectStatus(
    await client.post(`/orders/${ctx.orderId}/complete`),
    409
  );
});

await step("wrong role: client cannot accept (403)", async () => {
  expectStatus(
    await client.post(`/orders/${ctx.orderId}/accept`),
    403
  );
});

await step("non-participants get 404 for the order", async () => {
  expectStatus(
    await priya.get(`/orders/${ctx.orderId}`),
    404
  );
});

await step("Rahul accepts: in_progress with a due date", async () => {
  const r = await rahul.post(`/orders/${ctx.orderId}/accept`);

  expectStatus(r, 200);

  assert.equal(r.data.order.status, "in_progress");
  assert.ok(r.data.order.dueDate);
});

await step("Rahul delivers", async () => {
  const r = await rahul.post(`/orders/${ctx.orderId}/deliver`, {
    message: "First delivery attached.",
    files: [
      {
        url: "https://example.com/v1.zip",
        name: "v1.zip",
        size: 1024,
      },
    ],
  });

  expectStatus(r, 200);
  assert.equal(r.data.order.status, "delivered");
});

await step("client requests a revision", async () => {
  const r = await client.post(
    `/orders/${ctx.orderId}/revision`,
    {
      message: "Please adjust the hero spacing.",
    }
  );

  expectStatus(r, 200);

  assert.equal(r.data.order.status, "revision_requested");
  assert.equal(r.data.order.revisionsUsed, 1);
});

await step("Rahul re-delivers", async () => {
  const r = await rahul.post(`/orders/${ctx.orderId}/deliver`, {
    message: "Revised delivery attached.",
  });

  expectStatus(r, 200);
  assert.equal(r.data.order.deliveries.length, 2);
});

await step("client approves: completed and escrow released", async () => {
  expectStatus(
    await client.post(`/orders/${ctx.orderId}/complete`),
    200
  );

  const r = await client.get(`/orders/${ctx.orderId}`);

  assert.equal(r.data.order.status, "completed");
  assert.equal(r.data.payment.status, "released");
});

await step("Rahul's payment summary includes payout", async () => {
  const r = await rahul.get("/payments/mine");

  expectStatus(r, 200);

  assert.ok(r.data.summary.released >= ctx.basicPrice);
  assert.equal(r.data.isSimulated, true);
});

await step("cancel flow: pending order is cancelled and refunded", async () => {
  const o = await client.post("/orders", {
    gigId: ctx.gigId,
    tier: "basic",
    requirements: "Second smoke test order to be cancelled shortly.",
  });

  expectStatus(o, 201);

  const c = await client.post(
    `/orders/${o.data.order._id}/cancel`,
    {
      reason: "Changed my mind about scope.",
    }
  );

  expectStatus(c, 200);
  assert.equal(c.data.order.status, "cancelled");

  const detail = await client.get(`/orders/${o.data.order._id}`);

  assert.equal(detail.data.payment.status, "refunded");
});

// =====================================================
// REVIEWS AND RATINGS
// =====================================================

console.log("\nReviews and ratings");

await step("rating out of range is rejected (400)", async () => {
  expectStatus(
    await client.post("/reviews", {
      orderId: ctx.orderId,
      rating: 9,
      comment: "Way too many stars here.",
    }),
    400
  );
});

await step("client reviews the completed order", async () => {
  const r = await client.post("/reviews", {
    orderId: ctx.orderId,
    rating: 4,
    comment: "Solid work and clear communication.",
  });

  expectStatus(r, 201);

  ctx.reviewId = r.data.review._id;
});

await step("duplicate review is rejected (409)", async () => {
  expectStatus(
    await client.post("/reviews", {
      orderId: ctx.orderId,
      rating: 5,
      comment: "Trying to review twice again.",
    }),
    409
  );
});

await step("gig rating is calculated from stored reviews", async () => {
  const gig = await anon.get(`/gigs/${ctx.gigId}`);
  const reviews = await anon.get(`/reviews?gig=${ctx.gigId}`);

  expectStatus(reviews, 200);

  assert.equal(
    gig.data.gig.ratingCount,
    reviews.data.summary.count
  );

  assert.equal(
    gig.data.gig.ratingAverage,
    reviews.data.summary.average
  );

  assert.ok(reviews.data.summary.count >= 2);
});

await step("only reviewed freelancer can reply", async () => {
  expectStatus(
    await client.post(`/reviews/${ctx.reviewId}/reply`, {
      text: "I should not be able to do this.",
    }),
    403
  );

  expectStatus(
    await priya.post(`/reviews/${ctx.reviewId}/reply`, {
      text: "Not my review either, so no.",
    }),
    403
  );

  const r = await rahul.post(
    `/reviews/${ctx.reviewId}/reply`,
    {
      text: "Thank you!",
    }
  );

  expectStatus(r, 200);
  assert.equal(r.data.review.reply.text, "Thank you!");
});

// =====================================================
// MESSAGING
// =====================================================

console.log("\nMessaging");

await step("client opens order conversation", async () => {
  const r = await client.post("/conversations", {
    orderId: ctx.orderId,
  });

  expectOneOf(r, [200, 201]);

  ctx.convoId = r.data.conversation._id;
});

await step("empty message is rejected (400)", async () => {
  expectStatus(
    await client.post(
      `/conversations/${ctx.convoId}/messages`,
      { text: "" }
    ),
    400
  );
});

await step("client sends a message", async () => {
  expectStatus(
    await client.post(
      `/conversations/${ctx.convoId}/messages`,
      {
        text: "Hi Rahul, quick question about the files.",
      }
    ),
    201
  );
});

await step("Rahul has unread messages; reading clears them", async () => {
  let r = await rahul.get("/conversations");

  expectStatus(r, 200);

  assert.ok(
    r.data.conversations.find(
      (c) => c._id === ctx.convoId
    ).unreadCount >= 1
  );

  expectStatus(
    await rahul.post(`/conversations/${ctx.convoId}/read`),
    200
  );

  r = await rahul.get("/conversations");

  assert.equal(
    r.data.conversations.find(
      (c) => c._id === ctx.convoId
    ).unreadCount,
    0
  );
});

await step("non-participants cannot read conversation (404)", async () => {
  expectStatus(
    await priya.get(
      `/conversations/${ctx.convoId}/messages`
    ),
    404
  );
});

// =====================================================
// FAVORITES
// =====================================================

console.log("\nFavorites");

await step("save, list and remove a favorite", async () => {
  expectStatus(
    await client.post("/favorites", {
      gigId: ctx.gigId,
    }),
    200
  );

  // Idempotent request
  expectStatus(
    await client.post("/favorites", {
      gigId: ctx.gigId,
    }),
    200
  );

  let ids = await client.get("/favorites/ids");

  assert.ok(ids.data.ids.includes(ctx.gigId));

  expectStatus(
    await client.del(`/favorites/${ctx.gigId}`),
    200
  );

  ids = await client.get("/favorites/ids");

  assert.ok(!ids.data.ids.includes(ctx.gigId));
});

await step("cannot favorite own gig (400)", async () => {
  expectStatus(
    await rahul.post("/favorites", {
      gigId: ctx.gigId,
    }),
    400
  );
});

// =====================================================
// GIG MANAGEMENT
// =====================================================

console.log("\nGig management (Rahul)");

const gigBody = {
  title: "I will run a smoke test gig lifecycle end to end",
  category: null,
  description:
    "This gig exists only to exercise the create, publish, pause and delete workflow of the GigCraft API.",
  tags: ["smoke"],
  images: [],
  packages: {
    basic: {
      title: "Basic",
      description: "Basic package",
      price: 1500,
      deliveryDays: 2,
      revisions: 1,
      features: ["One thing"],
    },
    standard: {
      title: "Standard",
      description: "Standard package",
      price: 3500,
      deliveryDays: 4,
      revisions: 2,
      features: ["Two things"],
    },
    premium: {
      title: "Premium",
      description: "Premium package",
      price: 8000,
      deliveryDays: 7,
      revisions: -1,
      features: ["Three things"],
    },
  },
};

await step("create a draft gig", async () => {
  const r = await rahul.post("/gigs", {
    ...gigBody,
    category: ctx.categoryId,
  });

  expectStatus(r, 201);

  assert.equal(r.data.gig.status, "draft");
  assert.equal(r.data.gig.startingPrice, 1500);

  ctx.newGigId = r.data.gig._id;
});

await step("draft is hidden from public (404)", async () => {
  expectStatus(
    await anon.get(`/gigs/${ctx.newGigId}`),
    404
  );
});

await step("publishing without images fails (400)", async () => {
  expectStatus(
    await rahul.patch(
      `/gigs/${ctx.newGigId}/status`,
      { status: "published" }
    ),
    400
  );
});

await step("add image, then publish", async () => {
  expectStatus(
    await rahul.put(`/gigs/${ctx.newGigId}`, {
      ...gigBody,
      category: ctx.categoryId,
      images: [
        {
          url: "https://placehold.co/800x500/png",
        },
      ],
    }),
    200
  );

  const r = await rahul.patch(
    `/gigs/${ctx.newGigId}/status`,
    { status: "published" }
  );

  expectStatus(r, 200);
  assert.equal(r.data.gig.status, "published");
});

await step("published gig is listed in marketplace", async () => {
  const r = await anon.get("/gigs?sort=newest&limit=50");

  expectStatus(r, 200);

  assert.ok(
    r.data.gigs.some((g) => g._id === ctx.newGigId)
  );
});

await step("another freelancer cannot edit it (403)", async () => {
  expectStatus(
    await priya.put(`/gigs/${ctx.newGigId}`, {
      ...gigBody,
      category: ctx.categoryId,
    }),
    403
  );
});

await step("pausing hides gig", async () => {
  expectStatus(
    await rahul.patch(
      `/gigs/${ctx.newGigId}/status`,
      { status: "paused" }
    ),
    200
  );

  const r = await anon.get("/gigs?sort=newest&limit=50");

  assert.ok(
    !r.data.gigs.some((g) => g._id === ctx.newGigId)
  );

  expectStatus(
    await anon.get(`/gigs/${ctx.newGigId}`),
    404
  );
});

await step("gig with orders cannot be deleted (409)", async () => {
  expectStatus(
    await rahul.del(`/gigs/${ctx.gigId}`),
    409
  );
});

await step("delete test gig", async () => {
  expectStatus(
    await rahul.del(`/gigs/${ctx.newGigId}`),
    200
  );
});

// =====================================================
// DASHBOARDS
// =====================================================

console.log("\nDashboards");

await step("freelancer dashboard shows real earnings", async () => {
  const r = await rahul.get("/dashboard/freelancer");

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

// =====================================================
// ADMIN MODERATION
// =====================================================

console.log("\nAdmin moderation");

await step("admin routes reject anonymous and non-admin users", async () => {
  expectStatus(
    await anon.get("/admin/stats"),
    401
  );

  expectStatus(
    await client.get("/admin/stats"),
    403
  );

  expectStatus(
    await priya.get("/admin/reviews"),
    403
  );
});

await step("admin logs in and reads stats", async () => {
  const r = await admin.post("/auth/login", {
    email: "admin@gigcraft.test",
    password: PASSWORD,
  });

  expectStatus(r, 200);

  assert.equal(r.data.user.role, "admin");

  ctx.adminId = r.data.user._id;

  const s = await admin.get("/admin/stats");

  expectStatus(s, 200);

  assert.ok(s.data.stats.reviews.total >= 1);
});

await step("admin cannot be created through registration (400)", async () => {
  expectStatus(
    await anon.post("/auth/register", {
      firstName: "A",
      lastName: "B",
      email: `x_${Date.now()}@example.com`,
      password: "Secret123",
      role: "admin",
      acceptTerms: true,
    }),
    400
  );
});

await step("a freelancer reports a review and it shows in queue", async () => {
  // Priya is already logged in as a freelancer.
  expectStatus(
    await priya.post(
      `/reviews/${ctx.reviewId}/report`,
      {
        reason: "Smoke test report reason.",
      }
    ),
    200
  );

  const r = await admin.get(
    "/admin/reviews?filter=reported"
  );

  expectStatus(r, 200);

  assert.ok(
    r.data.reviews.some(
      (x) => x._id === ctx.reviewId
    )
  );
});

await step("hiding requires reason, then works and recalculates ratings", async () => {
  expectStatus(
    await admin.patch(
      `/admin/reviews/${ctx.reviewId}/visibility`,
      { hidden: true }
    ),
    400
  );

  const before = (
    await anon.get(`/gigs/${ctx.gigId}`)
  ).data.gig.ratingCount;

  expectStatus(
    await admin.patch(
      `/admin/reviews/${ctx.reviewId}/visibility`,
      {
        hidden: true,
        reason: "Smoke test: hiding.",
      }
    ),
    200
  );

  const after = (
    await anon.get(`/gigs/${ctx.gigId}`)
  ).data.gig.ratingCount;

  assert.equal(after, before - 1);

  const pub = await anon.get(
    `/reviews?gig=${ctx.gigId}`
  );

  assert.ok(
    !pub.data.reviews.some(
      (x) => x._id === ctx.reviewId
    ),
    "hidden review must not be public"
  );

  expectStatus(
    await admin.patch(
      `/admin/reviews/${ctx.reviewId}/visibility`,
      {
        hidden: true,
        reason: "Again.",
      }
    ),
    409
  );
});

await step("restoring brings review and rating back", async () => {
  const before = (
    await anon.get(`/gigs/${ctx.gigId}`)
  ).data.gig.ratingCount;

  expectStatus(
    await admin.patch(
      `/admin/reviews/${ctx.reviewId}/visibility`,
      { hidden: false }
    ),
    200
  );

  const after = (
    await anon.get(`/gigs/${ctx.gigId}`)
  ).data.gig.ratingCount;

  assert.equal(after, before + 1);
});

await step("dismissing reports clears queue entry", async () => {
  expectStatus(
    await admin.post(
      `/admin/reviews/${ctx.reviewId}/dismiss-reports`,
      {}
    ),
    200
  );

  const r = await admin.get(
    "/admin/reviews?filter=reported"
  );

  assert.ok(
    !r.data.reviews.some(
      (x) => x._id === ctx.reviewId
    )
  );

  expectStatus(
    await admin.post(
      `/admin/reviews/${ctx.reviewId}/dismiss-reports`,
      {}
    ),
    409
  );
});

await step("suspending user blocks login and sessions; reactivating restores them", async () => {
  const me = await fresh.get("/auth/me");

  expectStatus(me, 200);

  const id = me.data.user._id;
  const email = me.data.user.email;

  expectStatus(
    await admin.patch(
      `/admin/users/${id}/status`,
      { isActive: false }
    ),
    400
  );

  expectStatus(
    await admin.patch(
      `/admin/users/${id}/status`,
      {
        isActive: false,
        reason: "Smoke test suspension.",
      }
    ),
    200
  );

  expectStatus(
    await fresh.get("/auth/me"),
    401
  );

  expectStatus(
    await new Session().post("/auth/login", {
      email,
      password: "Secret123",
    }),
    403
  );

  expectStatus(
    await admin.patch(
      `/admin/users/${id}/status`,
      { isActive: true }
    ),
    200
  );

  expectStatus(
    await new Session().post("/auth/login", {
      email,
      password: "Secret123",
    }),
    200
  );
});

await step("admins cannot suspend themselves (400)", async () => {
  expectStatus(
    await admin.patch(
      `/admin/users/${ctx.adminId}/status`,
      {
        isActive: false,
        reason: "Trying to lock myself out.",
      }
    ),
    400
  );
});

await step("activity log recorded the actions", async () => {
  const r = await admin.get("/admin/log");

  expectStatus(r, 200);

  assert.ok(r.data.logs.length >= 5);
  assert.ok(r.data.logs.every((l) => l.targetLabel));
});


console.log("\nPublic stats");
await step("public stats are real aggregates and leak nothing private", async () => {
  const r = await anon.get("/public/stats");
  expectStatus(r, 200);
  const s = r.data.stats;
  assert.ok(s.gigs >= 1 && s.freelancers >= 1 && s.completedOrders >= 1);
  assert.equal(typeof s.simulatedVolume, "number");
  if (s.latestReview) {
    assert.deepEqual(Object.keys(s.latestReview).sort(), ["author", "comment", "gigTitle", "rating"]);
    assert.ok(s.latestReview.comment.length <= 201);
    assert.ok(!JSON.stringify(s).includes("@"), "no email addresses in public stats");
  }
});

// =====================================================
// FINAL SUMMARY
// =====================================================

console.log("\n==================================");

console.log(
  `${failed === 0 ? "All checks passed" : "Some checks FAILED"}`
);

console.log(`Total Passed: ${passed}`);
console.log(`Total Failed: ${failed}`);
console.log(`Total Tests:  ${passed + failed}`);

console.log("==================================\n");

process.exitCode = failed > 0 ? 1 : 0;
