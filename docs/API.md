# GigCraft API Reference

_Generated from `server/docs/endpoints.js` with `npm run docs` in `server/`._

**Base URL:** `http://localhost:5000/api`

## Conventions

- **Auth:** a JWT is stored in an httpOnly cookie named `token` after `/auth/register` or `/auth/login`. Send requests with credentials (Postman keeps cookies automatically). `Authorization: Bearer <token>` is also accepted.
- **Success:** `{ "success": true, ... }`.
- **Errors:** `{ "success": false, "message": "...", "details": [{ "field": "...", "message": "..." }] }` (`details` appears for validation errors).
- **Pagination:** list endpoints take `page` and `limit` and return `pagination: { page, limit, total, pages }`.
- **Payments are simulated.** No real money moves; payment records have `isSimulated: true`.

| Status | Meaning |
|---|---|
| 200 / 201 | OK / Created |
| 400 | Validation error or invalid input |
| 401 | Not logged in, or invalid/expired session |
| 403 | Logged in but not allowed (wrong role or not the owner) |
| 404 | Not found (also used for resources you are not a participant of) |
| 409 | Conflict: duplicate, or invalid state transition |
| 413 | Uploaded file too large |
| 429 | Rate limit hit |
| 503 | Uploads not configured (Cloudinary credentials missing) |

## Order status transitions

| From | To | Who |
|---|---|---|
| pending | in_progress | freelancer (accept) |
| pending | cancelled | client or freelancer |
| in_progress | delivered | freelancer |
| in_progress | cancelled | freelancer |
| delivered | completed | client (releases escrow) |
| delivered | revision_requested | client |
| revision_requested | delivered | freelancer |
| revision_requested | cancelled | freelancer |

## Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Server health check |

## Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create an account and sign in (sets the httpOnly cookie) |
| `POST` | `/auth/login` | Public | Sign in (remember=false gives a session cookie) |
| `POST` | `/auth/logout` | Public | Clear the auth cookie |
| `GET` | `/auth/me` | Logged in | Current user (used to restore the session) |
| `POST` | `/auth/forgot-password` | Public | Request a reset link (printed in the server console in this project) |
| `POST` | `/auth/reset-password/:resetToken` | Public | Set a new password using the token from the reset link |
| `PUT` | `/auth/change-password` | Logged in | Change password (signs out other devices) |

**`POST /auth/register`**

Example body:

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Secret123",
  "role": "freelancer",
  "domainFocus": "Fullstack",
  "marketingOptIn": false,
  "acceptTerms": true
}
```

**`POST /auth/login`**

Example body:

```json
{
  "email": "client@gigcraft.test",
  "password": "Password123!",
  "remember": true
}
```

**`POST /auth/forgot-password`**

Example body:

```json
{
  "email": "client@gigcraft.test"
}
```

**`POST /auth/reset-password/:resetToken`**

Example body:

```json
{
  "password": "NewPass123"
}
```

**`PUT /auth/change-password`**

Example body:

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPass123"
}
```

## Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | All categories with published gig counts |

## Gigs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/gigs` | Public | Search, filter, sort and paginate published gigs (server-side) |
| `GET` | `/gigs/mine` | Freelancer only | Your own gigs with order stats |
| `GET` | `/gigs/:gigId` | Public | Gig detail with seller profile. Drafts are visible only to the owner |
| `POST` | `/gigs` | Freelancer only | Create a gig (draft or published) |
| `PUT` | `/gigs/:gigId` | Freelancer only | Update your gig |
| `PATCH` | `/gigs/:gigId/status` | Freelancer only | Publish, pause or return to draft |
| `DELETE` | `/gigs/:gigId` | Freelancer only | Delete your gig (409 if it has orders) |

**`GET /gigs`**

sort: relevance | newest | price_asc | price_desc | rating | popular

Query parameters:

```json
{
  "q": "figma",
  "category": "graphics-and-design",
  "minPrice": 1000,
  "maxPrice": 30000,
  "maxDelivery": 7,
  "minRating": 4.5,
  "levels": "pro,top_rated",
  "minExperience": 2,
  "tags": "figma",
  "sort": "relevance",
  "page": 1,
  "limit": 12
}
```

**`POST /gigs`**

Example body:

```json
{
  "title": "I will build a clean responsive landing page",
  "category": "<categoryId>",
  "description": "I will design and build a fast, accessible landing page with clear sections, strong typography and clean handoff files for your team.",
  "tags": [
    "landing",
    "figma"
  ],
  "images": [
    {
      "url": "https://placehold.co/800x500/png"
    }
  ],
  "packages": {
    "basic": {
      "title": "Starter",
      "description": "Starter package",
      "price": 3500,
      "deliveryDays": 2,
      "revisions": 1,
      "features": [
        "1 page"
      ]
    },
    "standard": {
      "title": "Growth",
      "description": "Growth package",
      "price": 8500,
      "deliveryDays": 4,
      "revisions": 2,
      "features": [
        "3 sections"
      ]
    },
    "premium": {
      "title": "Scale",
      "description": "Scale package",
      "price": 22000,
      "deliveryDays": 7,
      "revisions": -1,
      "features": [
        "5 pages"
      ]
    }
  },
  "status": "draft"
}
```

