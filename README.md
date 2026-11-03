# GigCraft: Freelance Gig Marketplace

A full-stack marketplace where freelancers sell digital services and clients discover, order, message and review them. Built with React, Express and MongoDB.

> **Payments are simulated.** Checkout holds the amount in a demo escrow and releases it on approval. No real money is ever charged. Some marketing panels on the login and register pages are labelled **DEMO DATA**.

## Features

**Clients:** browse and search gigs with server-side filters, save gigs, order a Basic/Standard/Premium package with requirements and attachments, track orders, request revisions, approve and release funds, message sellers, and review completed work.

**Freelancers:** public profile and portfolio, create/edit/publish/pause gigs with Cloudinary images, accept or reject orders, deliver files, handle revisions, see earnings and payout history, reply to or report reviews.

**Platform:** JWT cookie auth with roles, forgot/reset password, order workflow enforced on the server, ratings calculated from stored reviews, messaging between order participants, real dashboard analytics.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router, Tailwind CSS v4, React Hook Form, react-hot-toast |
| Backend | Node.js, Express, Mongoose, express-validator, helmet, express-rate-limit |
| Database | MongoDB Atlas |
| Auth | JWT in an httpOnly cookie, bcrypt |
| Files | Cloudinary (multer in memory) |

## Project structure

```
freelance-marketplace-react/
├── client/                 React app
│   └── src/ components · pages · layouts · contexts · hooks · services · utils · routes
├── server/                 Express API
│   ├── src/ config · models · controllers · routes · middleware · services · validators · utils · seed
│   ├── docs/endpoints.js   Single source for the API docs and Postman collection
│   └── scripts/            generate-docs.js · smoke-test.js
├── docs/                   Generated API.md and Postman collection
└── README.md
```

## Prerequisites

- Node.js 20 or newer (developed on Node 24)
- A **MongoDB Atlas** cluster (free tier is fine). Orders use MongoDB transactions, which need a replica set. A plain local `mongod` is not enough.
- A free **Cloudinary** account (needed only for image and file uploads)

## Setup

```bash
# 1. Install
cd server && npm install
cd ../client && npm install

# 2. Configure the server
cd ../server
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# edit .env: MONGO_URI, JWT_SECRET (48+ random chars), Cloudinary keys

# 3. Seed sample data (wipes the database)
npm run seed

# 4. Run (two terminals)
cd server && npm run dev    # API on http://localhost:5000
cd client && npm run dev    # App on http://localhost:5173
```

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

In Atlas, add your IP under **Network Access**.

### Test accounts (password for all: `Password123!`)

| Role | Email |
|---|---|
| Client | client@gigcraft.test |
| Freelancer | priya@gigcraft.test (UI/UX - Bengaluru, has an order in progress) |
| Freelancer | rahul@gigcraft.test (MERN/Next.js - Gurugram), ananya@gigcraft.test (Branding - Mumbai), arjun@gigcraft.test (Flutter - Ahmedabad), sneha@gigcraft.test (Tech Writing - New Delhi), rohit@gigcraft.test (3D/Motion - Pune) |

## Environment variables

