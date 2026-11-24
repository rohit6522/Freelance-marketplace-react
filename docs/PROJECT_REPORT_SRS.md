# GigCraft

## SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

### *A Full-Stack India-Focused Freelance Marketplace Web Application*

### **Course Code: 252**
### **Course Name: INT**
### **Continuous Assessment 3 (Autumn 2026)**

---

| Student Name | Registration No |
|---|---|
| **Rohit Kumar** | **12400392** |
| **Ajad Bharti** | **12400390** |
| **Utkarsh** | **12400782** |

---

## Document Control

| Item | Details |
|---|---|
| **Project Name** | GigCraft — Freelance Gig Marketplace |
| **Document Type** | Software Requirements Specification (SRS) |
| **Course Code / Name** | 252 / INT |
| **Assessment** | Continuous Assessment 3 (CA3), Autumn 2026 |
| **Version** | 3.0 (Final Academic Release) |
| **Status** | Approved & Complete |
| **Repository** | [https://github.com/rohit6522/Freelance-marketplace-react](https://github.com/rohit6522/Freelance-marketplace-react) |
| **Deployed Link** | [https://freelance-marketplace-react.onrender.com/explore](https://freelance-marketplace-react.onrender.com/explore) |

---

## Revision History

| Version | Date | Description | Author(s) |
|---|---|---|---|
| 1.0 | 05-11-2026 | Initial baseline SRS draft covering architecture, schemas, and MVP features | Rohit Kumar, Ajad Bharti |
| 2.0 | 18-11-2026 | Added complete India-focused localization (₹ INR, en-IN formatting, IST, Indian profiles) | Rohit Kumar, Ajad Bharti, Utkarsh |
| 3.0 | 24-11-2026 | Integrated Firebase Google OAuth with dynamic role selection, Helmet COOP/CSP policies, and CA3 submission requirements | Rohit Kumar, Ajad Bharti, Utkarsh |

---

## Table of Contents

- [Revision History](#revision-history)
- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
  - [1.4 References](#14-references)
  - [1.5 Overview](#15-overview)
- [2. General Description](#2-general-description)
  - [2.1 Product Perspective](#21-product-perspective)
  - [2.2 Product Functions](#22-product-functions)
  - [2.3 User Characteristics](#23-user-characteristics)
  - [2.4 General Constraints](#24-general-constraints)
  - [2.5 Assumptions and Dependencies](#25-assumptions-and-dependencies)
- [3. Specific Requirements](#3-specific-requirements)
  - [3.1 External Interface Requirements](#31-external-interface-requirements)
    - [3.1.1 User Interfaces](#311-user-interfaces)
    - [3.1.2 Hardware Interfaces](#312-hardware-interfaces)
    - [3.1.3 Software Interfaces](#313-software-interfaces)
    - [3.1.4 Communications Interfaces](#314-communications-interfaces)
  - [3.2 Functional Requirements](#32-functional-requirements)
    - [3.2.1 Feature 1: User Authentication & Role-Based Access Control (with Google OAuth)](#321-feature-1-user-authentication--role-based-access-control-with-google-oauth)
    - [3.2.2 Feature 2: Indian Freelance Gig Catalog, Search & Tiered Pricing (₹ INR)](#322-feature-2-indian-freelance-gig-catalog-search--tiered-pricing--inr)
    - [3.2.3 Feature 3: Deterministic Milestone Contracts & Simulated Escrow Lifecycle](#323-feature-3-deterministic-milestone-contracts--simulated-escrow-lifecycle)
    - [3.2.4 Feature 4: Real-Time Bi-Directional Client-Freelancer Messaging (Socket.IO)](#324-feature-4-real-time-bi-directional-client-freelancer-messaging-socketio)
    - [3.2.5 Feature 5: Review & Rating Ecosystem with Admin Moderation](#325-feature-5-review--rating-ecosystem-with-admin-moderation)
  - [3.5 Non-Functional Requirements](#35-non-functional-requirements)
    - [3.5.1 Performance](#351-performance)
    - [3.5.2 Reliability](#352-reliability)
    - [3.5.3 Availability](#353-availability)
    - [3.5.4 Security](#354-security)
    - [3.5.5 Maintainability](#355-maintainability)
    - [3.5.6 Portability](#356-portability)
  - [3.7 Design Constraints](#37-design-constraints)
  - [3.9 Other Requirements](#39-other-requirements)
- [4. Analysis Models](#4-analysis-models)
  - [4.1 Data Flow Diagrams (DFD)](#41-data-flow-diagrams-dfd)
    - [4.1.1 Level 0 DFD (Context Level)](#411-level-0-dfd-context-level)
    - [4.1.2 Level 1 DFD (Decomposition of System Processes)](#412-level-1-dfd-decomposition-of-system-processes)
    - [4.1.3 Level 2 DFD (Order Execution & Escrow Processing)](#413-level-2-dfd-order-execution--escrow-processing)
- [5. GitHub Link](#5-github-link)
- [6. Deployed Link](#6-deployed-link)
- [7. Appendices](#7-appendices)
  - [Appendix A: UI Walkthrough & Verification Screenshots](#appendix-a-ui-walkthrough--verification-screenshots)
  - [Appendix B: Database Schemas (Mongoose ODM Models)](#appendix-b-database-schemas-mongoose-odm-models)

---

# 1. Introduction

The introduction to this Software Requirements Specification (SRS) document provides an overview of the complete GigCraft web application. This document adheres to the IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830-1998) to comprehensively specify the functional, non-functional, interface, and structural requirements of the platform.

### 1.1 Purpose
The purpose of this SRS is to formally specify the technical architecture, behavioral characteristics, functional capabilities, and design constraints of **GigCraft** for academic assessment in Course 252 (INT) Continuous Assessment 3 (Autumn 2026). The intended audience includes software engineering instructors, project evaluators, academic peers, and full-stack developers reviewing or extending the platform.

### 1.2 Scope
* **Software Product Name:** GigCraft (Freelance Gig Marketplace)
* **What the Software Does:**
  * Connects Indian technical talent (freelancers, developers, designers) with business clients and startups.
  * Allows freelancers to publish multi-tier service gigs (Basic, Standard, Premium) priced in Indian Rupees (`₹` INR).
  * Implements a deterministic order lifecycle governed by simulated escrow contracts that protect both client and seller.
  * Enables bi-directional real-time chat, typing indicators, and delivery attachments via WebSockets.
  * Provides Google OAuth authentication through Firebase alongside traditional email/password credentials.
  * Enforces localized Indian formatting (`en-IN` locale, Indian phone number validation, IST timestamps).
* **What the Software Will Not Do:**
  * The software is an **academic simulation** and does not conduct live fiat banking transactions or collect credit card details.
  * It does not act as a legal arbitration authority or tax collection platform.

### 1.3 Definitions, Acronyms, and Abbreviations
* **SRS:** Software Requirements Specification
* **MERN:** MongoDB, Express.js, React.js, Node.js
* **JWT:** JSON Web Token
* **OAuth:** Open Authorization (specifically Google OAuth 2.0 via Firebase Auth)
* **CSP:** Content Security Policy
* **COOP:** Cross-Origin-Opener-Policy
* **DFD:** Data Flow Diagram
* **ODM:** Object Data Modeling (Mongoose)
* **Escrow (Simulated):** A trust-mechanism where client funds are held in a pending state until deliverables are reviewed and accepted.
* **Gig:** A packaged service listing published by a freelancer with defined deliverables, turnaround times, and pricing.

### 1.4 References
1. IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830-1998).
2. React 19 & Vite Official Documentation ([https://vitejs.dev/](https://vitejs.dev/)).
3. Express.js & Node.js Runtime Specifications ([https://expressjs.com/](https://expressjs.com/)).
4. MongoDB Atlas Manual & Mongoose Schema Documentation ([https://mongoosejs.com/](https://mongoosejs.com/)).
5. Firebase Authentication Web SDK v13 ([https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)).
6. RFC 7519: JSON Web Token (JWT) Standard.

### 1.5 Overview
The remainder of this SRS describes the product perspective, target users, operational constraints, and assumptions in Section 2. Section 3 details the external interfaces, detailed functional requirements with input/processing/output/error specifications, and non-functional requirements. Section 4 provides architectural Data Flow Diagrams (DFD Level 0, 1, and 2). Sections 5 and 6 provide verified repository and live deployment endpoints. Section 7 presents supplementary evidence and database models.

---

# 2. General Description

### 2.1 Product Perspective
GigCraft is a self-contained, cloud-hosted web application operating on a client-server architecture:
* **Frontend:** Single-page application (SPA) built using React 19, Tailwind CSS v4, and Vite.
* **Backend:** RESTful API and WebSocket microservice built on Node.js and Express 5.
* **Persistence:** Cloud-hosted MongoDB Atlas cluster with multi-document ACID transactions.
* **Cloud Integrations:** Cloudinary for asset storage, Firebase for Google identity provider federation.

### 2.2 Product Functions
1. **User Identity & Multi-Role Governance:** Secure registration as Client, Freelancer, or Administrator with JWT HTTP-only cookie sessions and Firebase Google OAuth.
2. **Gig Management:** Freelancer authoring of three-tiered service packages, rich markdown descriptions, search tags, and thumbnail media.
3. **Marketplace Discovery:** Category-driven catalog exploration, keyword search, price range filtering in ₹ INR, and seller tier sorting.
4. **Order Execution Pipeline:** Deterministic state machine (`pending` → `in_progress` → `delivered` → `completed` or `cancelled`) with simulated escrow fund allocation.
5. **Real-Time Collaboration:** Socket.IO WebSocket messaging, active typing indicators, unread badges, and attachment sharing.
6. **Reputation & Moderation:** Verified post-order review submissions, mathematical recalculation of aggregate star ratings, and administrator moderation queues.

### 2.3 User Characteristics
* **Client (Buyer):** Individuals, founders, or business managers seeking digital services. Expected to have standard web literacy.
* **Freelancer (Seller):** Technical professionals, designers, and developers offering services. They maintain a public portfolio, track earnings, and deliver completed assets.
* **Administrator:** Platform maintainers managing user suspensions, reviewing reported content, and monitoring system telemetry.

### 2.4 General Constraints
1. **Security Standards:** Passwords must be hashed using bcrypt (12 rounds). Session cookies must enforce `httpOnly`, `SameSite=lax`, and `secure` in production.
2. **Zero Commercial Liability:** Payments are strictly simulated in an educational milestone escrow ledger; no real financial transactions take place.
3. **Locale Constraints:** Currency is locked to `₹` INR using `Intl.NumberFormat('en-IN')`; dates display in Asia/Kolkata (IST).
4. **Platform Compatibility:** Operates in all modern evergreen browsers (Chrome, Edge, Firefox, Safari) across mobile, tablet, and desktop viewports.

### 2.5 Assumptions and Dependencies
* **Network Connectivity:** Persistent HTTPS connection is required for API interactions; WebSocket falls back to HTTP long-polling if WebSockets are restricted.
* **Third-Party Availability:** Relies on MongoDB Atlas for data persistence, Firebase for Google OAuth token issuance, and Cloudinary for media CDN delivery.

---

# 3. Specific Requirements

## 3.1 External Interface Requirements

### 3.1.1 User Interfaces
* **Design Philosophy:** Neo-brutalist modern editorial styling characterized by crisp borders, high-contrast dark accents (`#0b1c30`), deep emerald primary buttons (`#005d42`), and 2px solid drop-shadows.
* **Typography:** `Space Grotesk` for all display titles and brand elements; `Geist` for body copy, data tables, and input forms.
* **Responsive Layout:** Mobile-first responsive grids constructed with Tailwind CSS v4 adapting fluidly from 320px mobile viewports to 4K displays.

### 3.1.2 Hardware Interfaces
* No dedicated hardware required. Client devices require an internet-enabled computer or smartphone with at least 1 GB RAM and standard display drivers.

### 3.1.3 Software Interfaces
* **Operating Systems:** Windows 10/11, macOS, Linux, Android, iOS.
* **Browser Compatibility:** Google Chrome 90+, Microsoft Edge 90+, Mozilla Firefox 88+, Safari 14+.
* **Database Interface:** MongoDB Driver v6 via Mongoose ODM v9.
* **Identity Provider Interface:** Google Identity Services via Firebase Web SDK v13.

### 3.1.4 Communications Interfaces
* **Protocol:** HTTPS (TLS 1.3) for all RESTful transactions.
* **Real-time Protocol:** WSS (WebSocket Secure) with fallback to HTTP polling for Socket.IO v4.
* **Data Interchange Format:** JSON (`application/json`) with strict schema validation on all inputs.

---

## 3.2 Functional Requirements

### 3.2.1 Feature 1: User Authentication & Role-Based Access Control (with Google OAuth)
* **3.2.1.1 Introduction:** Enables users to create accounts, authenticate credentials, federate identities via Google OAuth, and receive role-authorized JWT session cookies.
* **3.2.1.2 Inputs:**
  * Manual: First Name, Last Name, Email, Password, Account Role (`client` or `freelancer`).
  * Google OAuth: Firebase ID Token, Email, Display Name, Profile Photo URL, Selected Role.
* **3.2.1.3 Processing:**
  1. Validates email format and enforces strong password criteria (min 8 chars, letter + number).
  2. For Google OAuth: decodes Firebase ID Token claims, verifies issuer and audience, matches existing record or initiates new user provisioning.
  3. Hashes traditional passwords using `bcrypt.hash(password, 12)`.
  4. Generates a signed JWT payload `{ id: user._id }` with a 7-day expiration.
  5. Sets an `httpOnly`, `SameSite=lax` cookie on the HTTP response.
* **3.2.1.4 Outputs:** Authenticated user profile JSON, `token` cookie, and automated redirection to role-specific dashboard.
* **3.2.1.5 Error Handling:** Returns 409 Conflict for duplicate emails, 401 Unauthorized for invalid credentials, and 400 Bad Request for malformed tokens.

### 3.2.2 Feature 2: Indian Freelance Gig Catalog, Search & Tiered Pricing (₹ INR)
* **3.2.2.1 Introduction:** Allows freelancers to author multi-tiered service offerings and enables clients to search, filter, and inspect service listings.
* **3.2.2.2 Inputs:** Category ID, price range bounds (min/max in ₹ INR), delivery time filter, search keyword query, sorting criteria (`popular`, `rating`, `price_asc`, `price_desc`).
* **3.2.2.3 Processing:**
  1. Executes MongoDB aggregation pipelines with `$match`, `$text` search, and indexed filtering.
  2. Formats all financial numbers through the Indian locale (`en-IN`) prepending the `₹` symbol (e.g., `₹15,000`).
  3. Attaches seller reputation aggregates (average star rating and completed order counts).
* **3.2.2.4 Outputs:** Paginated JSON list of gig cards, metadata count, and active category tags.
* **3.2.2.5 Error Handling:** Returns 404 for invalid category slugs; returns empty result lists with contextual suggestions for zero search matches.

### 3.2.3 Feature 3: Deterministic Milestone Contracts & Simulated Escrow Lifecycle
* **3.2.3.1 Introduction:** Governs order creation, execution, deliverable submissions, and simulated escrow release through a formal state machine.
* **3.2.3.2 Inputs:** Gig ID, selected package tier (`basic`, `standard`, `premium`), project requirements text, optional attachment URLs.
* **3.2.3.3 Processing:**
  1. Verifies buyer has `client` role and seller has `freelancer` role.
  2. Creates order record in `pending` state; creates simulated payment record in `held` status within an atomic MongoDB replica transaction.
  3. Enforces transition constraints: only seller can accept (`in_progress`) or submit deliverables (`delivered`); only client can request revisions or approve completion (`completed`).
  4. On client approval, state changes to `completed` and simulated escrow funds transition from `held` to `released`.
* **3.2.3.4 Outputs:** Updated order record, milestone timeline entry, transaction status, and automated Socket.IO status event.
* **3.2.3.5 Error Handling:** Returns 409 Conflict if an illegal transition is attempted (e.g. attempting to deliver a cancelled order).

### 3.2.4 Feature 4: Real-Time Bi-Directional Client-Freelancer Messaging (Socket.IO)
* **3.2.4.1 Introduction:** Facilitates direct, private threaded communication between clients and freelancers regarding order requirements and project coordination.
* **3.2.4.2 Inputs:** Recipient User ID, Order Context ID (optional), text message body, file attachment metadata.
* **3.2.4.3 Processing:**
  1. Validates sender session cookie upon WebSocket handshake.
  2. Joins client socket to a dedicated private user room (`user_<userId>`).
  3. Persists message document in MongoDB with timestamp.
  4. Emits `new_message` event to recipient's room; broadcasts typing indicators with automatic debounce.
* **3.2.4.4 Outputs:** Real-time delivered message bubble, updated unread badge counter, and audio/visual chat notification.
* **3.2.4.5 Error Handling:** Reconnects automatically on network dropouts; buffers messages and falls back to HTTP long-polling if WebSockets are blocked.

### 3.2.5 Feature 5: Review & Rating Ecosystem with Admin Moderation
* **3.2.5.1 Introduction:** Provides transparent peer feedback post-delivery and gives administrators tools to moderate abusive or spam reviews.
* **3.2.5.2 Inputs:** Order ID, numerical rating (1 to 5 stars), written review text, admin moderation flag.
* **3.2.5.3 Processing:**
  1. Validates that caller is the client of the specific order and that order status is strictly `completed`.
  2. Ensures idempotency: exactly one review permitted per completed order.
  3. Recalculates seller average rating and total review counts mathematically across all visible reviews.
  4. Admins can flag, hide, or restore reviews with an audited moderation reason log.
* **3.2.5.4 Outputs:** Published review card on gig detail page and recalculated seller star badge.
* **3.2.5.5 Error Handling:** Returns 403 Forbidden if a client attempts to review an incomplete order or a non-participant attempts to submit feedback.

---

## 3.5 Non-Functional Requirements

### 3.5.1 Performance
* **API Response Time:** 95% of read requests must complete in under 150 ms; write requests with database transaction commits must complete in under 300 ms.
* **Bundle Footprint:** Frontend JavaScript bundle must be code-split into asynchronous chunks with total compressed initial load under 350 KB gzip.

### 3.5.2 Reliability
* **Data Integrity:** All order status transitions and payment disbursements must execute within ACID-compliant MongoDB transactions to prevent orphaned state.
* **Mean Time Between Failures (MTBF):** System designed for continuous operational stability with automatic health checks (`/api/health`).

### 3.5.3 Availability
* Target uptime of 99.5% on cloud infrastructure (Render free-tier instances sleep on idle and automatically wake within 30–60 seconds of incoming HTTP requests).

### 3.5.4 Security
* **Session Protection:** All JWT tokens stored exclusively in `httpOnly`, `secure`, `SameSite=lax` cookies to completely eliminate Cross-Site Scripting (XSS) token theft.
* **Helmet CSP & COOP:** Content Security Policy strictly controls script, frame, and connect sources (`apis.google.com`, `firebaseapp.com`), while `same-origin-allow-popups` ensures secure OAuth handshakes.
* **Injection Defense:** Custom `sanitizeBody` middleware recursively strips all MongoDB query operators (`$gt`, `$where`, etc.) from incoming payloads.

### 3.5.5 Maintainability
* **Modular Codebase:** Strict separation of concerns into Controller-Service-Model layers on the backend, and Components-Hooks-Contexts on the frontend.
* **Automated Test Coverage:** Continuous integration runs 105 frontend tests and 18 backend tests on every git push.

### 3.5.6 Portability
* Node.js runtime and Vite tooling ensure cross-platform reproducibility on Windows, Linux, and macOS without platform-specific binary dependencies.

---

## 3.7 Design Constraints
* **Monolithic Single-Service Deployment:** In production, Express directly serves the pre-compiled `client/dist` assets on a single unified origin to prevent third-party cross-site cookie restrictions.
* **Stateless API:** The server maintains no in-memory user sessions, ensuring horizontal scalability across container instances.

---

## 3.9 Other Requirements
* **Regulatory & Privacy Conformance:** Provides transparent Terms of Service, Privacy Policy, Community Guidelines, and self-service account deletion under Account Settings.

---

# 4. Analysis Models

## 4.1 Data Flow Diagrams (DFD)

### 4.1.1 Level 0 DFD (Context Level)
The Context-Level DFD illustrates the boundary of the GigCraft system and the data flows between external entities (Clients, Freelancers, Administrators, and Firebase OAuth) and the centralized platform.

```
+------------------+                    +-------------------------+
|                  | --- Search Gigs -> |                         |
|      CLIENT      | --- Place Order -> |                         |
|      (Buyer)     | --- Release Escrow |                         |
|                  | <-- Delivery Files |                         |
+------------------+                    |                         |
                                        |                         |
+------------------+                    |        GIGCRAFT         |
|                  | --- Publish Gig -> |       MARKETPLACE       |
|    FREELANCER    | --- Submit Work -> |      CORE SYSTEM        |
|     (Seller)     | <-- Escrow Released|                         |
|                  | <-> Live Chat Messages                       |
+------------------+                    |                         |
                                        |                         |
+------------------+                    |                         |
|     FIREBASE     | --- Verify Token-> |                         |
|   GOOGLE OAUTH   | <-- Issue Identity |                         |
+------------------+                    |                         |
                                        |                         |
+------------------+                    |                         |
|  ADMINISTRATOR   | --- Moderate Review|                         |
|                  | <-- Telemetry Logs |                         |
+------------------+                    +-------------------------+
                                                     |
                                                     v
                                        +-------------------------+
                                        |      MONGODB ATLAS      |
                                        |       DATA STORES       |
                                        +-------------------------+
```

### 4.1.2 Level 1 DFD (Decomposition of System Processes)
The Level 1 DFD decomposes the central system into five core functional sub-processes:

```
[ User / Google ]
       |
       v
 ( 1.0 Authentication & Session Management ) <=====> [ D1: Users & Profiles Store ]
       |
       +------------+
       |            |
       v            v
 ( 2.0 Gig Authoring & Catalog Search ) <==========> [ D2: Gigs & Categories Store ]
       |
       v
 ( 3.0 Order Processing & Simulated Escrow ) <=====> [ D3: Orders & Escrow Ledger ]
       |
       +------------+
       |            |
       v            v
 ( 4.0 Real-Time Messaging & Notifications ) <=====> [ D4: Conversations & Messages ]
       |
       v
 ( 5.0 Peer Review & Admin Moderation ) <==========> [ D5: Reviews & Moderation Log ]
```

### 4.1.3 Level 2 DFD (Order Execution & Escrow Processing)
Detailed analysis of the stateful Order & Escrow process (Process 3.0):

```
Client Placed Order
       |
       v
[ 3.1 Validate & Lock Escrow ] -----> Record Payment in D3 (Status: Held)
       |
       v
[ 3.2 Seller Accepts Order ] -------> Order Status: in_progress
       |
       v
[ 3.3 Submit Deliverables ] --------> Order Status: delivered (Files Uploaded)
       |
       +-----------------------+
       |                       |
       v                       v
[ 3.4 Request Revisions ]    [ 3.5 Client Approves Delivery ]
 (Status: revision_req)                |
                                       v
                             [ 3.6 Release Escrow ]
                              (Payment: released)
                              (Order: completed)
```

---

# 5. GitHub Link

The complete source code, git history, client/server modules, and automated tests are hosted at:

🔗 **GitHub Repository:**  
[https://github.com/rohit6522/Freelance-marketplace-react](https://github.com/rohit6522/Freelance-marketplace-react)

---

# 6. Deployed Link

The live, fully functional cloud application is deployed on Render and accessible worldwide at:

🌐 **Live Deployed Application:**  
[https://freelance-marketplace-react.onrender.com/explore](https://freelance-marketplace-react.onrender.com/explore)

---

# 7. Appendices

### Appendix A: UI Walkthrough & Verification Screenshots
* **Marketplace Discovery (`/explore`):** Dynamic multi-attribute filtering by category, price slider in `₹` INR, seller rating, and delivery speed.
* **Authentication Modal (`/login` & `/register`):** 1-click Firebase Google OAuth with interactive archetype selector (Client vs Freelancer).
* **Order Management Workspace (`/orders`):** Visual timeline tracker showing current order state, active countdown timer, revision requests, and deliverable downloads.
* **Seller Analytics Dashboard (`/dashboard`):** Real metrics indicating completed orders, positive review percentages, and 6-month simulated earnings in Indian currency (`₹`).

### Appendix B: Database Schemas (Mongoose ODM Models)
The system data layer comprises 12 interconnected Mongoose schemas:
1. **User Schema:** Identity attributes, `googleId`, hashed password, role (`client`, `freelancer`, `admin`), active status.
2. **FreelancerProfile Schema:** Professional title, bio, location (e.g. `Bengaluru, Karnataka`), technical skills, languages, work experience.
3. **Gig Schema:** Title, slug, category ref, images, multi-tier pricing (`basic`, `standard`, `premium` packages in `₹`), aggregate rating.
4. **Order Schema:** Buyer ref, seller ref, gig ref, package tier, agreed price, requirements, deliverables list, status machine.
5. **Payment Schema:** Transaction reference, escrow status (`held`, `released`, `refunded`), timestamp.
6. **Review Schema:** Order ref, gig ref, author ref, star rating (1-5), comment, seller reply.
7. **Conversation & Message Schemas:** Participant refs, message content, attachments, read receipts.
8. **Category Schema:** Canonical service taxonomy (Web Development, UI/UX, AI/ML, Video Animation, etc.).
