const pkg = (title, price, days, revisions, features) => ({
  title, description: `${title} package`, price, deliveryDays: days, revisions, features,
});

const gigBody = {
  title: "I will build a clean responsive landing page",
  category: "{{categoryId}}",
  description: "I will design and build a fast, accessible landing page with clear sections, strong typography and clean handoff files for your team.",
  tags: ["landing", "figma"],
  images: [{ url: "https://placehold.co/800x500/png" }],
  packages: {
    basic: pkg("Starter", 3500, 2, 1, ["1 page"]),
    standard: pkg("Growth", 8500, 4, 2, ["3 sections"]),
    premium: pkg("Scale", 22000, 7, -1, ["5 pages"]),
  },
  status: "draft",
};

// auth: public | user | client | freelancer     save: [[collectionVariable, "path.in.response"], ...]
export const groups = [
  {
    name: "Health", items: [
      { method: "GET", path: "/health", auth: "public", summary: "Server health check" },
    ]
  },
  {
    name: "Auth", items: [
      {
        method: "POST", path: "/auth/register", auth: "public", summary: "Create an account and sign in (sets the httpOnly cookie)",
        body: { firstName: "Test", lastName: "User", email: "test@example.com", password: "Secret123", role: "freelancer", domainFocus: "Fullstack", marketingOptIn: false, acceptTerms: true }
      },
      {
        method: "POST", path: "/auth/login", auth: "public", summary: "Sign in (remember=false gives a session cookie)",
        body: { email: "client@gigcraft.test", password: "Password123!", remember: true }
      },
      { method: "POST", path: "/auth/logout", auth: "public", summary: "Clear the auth cookie" },
      { method: "GET", path: "/auth/me", auth: "user", summary: "Current user (used to restore the session)" },
      { method: "POST", path: "/auth/forgot-password", auth: "public", summary: "Request a reset link (printed in the server console in this project)", body: { email: "client@gigcraft.test" } },
      { method: "POST", path: "/auth/reset-password/{{resetToken}}", auth: "public", summary: "Set a new password using the token from the reset link", body: { password: "NewPass123" } },
      { method: "PUT", path: "/auth/change-password", auth: "user", summary: "Change password (signs out other devices)", body: { currentPassword: "Password123!", newPassword: "NewPass123" } },
    ]
  },
  {
    name: "Categories", items: [
      { method: "GET", path: "/categories", auth: "public", summary: "All categories with published gig counts", save: [["categoryId", "categories.0._id"]] },
    ]
  },
  {
    name: "Gigs", items: [
      {
        method: "GET", path: "/gigs", auth: "public", summary: "Search, filter, sort and paginate published gigs (server-side)",
        query: { q: "figma", category: "graphics-and-design", minPrice: 1000, maxPrice: 30000, maxDelivery: 7, minRating: 4.5, levels: "pro,top_rated", minExperience: 2, tags: "figma", sort: "relevance", page: 1, limit: 12 },
        notes: "sort: relevance | newest | price_asc | price_desc | rating | popular",
        save: [["gigId", "gigs.0._id"], ["freelancerId", "gigs.0.seller._id"]]
      },
      { method: "GET", path: "/gigs/mine", auth: "freelancer", summary: "Your own gigs with order stats" },
      { method: "GET", path: "/gigs/{{gigId}}", auth: "public", summary: "Gig detail with seller profile. Drafts are visible only to the owner" },
      { method: "POST", path: "/gigs", auth: "freelancer", summary: "Create a gig (draft or published)", body: gigBody, save: [["gigId", "gig._id"]] },
      { method: "PUT", path: "/gigs/{{gigId}}", auth: "freelancer", summary: "Update your gig", body: gigBody },
      { method: "PATCH", path: "/gigs/{{gigId}}/status", auth: "freelancer", summary: "Publish, pause or return to draft", body: { status: "published" } },
      { method: "DELETE", path: "/gigs/{{gigId}}", auth: "freelancer", summary: "Delete your gig (409 if it has orders)" },
    ]
  },
  {
    name: "Freelancers", items: [
      { method: "GET", path: "/freelancers/{{freelancerId}}", auth: "public", summary: "Public profile with published gigs and portfolio" },
    ]
  },
  {
    name: "Profile", items: [
      { method: "GET", path: "/profile/me", auth: "user", summary: "Your user record and freelancer profile" },
      { method: "PUT", path: "/profile/account", auth: "user", summary: "Update name, company and focus", body: { firstName: "Test", lastName: "User", companyName: "Acme", domainFocus: "Fullstack" } },
      {
        method: "PUT", path: "/profile/freelancer", auth: "freelancer", summary: "Update the public freelancer profile",
        body: { title: "Full-stack engineer", bio: "I build web apps.", location: "Berlin, Germany", experienceYears: 5, hourlyRate: 80, skills: ["React", "Node.js"], languages: [{ name: "English", level: "fluent" }], workHistory: [{ title: "Engineer", company: "Acme", startYear: 2020, endYear: null }] }
      },
      { method: "POST", path: "/profile/avatar", auth: "user", summary: "Upload a profile photo (multipart field: image)", upload: "image" },
      { method: "DELETE", path: "/profile/account", auth: "user", summary: "Delete your account: anonymises it and removes personal data. Blocked while you have active orders. Admins can't use it", body: { password: "Secret123", confirm: "DELETE" } },
    ]
  },
  {
    name: "Portfolio", items: [
      { method: "GET", path: "/portfolio/mine", auth: "freelancer", summary: "Your portfolio projects" },
      { method: "POST", path: "/portfolio", auth: "freelancer", summary: "Add a project", body: { title: "My project", description: "A short description of this project.", industry: "SaaS", metric: "+40% conversion", durationWeeks: 8, deliverables: ["Design system"], externalLink: "https://example.com", images: [] }, save: [["projectId", "project._id"]] },
      { method: "PUT", path: "/portfolio/{{projectId}}", auth: "freelancer", summary: "Update a project", body: { title: "My project v2", description: "An updated description of this project." } },
      { method: "DELETE", path: "/portfolio/{{projectId}}", auth: "freelancer", summary: "Delete a project" },
    ]
  },
  {
    name: "Uploads", items: [
      { method: "POST", path: "/uploads/image?purpose=gig", auth: "user", summary: "Upload an image to Cloudinary (purpose: gig | portfolio; field: image; max 5 MB)", upload: "image" },
      { method: "POST", path: "/uploads/file", auth: "user", summary: "Upload a deliverable or attachment (field: file; max 25 MB)", upload: "file" },
    ]
  },
  {
    name: "Orders", items: [
      {
        method: "POST", path: "/orders", auth: "client", summary: "Checkout. The price comes from the gig package, never from the request",
        body: { gigId: "{{gigId}}", tier: "standard", requirements: "Please build a responsive landing page with a pricing section.", attachments: [] }, save: [["orderId", "order._id"]]
      },
      {
        method: "GET", path: "/orders", auth: "user", summary: "Your orders (as client or freelancer) with status counts",
        query: { status: "in_progress,delivered", q: "GC-", page: 1, limit: 10 }, save: [["orderId", "orders.0._id"]]
      },
      { method: "GET", path: "/orders/{{orderId}}", auth: "user", summary: "Order detail, payment, review and your permitted next actions (404 for non-participants)" },
      { method: "POST", path: "/orders/{{orderId}}/accept", auth: "freelancer", summary: "pending -> in_progress" },
      {
        method: "POST", path: "/orders/{{orderId}}/deliver", auth: "freelancer", summary: "in_progress | revision_requested -> delivered",
        body: { message: "First delivery attached.", files: [{ url: "https://example.com/v1.zip", name: "v1.zip", size: 1024 }] }
      },
      { method: "POST", path: "/orders/{{orderId}}/revision", auth: "client", summary: "delivered -> revision_requested (uses one revision)", body: { message: "Please adjust the hero spacing." } },
      { method: "POST", path: "/orders/{{orderId}}/complete", auth: "client", summary: "delivered -> completed and release the simulated escrow" },
      { method: "POST", path: "/orders/{{orderId}}/cancel", auth: "user", summary: "Cancel and refund. Client only while pending; freelancer while pending, in progress or revision", body: { reason: "Changed my mind about scope." } },
    ]
  },
  {
    name: "Payments", items: [
      { method: "GET", path: "/payments/mine", auth: "user", summary: "Simulated payment records and escrow/earnings summary", query: { page: 1, limit: 10 } },
    ]
  },
  {
    name: "Reviews", items: [
      { method: "GET", path: "/reviews?gig={{gigId}}", auth: "public", summary: "Reviews and rating summary for a gig (or use ?freelancer=<userId>)", query: { sort: "recent", page: 1, limit: 5 } },
      { method: "GET", path: "/reviews/mine", auth: "client", summary: "Reviews you wrote and completed orders still waiting for one" },
      { method: "POST", path: "/reviews", auth: "client", summary: "Review a completed order (one review per order)", body: { orderId: "{{orderId}}", rating: 5, comment: "Solid work and clear communication." }, save: [["reviewId", "review._id"]] },
      { method: "POST", path: "/reviews/{{reviewId}}/reply", auth: "freelancer", summary: "Reply to a review of your work", body: { text: "Thank you for the kind words!" } },
      { method: "POST", path: "/reviews/{{reviewId}}/report", auth: "user", summary: "Report an inappropriate review (stored for moderation)", body: { reason: "Contains abusive language." } },
    ]
  },
  {
    name: "Favorites", items: [
      { method: "GET", path: "/favorites/ids", auth: "user", summary: "Ids of saved gigs (to paint the hearts)" },
      { method: "GET", path: "/favorites", auth: "user", summary: "Saved gigs, paginated", query: { page: 1, limit: 12 } },
      { method: "POST", path: "/favorites", auth: "user", summary: "Save a gig (idempotent)", body: { gigId: "{{gigId}}" } },
      { method: "DELETE", path: "/favorites/{{gigId}}", auth: "user", summary: "Remove a saved gig" },
    ]
  },
  {
    name: "Conversations", items: [
      {
        method: "POST", path: "/conversations", auth: "user", summary: "Start or reopen a conversation. Provide exactly one of orderId, gigId (clients) or freelancerId (clients)",
        body: { orderId: "{{orderId}}" }, save: [["conversationId", "conversation._id"]]
      },
      { method: "GET", path: "/conversations", auth: "user", summary: "Your conversations with unread counts", save: [["conversationId", "conversations.0._id"]] },
      { method: "GET", path: "/conversations/unread-count", auth: "user", summary: "Total unread messages (navbar badge)" },
      { method: "GET", path: "/conversations/{{conversationId}}/messages", auth: "user", summary: "Messages, oldest to newest. Use ?before=<messageId>&limit=30 for earlier ones" },
      { method: "POST", path: "/conversations/{{conversationId}}/messages", auth: "user", summary: "Send a message (rate limited)", body: { text: "Hello!", attachments: [] } },
      { method: "POST", path: "/conversations/{{conversationId}}/read", auth: "user", summary: "Mark the conversation as read" },
    ]
  },
  {
    name: "Dashboard", items: [
      { method: "GET", path: "/dashboard/client", auth: "client", summary: "Client stats computed from real data" },
      { method: "GET", path: "/dashboard/freelancer", auth: "freelancer", summary: "Freelancer stats, 6-month earnings and top gigs" },
    ]
  },
  {
    name: "Admin", items: [
      { method: "GET", path: "/admin/stats", auth: "admin", summary: "Platform counts and moderation queue size" },
      { method: "GET", path: "/admin/reviews", auth: "admin", summary: "Reviews by moderation state", query: { filter: "reported", page: 1, limit: 8 }, notes: "filter: reported | hidden | all", save: [["reviewId", "reviews.0._id"]] },
      { method: "PATCH", path: "/admin/reviews/{{reviewId}}/visibility", auth: "admin", summary: "Hide or restore a review (ratings are recalculated). A reason of 5+ characters is required to hide", body: { hidden: true, reason: "Contains abusive language." } },
      { method: "POST", path: "/admin/reviews/{{reviewId}}/dismiss-reports", auth: "admin", summary: "Clear the reports on a review", body: { reason: "Reports reviewed, no violation." } },
      { method: "GET", path: "/admin/users", auth: "admin", summary: "Search users", query: { q: "elena", role: "freelancer", status: "suspended", page: 1, limit: 15 }, save: [["targetUserId", "users.0._id"]] },
      { method: "PATCH", path: "/admin/users/{{targetUserId}}/status", auth: "admin", summary: "Suspend or reactivate a user. Suspending pauses their published gigs. A reason is required to suspend", body: { isActive: false, reason: "Repeated policy violations." } },
      { method: "GET", path: "/admin/log", auth: "admin", summary: "Moderation activity log", query: { page: 1, limit: 20 } },
    ]
  },
  {
    name: "Public", items: [
      { method: "GET", path: "/public/stats", auth: "public", summary: "Platform totals and one short public review quote (cached for 60 seconds)" },
    ]
  },
];