**`PUT /gigs/:gigId`**

Example body:

```json
{
  "title": "I will build a clean responsive landing page",
  "category": "<categoryId>",
  "description": "I will design and build a fast, accessible landing page with clear sections, strong typography and clean handoff files for your team.",
  "tags": [
    "landing",
    "figma"
  ],
  "images": [
    {
      "url": "https://placehold.co/800x500/png"
    }
  ],
  "packages": {
    "basic": {
      "title": "Starter",
      "description": "Starter package",
      "price": 3500,
      "deliveryDays": 2,
      "revisions": 1,
      "features": [
        "1 page"
      ]
    },
    "standard": {
      "title": "Growth",
      "description": "Growth package",
      "price": 8500,
      "deliveryDays": 4,
      "revisions": 2,
      "features": [
        "3 sections"
      ]
    },
    "premium": {
      "title": "Scale",
      "description": "Scale package",
      "price": 22000,
      "deliveryDays": 7,
      "revisions": -1,
      "features": [
        "5 pages"
      ]
    }
  },
  "status": "draft"
}
```

**`PATCH /gigs/:gigId/status`**

Example body:

```json
{
  "status": "published"
}
```

## Freelancers

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/freelancers/:freelancerId` | Public | Public profile with published gigs and portfolio |

## Profile

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile/me` | Logged in | Your user record and freelancer profile |
| `PUT` | `/profile/account` | Logged in | Update name, company and focus |
| `PUT` | `/profile/freelancer` | Freelancer only | Update the public freelancer profile |
| `POST` | `/profile/avatar` | Logged in | Upload a profile photo (multipart field: image) |

**`PUT /profile/account`**

Example body:

```json
{
  "firstName": "Test",
  "lastName": "User",
  "companyName": "Acme",
  "domainFocus": "Fullstack"
}
```

**`PUT /profile/freelancer`**

Example body:

```json
{
  "title": "Full-stack engineer",
  "bio": "I build web apps.",
  "location": "Berlin, Germany",
  "experienceYears": 5,
  "hourlyRate": 80,
  "skills": [
    "React",
    "Node.js"
  ],
  "languages": [
    {
      "name": "English",
      "level": "fluent"
    }
  ],
  "workHistory": [
    {
      "title": "Engineer",
      "company": "Acme",
      "startYear": 2020,
      "endYear": null
    }
  ]
}
```

## Portfolio

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/portfolio/mine` | Freelancer only | Your portfolio projects |
| `POST` | `/portfolio` | Freelancer only | Add a project |
| `PUT` | `/portfolio/:projectId` | Freelancer only | Update a project |
| `DELETE` | `/portfolio/:projectId` | Freelancer only | Delete a project |

**`POST /portfolio`**

Example body:

```json
{
  "title": "My project",
  "description": "A short description of this project.",
  "industry": "SaaS",
  "metric": "+40% conversion",
  "durationWeeks": 8,
  "deliverables": [
    "Design system"
  ],
  "externalLink": "https://example.com",
  "images": []
}
```

**`PUT /portfolio/:projectId`**

Example body:

```json
{
  "title": "My project v2",
  "description": "An updated description of this project."
}
```

## Uploads

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/uploads/image?purpose=gig` | Logged in | Upload an image to Cloudinary (purpose: gig | portfolio; field: image; max 5 MB) |
| `POST` | `/uploads/file` | Logged in | Upload a deliverable or attachment (field: file; max 25 MB) |

## Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Client only | Checkout. The price comes from the gig package, never from the request |
| `GET` | `/orders` | Logged in | Your orders (as client or freelancer) with status counts |
| `GET` | `/orders/:orderId` | Logged in | Order detail, payment, review and your permitted next actions (404 for non-participants) |
| `POST` | `/orders/:orderId/accept` | Freelancer only | pending -> in_progress |
| `POST` | `/orders/:orderId/deliver` | Freelancer only | in_progress | revision_requested -> delivered |
| `POST` | `/orders/:orderId/revision` | Client only | delivered -> revision_requested (uses one revision) |
| `POST` | `/orders/:orderId/complete` | Client only | delivered -> completed and release the simulated escrow |
| `POST` | `/orders/:orderId/cancel` | Logged in | Cancel and refund. Client only while pending; freelancer while pending, in progress or revision |

**`POST /orders`**

Example body:

```json
{
  "gigId": "<gigId>",
  "tier": "standard",
  "requirements": "Please build a responsive landing page with a pricing section.",
  "attachments": []
}
```

**`GET /orders`**

Query parameters:

```json
{
  "status": "in_progress,delivered",
  "q": "GC-",
  "page": 1,
  "limit": 10
}
```

**`POST /orders/:orderId/deliver`**

Example body:

