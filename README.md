# 🇮🇳 GigCraft — Freelance Gig Marketplace

> A full-stack, India-focused freelance marketplace connecting clients and freelancers under deterministic milestone contracts. Built with React, Node.js, Express, MongoDB, and Tailwind CSS.

🌐 **Live Demo:** [freelance-marketplace-react.onrender.com](https://freelance-marketplace-react.onrender.com)  
📂 **GitHub Repository:** [github.com/rohit6522/Freelance-marketplace-react](https://github.com/rohit6522/Freelance-marketplace-react)

---

## ⚡ Key Highlights

* **🇮🇳 India-Focused Localization:** Full Indian Rupee (`₹` INR) currency displays with `en-IN` number formatting, IST timestamps, and realistic Indian demo profiles and locations.
* **🔐 Google OAuth & Secure Auth:** Instant 1-click signup & login via Firebase Google Auth with smart role selection (Client vs. Freelancer) alongside traditional bcrypt + HTTP-only JWT cookies.
* **💼 Dual-Role Experience:**
  * **Clients:** Browse gigs, compare packages (Basic/Standard/Premium), place milestone orders, release escrow on delivery, and leave ratings.
  * **Freelancers:** Build public profiles & technical portfolios, publish multi-tier service gigs, deliver work files, and track real earnings metrics.
* **🛡️ Simulated Escrow Contracts:** Safe demo escrow system that locks funds until the client formally approves deliverables.
* **💬 Real-Time Collaboration:** Instant messaging and live order status notifications powered by Socket.IO.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router, Tailwind CSS v4, React Hook Form, Lucide Icons |
| **Backend** | Node.js, Express 5, Socket.IO, Helmet, Express-Validator, Rate Limiting |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | Firebase Authentication (Google OAuth), JWT (HTTP-only cookies), Bcrypt |
| **Media & Storage** | Cloudinary (Image & deliverable uploads) |
| **Testing & CI/CD** | Vitest, React Testing Library, Node Test Runner, GitHub Actions |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rohit6522/Freelance-marketplace-react.git
cd Freelance-marketplace-react

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gigcraft
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
```
Create `.env` inside `client/`:
```env
VITE_API_URL=
VITE_CONTACT_EMAIL=support@gigcraft.in

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC7W__Et-4yqjyjDQBzEtmUU-omdTkrr1A
VITE_FIREBASE_AUTH_DOMAIN=gigcraft-marketplace.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gigcraft-marketplace
VITE_FIREBASE_STORAGE_BUCKET=gigcraft-marketplace.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=207597155969
VITE_FIREBASE_APP_ID=1:207597155969:web:57f1e3b52e1b9a3c6e3f80
VITE_FIREBASE_MEASUREMENT_ID=G-FQ9NBLY1YC
```

### 3. Initialize Database & Run
```bash
# Seed initial service categories
cd server && npm run seed:categories

# Start backend (Terminal 1 - http://localhost:5000)
cd server && npm run dev

# Start frontend (Terminal 2 - http://localhost:5173)
cd client && npm run dev
```

---

## 📁 Project Structure

```text
freelance-marketplace-react/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI, Auth, Gig, Orders, Chat, Dashboard
│   │   ├── contexts/       # AuthContext, RealtimeContext
│   │   ├── pages/          # Explore, GigDetail, Orders, Login, Register
│   │   └── config/         # Firebase Client SDK Configuration
├── server/                 # Express Backend
│   ├── src/
│   │   ├── models/         # User, Gig, Order, Payment, Review, Message
│   │   ├── controllers/    # Auth, Gigs, Orders, Profile, Realtime
│   │   ├── routes/         # REST API Route Declarations
│   │   └── middleware/     # Auth Guard, Validation, Helmet CSP
├── docs/                   # Postman Collections, API Specs & Project Reports
└── render.yaml             # Cloud Deployment Blueprint
```

---

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend test suite
cd client && npm test
```

---

## 👥 Contributors

* **Rohit Kumar** ([@rohit6522](https://github.com/rohit6522)) — Project Lead & Full-Stack Developer
* **Ajad Bharti** ([@Ajadbharti](https://github.com/Ajadbharti))
* **Utkarsh**

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