`server/.env` (see `server/.env.example`):

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Atlas connection string (required) |
| `JWT_SECRET` | Token signing secret, 32+ chars in production (required) |
| `JWT_COOKIE_DAYS` | Cookie/session lifetime in days (default 7) |
| `CLIENT_URL` | Allowed CORS origin (default `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Uploads |
| `COOKIE_SAME_SITE` | `lax` (default). `none` only for a frontend on another domain |
| `TRUST_PROXY` | `1` when behind a proxy such as Render |
| `AUTH_RATE_LIMIT` / `API_RATE_LIMIT` | Requests per 15 minutes (defaults 20 / 300) |
| `SERVE_CLIENT` | `true` lets Express serve `client/dist` |

`client/.env` (optional): `VITE_API_URL` is only needed when the API is on a different domain.

## Scripts

| Where | Command | What it does |
|---|---|---|
| server | `npm run dev` | API with auto-reload |
| server | `npm start` | API (production) |
| server | `npm run seed` | Reset the database with sample data (refuses in production) |
| server | `npm run smoke` | End-to-end API smoke test (server must be running and seeded) |
| server | `npm run docs` | Regenerate `docs/API.md` and the Postman collection |
| client | `npm run dev` / `npm run build` | Dev server / production build |

## How it works

- **Auth:** login sets an httpOnly `token` cookie. The app restores the session through `GET /api/auth/me`. Protected and role-based routes exist on both client and server.
- **Order workflow:** one transition table on the server decides which status changes are allowed and who may make them:

  | From | To | Who |
  |---|---|---|
  | pending | in_progress, cancelled | freelancer, (client or freelancer) |
  | in_progress | delivered, cancelled | freelancer |
  | delivered | completed, revision_requested | client |
  | revision_requested | delivered, cancelled | freelancer |

- **Payments:** the server calculates the price from the gig package and ignores any client-supplied price or status. A simulated payment is created and held, released on completion, refunded on cancellation. All changes happen in a MongoDB transaction. Payment code lives in `server/src/services/payment.service.js`, separate from orders, so a real gateway can replace it later.
- **Ratings:** averages and counts are recalculated from stored reviews, never typed in.
- **Messaging:** only the two participants can read a conversation. The UI polls every 10 seconds. `messaging.service.js` emits an event per message, ready for a Socket.IO layer.
- **Uploads:** authenticated, rate limited, type and size restricted, file signatures checked, and namespaced per user. The server only deletes assets in the caller's own folder.

## API documentation

- Readable reference: [`docs/API.md`](docs/API.md)
- Postman: import [`docs/GigCraft.postman_collection.json`](docs/GigCraft.postman_collection.json), log in first, ids fill in automatically

## Testing

1. `npm run seed`, then start the server, then `npm run smoke` runs about 60 checks over auth, roles, the full order lifecycle, reviews, messaging, gig management, dashboards and security.
2. Manual UI pass: register as client and freelancer, publish a gig, order it, accept, deliver, request a revision, approve, review, reply, message, check both dashboards.

## Deployment (single service, e.g. Render)

1. Build command: `npm install --prefix client && npm run build --prefix client && npm install --prefix server`
2. Start command: `npm start --prefix server`
3. Environment: `NODE_ENV=production`, `SERVE_CLIENT=true`, `TRUST_PROXY=1`, `CLIENT_URL=https://<your-app>.onrender.com`, plus `MONGO_URI`, `JWT_SECRET` (32+ chars) and the Cloudinary keys.
4. Atlas Network Access must allow the host (use a strong database password).
5. Seed from your machine against the same `MONGO_URI` if you want sample data (the seed script refuses to run when `NODE_ENV=production`).

For a frontend on a different domain instead: set `VITE_API_URL`, `COOKIE_SAME_SITE=none` and serve both over HTTPS.

## Security notes

Passwords hashed with bcrypt (cost 12). httpOnly, SameSite cookies. Validation with express-validator on every route plus a body sanitizer for operator keys. Field whitelisting on updates. Ownership and participant checks on every private resource. Rate limits on auth, uploads and messaging. Helmet with a CSP. Secrets only in server environment variables. Errors don't leak internals in production.

## Known limitations

- Payments are simulated. There is no real gateway.
- Password reset emails are not sent. In development the reset link is printed in the server console.
- GitHub and Google sign-in buttons are visual only (shown in the design, not implemented).
- Reported reviews are stored, but there is no admin role or moderation screen.
- Messages refresh by polling, not websockets.
- Order progress is expressed through statuses and a lifecycle timeline, not a free-form percentage.
- Marketing panels on the auth pages show demo numbers and are labelled as such.
- Files uploaded to Cloudinary are reachable by anyone with the link.