```json
{
  "message": "First delivery attached.",
  "files": [
    {
      "url": "https://example.com/v1.zip",
      "name": "v1.zip",
      "size": 1024
    }
  ]
}
```

**`POST /orders/:orderId/revision`**

Example body:

```json
{
  "message": "Please adjust the hero spacing."
}
```

**`POST /orders/:orderId/cancel`**

Example body:

```json
{
  "reason": "Changed my mind about scope."
}
```

## Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/payments/mine` | Logged in | Simulated payment records and escrow/earnings summary |

**`GET /payments/mine`**

Query parameters:

```json
{
  "page": 1,
  "limit": 10
}
```

## Reviews

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/reviews?gig=:gigId` | Public | Reviews and rating summary for a gig (or use ?freelancer=<userId>) |
| `GET` | `/reviews/mine` | Client only | Reviews you wrote and completed orders still waiting for one |
| `POST` | `/reviews` | Client only | Review a completed order (one review per order) |
| `POST` | `/reviews/:reviewId/reply` | Freelancer only | Reply to a review of your work |
| `POST` | `/reviews/:reviewId/report` | Logged in | Report an inappropriate review (stored for moderation) |

**`GET /reviews?gig=:gigId`**

Query parameters:

```json
{
  "sort": "recent",
  "page": 1,
  "limit": 5
}
```

**`POST /reviews`**

Example body:

```json
{
  "orderId": "<orderId>",
  "rating": 5,
  "comment": "Solid work and clear communication."
}
```

**`POST /reviews/:reviewId/reply`**

Example body:

```json
{
  "text": "Thank you for the kind words!"
}
```

**`POST /reviews/:reviewId/report`**

Example body:

```json
{
  "reason": "Contains abusive language."
}
```

## Favorites

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/favorites/ids` | Logged in | Ids of saved gigs (to paint the hearts) |
| `GET` | `/favorites` | Logged in | Saved gigs, paginated |
| `POST` | `/favorites` | Logged in | Save a gig (idempotent) |
| `DELETE` | `/favorites/:gigId` | Logged in | Remove a saved gig |

**`GET /favorites`**

Query parameters:

```json
{
  "page": 1,
  "limit": 12
}
```

**`POST /favorites`**

Example body:

```json
{
  "gigId": "<gigId>"
}
```

## Conversations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/conversations` | Logged in | Start or reopen a conversation. Provide exactly one of orderId, gigId (clients) or freelancerId (clients) |
| `GET` | `/conversations` | Logged in | Your conversations with unread counts |
| `GET` | `/conversations/unread-count` | Logged in | Total unread messages (navbar badge) |
| `GET` | `/conversations/:conversationId/messages` | Logged in | Messages, oldest to newest. Use ?before=<messageId>&limit=30 for earlier ones |
| `POST` | `/conversations/:conversationId/messages` | Logged in | Send a message (rate limited) |
| `POST` | `/conversations/:conversationId/read` | Logged in | Mark the conversation as read |

**`POST /conversations`**

Example body:

```json
{
  "orderId": "<orderId>"
}
```

**`POST /conversations/:conversationId/messages`**

Example body:

```json
{
  "text": "Hello!",
  "attachments": []
}
```

## Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/client` | Client only | Client stats computed from real data |
| `GET` | `/dashboard/freelancer` | Freelancer only | Freelancer stats, 6-month earnings and top gigs |

## Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin only | Platform counts and moderation queue size |
| `GET` | `/admin/reviews` | Admin only | Reviews by moderation state |
| `PATCH` | `/admin/reviews/:reviewId/visibility` | Admin only | Hide or restore a review (ratings are recalculated). A reason of 5+ characters is required to hide |
| `POST` | `/admin/reviews/:reviewId/dismiss-reports` | Admin only | Clear the reports on a review |
| `GET` | `/admin/users` | Admin only | Search users |
| `PATCH` | `/admin/users/:targetUserId/status` | Admin only | Suspend or reactivate a user. Suspending pauses their published gigs. A reason is required to suspend |
| `GET` | `/admin/log` | Admin only | Moderation activity log |

**`GET /admin/reviews`**

filter: reported | hidden | all

Query parameters:

```json
{
  "filter": "reported",
  "page": 1,
  "limit": 8
}
```

**`PATCH /admin/reviews/:reviewId/visibility`**

Example body:

```json
{
  "hidden": true,
  "reason": "Contains abusive language."
}
```

**`POST /admin/reviews/:reviewId/dismiss-reports`**

Example body:

```json
{
  "reason": "Reports reviewed, no violation."
}
```

**`GET /admin/users`**

Query parameters:

```json
{
  "q": "elena",
  "role": "freelancer",
  "status": "suspended",
  "page": 1,
  "limit": 15
}
```

**`PATCH /admin/users/:targetUserId/status`**

Example body:

```json
{
  "isActive": false,
  "reason": "Repeated policy violations."
}
```

**`GET /admin/log`**

Query parameters:

```json
{
  "page": 1,
  "limit": 20
}
```

## Public

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/public/stats` | Public | Platform totals and one short public review quote (cached for 60 seconds) |

