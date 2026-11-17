# GigCraft

## SOFTWARE REQUIREMENTS SPECIFICATION

### *A Full-Stack Freelance Marketplace Web Application*

### **INT257**
### **Modern Web Application Development**

---

| Name | Registration No |
|---|---|
| **Rohit Kumar** | **12400392** |
| **Ajad Bharti** | **12400390** |
| **Utkarsh** | — |

---

## Document Control

| Item | Details |
|---|---|
| **Project** | GigCraft – Full-Stack Freelance Marketplace Web Application |
| **Document** | Software Requirements Specification (SRS) |
| **Version** | 1.0 |
| **Status** | Draft for academic submission |
| **Repository** | [https://github.com/Ajadbharti/freelance-gig-marketplace](https://github.com/Ajadbharti/freelance-gig-marketplace) |
| **Deployment** | [https://freelance-gig-marketplace.vercel.app/](https://freelance-gig-marketplace.vercel.app/) |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | November 2026 | Initial SRS prepared for GigCraft Freelance Marketplace | Rohit Kumar |

---

## Table of Contents

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
    - [3.2.1 Service Marketplace Catalogue and Filtering](#321-service-marketplace-catalogue-and-filtering)
    - [3.2.2 Gig Detail, Multi-Tier Packages and Specification](#322-gig-detail-multi-tier-packages-and-specification)
    - [3.2.3 Order Lifecycle, Milestones, and Work Submissions](#323-order-lifecycle-milestones-and-work-submissions)
    - [3.2.4 Real-Time In-App Messaging & Threaded Communication](#324-real-time-in-app-messaging--threaded-communication)
    - [3.2.5 User Authentication & Profile Management](#325-user-authentication--profile-management)
    - [3.2.6 Seller Dashboard, Performance Analytics & Reviews](#326-seller-dashboard-performance-analytics--reviews)
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
    - [4.1.1 Context-Level DFD (Level 0)](#411-context-level-dfd-level-0)
    - [4.1.2 Level 1 Process Breakdown](#412-level-1-process-breakdown)
    - [4.1.3 Main Data Stores](#413-main-data-stores)
- [5. GitHub Link](#5-github-link)
- [6. Deployed Link](#6-deployed-link)
- [A. Appendices](#a-appendices)
  - [A.1 Appendix 1 – Project Screenshots & UI Walkthrough](#a1-appendix-1--project-screenshots--ui-walkthrough)
  - [A.2 Appendix 2 – Technical Evidence & Database Schemas](#a2-appendix-2--technical-evidence--database-schemas)

---

# 1. Introduction

GigCraft is a modern, responsive full-stack web application designed to connect Indian freelancers and clients. The platform enables skilled freelancers (developers, UI/UX designers, content creators, animators, and digital specialists) to showcase their service offerings ("gigs") across multiple tiers, and allows clients to explore, filter, order, coordinate, and review digital service deliverables. The project focuses on structured contract lifecycle handling, multi-tier packages, localized Indian currency and date formatting, client-seller messaging, and transparent peer reviews.

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to provide a complete, clear, and structured description of the architecture, features, user interfaces, functional behavior, system constraints, and technical design of GigCraft. 

This document serves as the formal technical blueprint for developers, evaluators, academic reviewers, and testers. It delineates the implemented software modules, technical schemas, and functional boundaries of the application without making claims of unverified third-party commercial gateways or off-scope enterprise services.

### 1.2 Scope
The product is named **GigCraft**. It is developed using a modern MERN-style architecture comprising React 19, Tailwind CSS, Node.js, Express.js, MongoDB, and Mongoose ODM.

The application scope includes:
- **Service Discovery**: Exploring published gigs with multi-parameter search, category categorization, delivery deadline filters, rating thresholds, seller tiers, and budget range sorting formatted in Indian Rupees (₹ INR).
- **Service Packages**: Standardized three-tier service structures (Basic, Standard, Premium) detailing package deliverables, turnaround duration, revision limits, and transparent feature lists.
- **Contract & Order Tracking**: Ordering workflow enabling clients to supply project briefs and file attachments, with status progressions across `Pending`, `In Progress`, `Delivered`, `Revision Requested`, `Completed`, and `Cancelled`.
- **Collaborative Messaging**: Built-in, direct asynchronous messaging system between clients and freelancers linked directly to project contracts.
- **Role-Based Profiles & Dashboards**: Dedicated workspace views for both clients and freelancers, including gig management, portfolio showcasing, earnings metrics, and order KPIs.
- **Client Feedback**: Multi-criteria star rating and feedback mechanism linked directly to completed orders with seller reply capabilities.

*Note on Project Scope*: This academic project is an educational, portfolio, and non-commercial application. It does not integrate real-world banking merchant accounts, monetary transactions, GST invoices, or commercial payment gateways. All financial commitments, orders, and wallet statuses are managed through internal simulated contract state machines.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|---|---|
| **SRS** | Software Requirements Specification |
| **UI / UX** | User Interface / User Experience |
| **API** | Application Programming Interface |
| **MERN** | MongoDB, Express.js, React.js, and Node.js technology stack |
| **JWT** | JSON Web Token, utilized for secure, stateless HTTP-only cookie authentication |
| **CRUD** | Create, Read, Update, and Delete operations |
| **Gig** | A distinct digital service offering published by a freelancer with set packages and pricing |
| **DFD** | Data Flow Diagram |
| **ODM** | Object Document Mapper (Mongoose for MongoDB) |
| **IST** | Indian Standard Time (UTC+05:30) |
| **INR (₹)** | Indian Rupee, the localized currency format used across the system |

### 1.4 References
- **GigCraft GitHub Repository**: [https://github.com/Ajadbharti/freelance-gig-marketplace](https://github.com/Ajadbharti/freelance-gig-marketplace)
- **GigCraft Deployed Application**: [https://freelance-gig-marketplace.vercel.app/](https://freelance-gig-marketplace.vercel.app/)
- **React Documentation**: [https://react.dev/](https://react.dev/)
- **Tailwind CSS Documentation**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Node.js Documentation**: [https://nodejs.org/docs](https://nodejs.org/docs)
- **Express.js Framework**: [https://expressjs.com/](https://expressjs.com/)
- **MongoDB & Mongoose Documentation**: [https://mongoosejs.com/docs/](https://mongoosejs.com/docs/)

### 1.5 Overview
The remainder of this document is organized into three major divisions:
- **Section 2 (General Description)** provides an overarching architectural perspective, module summary, user profiles, operating constraints, and system dependencies.
- **Section 3 (Specific Requirements)** enumerates detailed hardware/software interfaces, comprehensive functional specifications (inputs, processing, outputs, and edge-case handling), and non-functional requirements.
- **Section 4 (Analysis Models)** delineates Level 0 and Level 1 Data Flow Diagrams (DFDs) alongside data-store structures.
- **Appendices** provide complete visual interface walkthroughs and code evidence of core database models.

---

# 2. General Description

### 2.1 Product Perspective
GigCraft operates as an independent, self-contained, two-sided web marketplace. The client tier is built as a single-page application (SPA) using React 19 and styled with Tailwind CSS, utilizing client-side routing via React Router DOM. The client interacts with the server through asynchronous RESTful HTTP endpoints served by an Express.js backend. 

Data persistence is managed via MongoDB Atlas utilizing Mongoose schemas. Authentication tokens are issued as cryptographically signed JWTs transmitted via secure, `httpOnly` cookies to safeguard against Cross-Site Scripting (XSS). File uploads and media assets are handled via cloud storage adapters (Cloudinary) with strict MIME-type and size validation.

```
+-------------------------------------------------------+
|                 Client Tier (Browser)                 |
|       React 19 + Tailwind CSS + React Hook Form       |
+---------------------------+---------------------------+
                            | HTTPS / REST (JSON)
                            v
+-------------------------------------------------------+
|                  Server Tier (API)                    |
|        Node.js + Express.js + JWT Authentication      |
+-------------+-----------------------------+-----------+
              |                             |
              v                             v
+---------------------------+ +-------------------------+
|     Persistence Layer     | |   Cloud Storage Service |
|  MongoDB Atlas (Mongoose) | |   Media & Deliverables  |
+---------------------------+ +-------------------------+
```

### 2.2 Product Functions

| Module | Main Functions |
|---|---|
| **Service Exploration** | Catalog browsing, full-text keyword search, category navigation, multi-parameter filtering (price, delivery duration, seller tier, minimum rating), and sorting. |
| **Gig Management** | Creation, updating, pausing, and drafting of freelancer gigs featuring three tiered packages (Basic, Standard, Premium), tags, and image galleries. |
| **Order Processing** | Contract initiation, brief submission, deadline calculation, state transitions (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Delivered` $\rightarrow$ `Completed`), and revision loops. |
| **Milestone Delivery** | Digital asset attachment, delivery message submission, and client approval/revision workflow. |
| **Direct Messaging** | Context-specific conversation channels linking buyers and sellers with attachment support and unread notification tracking. |
| **User Profiles & Portfolio** | Public freelancer portfolios showcasing verified work history, client ratings, skill sets, languages, and case studies. |
| **Client & Seller Dashboards** | Customized role-based dashboards displaying active pipelines, monthly performance statistics, order breakdowns, and feedback panels. |
| **Review System** | Verified post-order rating and feedback submission with public freelancer responses. |

### 2.3 User Characteristics
The platform caters to two distinct user personas:
1. **Client (Buyer)**:
   - Business owners, startup founders, project leads, or individual creators looking to hire specialized talent.
   - Discovers services, places project orders, communicates specifications, reviews deliverable files, requests revisions, and authors reviews.
2. **Freelancer (Seller)**:
   - Technical engineers, UI/UX designers, content writers, or creative specialists seeking freelance engagements.
   - Publishes gigs with defined deliverable packages, manages project workflows, delivers completed files, tracks simulated earnings, and maintains a public portfolio.
3. **Administrator / Evaluator**:
   - Technical evaluators possessing administrative credentials to audit database collections, inspect system telemetry, verify order states, and review audit logs.

### 2.4 General Constraints
- **Client Compatibility**: Requires modern, ECMAScript 2022-compliant web browsers (Chrome, Edge, Firefox, Safari).
- **Network Dependency**: Both local development and cloud deployments require stable internet connectivity to communicate with MongoDB Atlas.
- **Stateless Authorization**: Authentication relies on signed JWT cookies; expired or absent tokens require user re-authentication.
- **Non-Commercial Academic Model**: The project operates as an educational showcase; external payment gateway integrations (Razorpay, Stripe) and actual monetary debit/credit systems are explicitly excluded.
- **Data Protection**: Passwords must be hashed using bcrypt (salt rounds = 12). Unfiltered user inputs must be sanitized using Express Validator to mitigate injection attacks.

### 2.5 Assumptions and Dependencies
- MongoDB Atlas cluster is online and reachable through a configured URI connection string.
- Environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`) are correctly configured prior to deployment.
- Deliverable uploads comply with maximum file limits (25 MB) and approved extension types (`.pdf`, `.zip`, `.png`, `.jpg`, `.json`, `.txt`).
- All displayed timestamps adhere to the Indian Standard Time (`Asia/Kolkata`) locale, and prices are formatted in Indian Rupee notation (`en-IN`).

---

# 3. Specific Requirements

## 3.1 External Interface Requirements

### 3.1.1 User Interfaces
- **Explore & Catalog View**: Grid layout displaying gig cards with cover photos, seller level badges, starting prices in ₹ INR, and quick filter panels.
- **Gig Detail View**: Tabular comparison of Basic, Standard, and Premium packages with interactive feature checklists, FAQ accordions, and seller biography cards.
- **Order Placement Modal**: Modal dialog prompting for detailed project requirements and optional brief attachments with instant package price summaries.
- **Order Management Console**: Split-pane interface showing the order ledger on the left and full milestone timelines, delivery file downloads, revision controls, and conversation threads on the right.
- **Dashboard Workspace**: Role-tailored metrics view showing active orders, completed jobs, rating metrics, and performance charts.
- **Responsive Navigation**: Adaptive header with global search, category quick-links, unread notification badges, and a mobile drawer menu.

### 3.1.2 Hardware Interfaces
The application operates on standard end-user computing hardware. No specialized hardware peripherals are required. Supported devices include desktop computers, laptops, tablets, and smartphones capable of rendering modern CSS Grid and Flexbox layouts.

### 3.1.3 Software Interfaces

| Software / Component | Purpose |
|---|---|
| **React 19** | Component-based frontend library for dynamic UI rendering. |
| **React Router v7** | Client-side routing, protected routes, and URL parameter management. |
| **Tailwind CSS v4** | Utility-first styling framework supporting dark/light container styling. |
| **Node.js** | Server-side JavaScript runtime environment. |
| **Express.js v5** | Web application framework for routing and middleware orchestration. |
| **MongoDB & Mongoose** | NoSQL document database and schema modeling ODM. |
| **jsonwebtoken (JWT)** | Token creation, signing, and verification for stateless sessions. |
| **bcryptjs** | Adaptive one-way password hashing algorithm. |
| **React Hook Form** | Performant, uncontrolled form state management and input validation. |
| **Cloudinary SDK / Multer** | Media handling and file upload management. |

### 3.1.4 Communications Interfaces
All communications between the React client and the Express backend utilize standard HTTP/1.1 and HTTP/2 protocols over TLS (HTTPS). Data payloads are serialized using UTF-8 JSON. Secure cookies utilize the `HttpOnly`, `SameSite=Lax`, and `Secure` attributes to prevent unauthorized script access.

---

## 3.2 Functional Requirements

### 3.2.1 Service Marketplace Catalogue and Filtering
- **3.2.1.1 Introduction**: Enables clients to discover services, apply dynamic search parameters, and sort gigs.
- **3.2.1.2 Inputs**: Search query string, category slug, price range (`minPrice`, `maxPrice`), maximum delivery duration, seller tier (`top_rated`, `pro`, `level2`, `rising`), and sort criterion (`relevance`, `price_asc`, `price_desc`, `rating`, `newest`).
- **3.2.1.3 Processing**: Express server parses URL query parameters, sanitizes inputs, and constructs a MongoDB aggregation pipeline executing `$text` search and `$match` filters.
- **3.2.1.4 Outputs**: Paginated list of gig objects, seller summary sub-documents, active filter pills, and total count metadata.
- **3.2.1.5 Error Handling**: Empty result sets render a structured empty-state component suggesting broadened search filters. Invalid numerical query params are rejected with HTTP 400.

### 3.2.2 Gig Detail, Multi-Tier Packages and Specification
- **3.2.2.1 Introduction**: Displays in-depth service descriptions, portfolio deliverables, package tiers, and seller credentials.
- **3.2.2.2 Inputs**: Unique MongoDB `_id` of the gig.
- **3.2.2.3 Processing**: Backend queries the `Gig` collection, populating seller references, freelancer profile details, category names, and review statistics.
- **3.2.2.4 Outputs**: High-resolution image gallery, package tier comparison table (Basic, Standard, Premium), included deliverables list, seller bio, and historical buyer feedback.
- **3.2.2.5 Error Handling**: Non-existent gig IDs return HTTP 404 with a user-friendly error redirection to `/explore`.

### 3.2.3 Order Lifecycle, Milestones, and Work Submissions
- **3.2.3.1 Introduction**: Governs the end-to-end milestone lifecycle of a service engagement.
- **3.2.3.2 Inputs**: Selected package tier, client requirements text (minimum 20 characters), optional specification attachments, and target gig ID.
- **3.2.3.3 Processing**: The system verifies package availability, snapshots pricing and deliverable specifications to prevent retro-active changes, initializes the order state to `pending`, and records a simulated financial commitment in `held` status. Freelancers accept orders (advancing state to `in_progress`), upload deliverable files (`delivered`), and clients either approve (`completed`) or request revisions (`revision_requested`).
- **3.2.3.4 Outputs**: Order record with unique code (e.g., `GC-9F2A1C`), calculated due dates, milestone audit log, and deliverable download links.
- **3.2.3.5 Error Handling**: Unauthorized status transitions (such as completing a pending order or non-participants accessing order records) are rejected with HTTP 403 or 409 Conflict.

### 3.2.4 Real-Time In-App Messaging & Threaded Communication
- **3.2.4.1 Introduction**: Provides a secure communication channel between clients and freelancers for discussing project requirements.
- **3.2.4.2 Inputs**: Conversation ID, message body string, and optional attachments.
- **3.2.4.3 Processing**: Validates participant authorization, appends the message to the conversation thread, updates the conversation timestamp, and marks unread flags for the recipient.
- **3.2.4.4 Outputs**: Chronologically sorted message stream, deliverable file attachment previews, and unread message counter badges.
- **3.2.4.5 Error Handling**: Empty message submissions are blocked on the client and rejected by server validators with HTTP 400.

### 3.2.5 User Authentication & Profile Management
- **3.2.5.1 Introduction**: Manages user registration, credential authentication, session persistence, and profile configuration.
- **3.2.5.2 Inputs**: First name, last name, email address, password (minimum 8 characters with letters and numbers), user role (`client` or `freelancer`), phone number (+91 Indian mobile format), and optional portfolio history.
- **3.2.5.3 Processing**: Hashes passwords using bcrypt, persists the user record in MongoDB, creates an associated `FreelancerProfile` document if the role is freelancer, and issues an HTTP-only JWT cookie.
- **3.2.5.4 Outputs**: User profile object (excluding sensitive password hash), authenticated session cookie, and role-specific navigation access.
- **3.2.5.5 Error Handling**: Duplicate email registrations return HTTP 409. Invalid credentials return HTTP 401.

### 3.2.6 Seller Dashboard, Performance Analytics & Reviews
- **3.2.6.1 Introduction**: Furnishes freelancers and clients with operational summaries of active contracts, earnings, and peer reviews.
- **3.2.6.2 Inputs**: Authenticated user session.
- **3.2.6.3 Processing**: Aggregates order collections by status, calculates simulated escrow amounts and completed payouts, compiles monthly performance metrics, and calculates weighted review averages.
- **3.2.6.4 Outputs**: Visual KPI stat cards, historical monthly earnings chart, recent orders table, and review moderation controls.
- **3.2.6.5 Error Handling**: Unauthorized access attempts by unauthorized roles are intercepted by route guards with immediate redirection.

---

## 3.5 Non-Functional Requirements

### 3.5.1 Performance
- **Page Load Times**: Initial landing and catalogue views render in under 1.5 seconds on standard 4G broadband connections.
- **Client-Side Transitions**: Dynamic tab switching, package selection, and filter adjustments execute instantaneously without triggering full-page browser reloads.
- **Database Indexing**: Compound indexes on `{ status: 1, category: 1, startingPrice: 1 }` and text indexes on `{ title: "text", description: "text", tags: "text" }` ensure search query execution remains under 50ms.

### 3.5.2 Reliability
- **Data Integrity**: Orders preserve snapshots of package titles, pricing, and turnaround days at the moment of order placement, insulating contracts against subsequent gig edits.
- **Error Boundaries**: Frontend API request failures render modular retry banners (`ErrorBox`) rather than causing application crashes.
- **Validation**: Strict schema typing via Mongoose and express-validator guarantees invalid or malformed payloads are rejected prior to database mutation.

### 3.5.3 Availability
- **Operational Uptime**: The hosted application on Vercel and backend services are architected for continuous 24/7 availability.
- **Connection Resilience**: Database drivers utilize connection pooling and automated reconnect handlers for transient network disconnects.

### 3.5.4 Security
- **Credential Storage**: Passwords are one-way hashed with bcrypt using 12 salt rounds; plain-text passwords are never stored or logged.
- **Cookie Security**: Authentication JWTs reside in `httpOnly`, `SameSite=Lax` cookies, neutralizing script-based session interception.
- **Rate Limiting**: Integrated `express-rate-limit` guards public authentication endpoints (maximum 20 attempts per 15 minutes) and general API routes (300 requests per 15 minutes) against brute-force attacks.
- **Injection Mitigation**: MongoDB query operators in user input fields are sanitized to prevent NoSQL injection.

### 3.5.5 Maintainability
- **Modular Codebase**: Clean architectural segregation between client components, hooks, service layers, routes, server controllers, models, and validators.
- **Shared Formatting Utilities**: Currency, date, and phone formatting are centralized in [`format.js`](file:///c:/Users/rohit/freelance-marketplace-react/client/src/utils/format.js), preventing duplicate logic.

### 3.5.6 Portability
- **Browser Independence**: Compatible with Chromium, WebKit, and Gecko browser engines across Windows, macOS, Linux, Android, and iOS.
- **Environment Agnostic**: All platform configurations (ports, origins, secrets, database URIs) are loaded through environment variables, enabling rapid deployment across any cloud PaaS or container provider.

---

## 3.7 Design Constraints
- **Full-Stack JavaScript**: Frontend and backend are exclusively constructed using JavaScript (ES Modules) across React 19 and Node.js.
- **NoSQL Schema Architecture**: Structured with MongoDB collections linked via ObjectId references rather than relational SQL foreign keys.
- **Styling Standards**: UI layout complies with Tailwind CSS utility guidelines with explicit responsive breakpoints (`sm`, `md`, `lg`, `xl`).
- **Academic Non-Revenue Scope**: Real monetary transactions, banking gateways, and tax invoicing are strictly excluded in accordance with the project's educational parameters.

---

## 3.9 Other Requirements
- **Data Seed Integrity**: The system maintains an automated database seed script providing authentic Indian freelancer profiles, realistic Rupee package costs, and verified sample orders for evaluation purposes.
- **Locale Fidelity**: Dates must strictly follow Indian Standard Time (IST) in `DD/MM/YYYY` format, and currency numbers must respect Indian lakh/crore comma placement (`en-IN`).

---

# 4. Analysis Models

## 4.1 Data Flow Diagrams (DFD)

### 4.1.1 Context-Level DFD (Level 0)

| External Entity | Data Sent to GigCraft | Data Received from GigCraft |
|---|---|---|
| **Client (Buyer)** | Search queries, filter parameters, package selection, order requirements, attachments, approval/revision commands, reviews | Matching gig cards, detailed specifications, order status milestones, deliverable files, notification alerts |
| **Freelancer (Seller)** | Gig descriptions, package pricing, portfolio entries, order acceptances, deliverable files, review responses | Service listings, order alerts, client briefs, revision requests, simulated earnings summaries |
| **MongoDB Database** | Stored user credentials, freelancer profiles, gigs, orders, payments, messages, reviews | Query, aggregation, insert, and update operations from Express services |
| **Cloud Storage** | Binary upload buffers (profile avatars, gig showcase images, order work deliverables) | CDN asset URLs and secure public IDs |

```
                +---------------------------------------+
                |             Client (Buyer)            |
                +-------------------+-------------------+
                                    |
     Order Briefs, Search Filters,  |  Gig Catalog, Milestone Status,
     Approvals, Reviews             |  Deliverable Files
                                    v
                       +-------------------------+
                       |                         |
                       |       0. GigCraft       |
                       |    Freelance Platform   |
                       |                         |
                       +------------+------------+
                                    ^
       Gig Packages, Deliverables,  |  Order Alerts, Client Briefs,
       Profile Data, Replies        |  Earnings Metrics
                                    |
                +-------------------+-------------------+
                |          Freelancer (Seller)          |
                +---------------------------------------+
```

### 4.1.2 Level 1 Process Breakdown

| Process | Input | Processing / Data Store | Output |
|---|---|---|---|
| **P1 – Explore & Search Gigs** | Keyword query, category slug, price range, tier | Query `Gig` collection; execute text search and range filters | Formatted gig cards with ₹ INR pricing |
| **P2 – View Gig Details** | Unique Gig ID | Retrieve `Gig`, populate `User`, `FreelancerProfile`, and `Review` collections | Complete gig profile, package comparison, FAQs, and reviews |
| **P3 – Place Order** | Package tier, requirements brief, file attachments | Validate inputs; snapshot package; create record in `Order` and `Payment` stores | Created order with order code (`GC-XXXXXX`) |
| **P4 – Authenticate User** | Email, password, role | Validate email; compare hash via bcrypt; sign JWT | Authenticated session cookie and user object |
| **P5 – Manage Gig Lifecycle** | Gig title, category, description, 3-tier packages, cover images | Validate price constraints (min ₹50); write to `Gig` collection | Published or drafted gig |
| **P6 – Deliver & Review Work** | Deliverable files, delivery message, revision notes | Append deliverable to `Order`; update status; update `Payment` record upon approval | Order status update, released earnings record, review prompt |
| **P7 – Direct Messaging** | Message text, attachments, conversation ID | Verify participants; store in `Message` collection; bump unread counts | Threaded conversation messages and notifications |

### 4.1.3 Main Data Stores
- **User Store (`users`)**: User identity records, names, hashed credentials, role (`client`/`freelancer`), phone number (+91 format), and company affiliations.
- **Freelancer Profile Store (`freelancerprofiles`)**: Professional titles, bios, Indian city locations, skill sets, languages, hourly rates, and calculated rating scores.
- **Gig Store (`gigs`)**: Service titles, categories, tags, multi-tier pricing structures (Basic, Standard, Premium), delivery days, and gallery images.
- **Order Store (`orders`)**: Unique order identifiers, client and freelancer references, requirements briefs, immutable package snapshots, deliverable files, status history, and due dates.
- **Payment Store (`payments`)**: Internal simulated contract tracking records associating payer, payee, order, simulated escrow state (`held`, `released`, `refunded`), and currency (`INR`).
- **Conversation & Message Store (`conversations`, `messages`)**: Conversation participant bindings, unread tracking, message bodies, timestamps, and attached assets.
- **Review Store (`reviews`)**: Post-delivery client ratings (1–5 stars), detailed feedback comments, order references, and seller responses.

---

# 5. GitHub Link

**Project Source Code Repository:**  
[https://github.com/Ajadbharti/freelance-gig-marketplace](https://github.com/Ajadbharti/freelance-gig-marketplace)

---

# 6. Deployed Link

**Deployed Application:**  
[https://freelance-gig-marketplace.vercel.app/](https://freelance-gig-marketplace.vercel.app/)

---

# A. Appendices

## A.1 Appendix 1 – Project Screenshots & UI Walkthrough

*The following sections outline the verified visual and structural screens of the GigCraft web application.*

### A.1.1 Marketplace Explore & Filter Interface
The central discovery portal of GigCraft. Users can search for technical and creative gigs across India with live filters for category, delivery time, budget range in ₹ INR, and seller experience levels.

```
+-----------------------------------------------------------------------------------------+
| [Logo] GIGCRAFT    [Search services...]          Explore Gigs   My Orders   Messages   [User] |
+-----------------------------------------------------------------------------------------+
| FILTERS [06]          |  MARKETPLACE // ALL SERVICES                                    |
| [X] Active: 2         |  Showing 12 verified service gigs                               |
|                       +-----------------------------------------------------------------+
| SERVICE TYPE          | +---------------------+ +---------------------+ +---------------+ |
| (o) All services      | | [Cover Image]       | | [Cover Image]       | | [Cover Image] | |
| ( ) Web Development   | | TOP RATED           | | PRO VERIFIED        | | RISING TALENT | |
| ( ) Graphics & Design | | Priya Verma         | | Rahul Sharma        | | Sneha Gupta   | |
| ( ) Data & AI         | | * 5.0 (18)          | | * 4.9 (24)          | | * 5.0 (9)     | |
|                       | | Full-Stack SaaS UI  | | Next.js MERN Engine | | Tech Articles | |
| BUDGET (₹ INR)        | | Starting at ₹3,500  | | Starting at ₹6,500  | | Start ₹1,500  | |
| Min: [1000] Max: [ ]  | | [Inspect Spec]      | | [Inspect Spec]      | | [Inspect Spec]| |
| [Under ₹1,000]        | +---------------------+ +---------------------+ +---------------+ |
| [₹1,000 - ₹5,000]     |                                                                 |
| [₹5,000 - ₹20,000]    | [1]  2  3  ...  Next >                                          |
+-----------------------------------------------------------------------------------------+
```

### A.1.2 Gig Detail, Multi-Tier Packages & Specifications
Displays comprehensive service information, sample work deliverables, FAQ items, and a side-by-side comparison of Basic, Standard, and Premium packages.

```
+-----------------------------------------------------------------------------------------+
| Marketplace / Graphics & Design / SaaS UI/UX Design                                      |
+-----------------------------------------------------------------------------------------+
| I will design a conversion-focused SaaS dashboard in Figma    | [Basic] [STANDARD] [Prem] |
| Seller: Priya Verma (Lead UI/UX Architect - Bengaluru)        | ₹8,500                   |
| ★ 5.0 (18 reviews) | 24 Orders Completed                      | Core Design System Suite |
+---------------------------------------------------------------+ Delivered in 5 Days     |
|                                                               | 4 Revision Rounds        |
|  +----------------------------------------------------------+ |                          |
|  |                                                          | | [✓] 6 Custom Screens     |
|  |                 [Interactive Gallery View]               | | [✓] Clickable Prototype  |
|  |                                                          | | [✓] Asset Export Kit     |
|  +----------------------------------------------------------+ |                          |
|                                                               | [Continue (₹8,500)]      |
| Description:                                                  | [Contact Seller]         |
| Complete production-ready UI/UX systems built in Figma with   |                          |
| responsive tokens, dark/light modes, and design guidelines.   | Simulated Escrow Held    |
+---------------------------------------------------------------+--------------------------+
```

### A.1.3 Order Management Console & Contract Timeline
Split-pane contract management screen. Displays active order lists on the left and full milestone details, deliverable downloads, revision controls, and conversation threads on the right.

```
+-----------------------------------------------------------------------------------------+
| SYSTEM // CONTRACT OPS : Order Management & Deliveries                                  |
+-----------------------------------------------------------------------------------------+
| [All Orders (4)] [Pending (1)] [In Progress (1)] [Delivered (1)] [Completed (1)]        |
+----------------------------------------------------+------------------------------------+
| CONTRACT LEDGER                                    | ORDER #GC-8B41D9                   |
| +------------------------------------------------+ | Client: Aman Kumar (Apex Cloud)    |
| | #GC-8B41D9  [IN PROGRESS]              ₹8,500  | | Seller: Priya Verma                |
| | SaaS Dashboard Design - Standard Package       | | Commitment: ₹8,500 (Escrow Held) |
| | Due in 3 days (18/11/2026)                     | +------------------------------------+
| +------------------------------------------------+ | MILESTONE TIMELINE                 |
| | #GC-71A2E0  [COMPLETED]                ₹6,500  | | [✓] Contract Placed (14/11/2026)   |
| | Full-Stack Landing Page Build                  | | [✓] Work Started    (14/11/2026)   |
| | Completed on 10/11/2026                        | | [ ] Delivery & Verification        |
| +------------------------------------------------+ | [ ] Escrow Release & Review        |
|                                                    +------------------------------------+
|                                                    | DIRECT CONTRACT MESSAGING          |
|                                                    | [Thread messages & attachments...] |
+----------------------------------------------------+------------------------------------+
```

### A.1.4 Seller & Client Analytics Dashboard
Visual reporting workspace showing active pipelines, completed order numbers, average star ratings, and historical monthly earnings/spending charts.

```
+-----------------------------------------------------------------------------------------+
| SELLER // OVERVIEW : Welcome back, Priya Verma                                          |
+-----------------------------------------------------------------------------------------+
| +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| | Awaiting Accept   | | Active Orders     | | Delivered Review  | | Completed Orders  | |
| |        1          | |        2          | |        1          | |       24          | |
| +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| | Total Paid Out    | | In Escrow Vault   | | This Month        | | Average Rating    | |
| |     ₹1,42,500     | |     ₹17,000       | |     ₹35,000       | |    ★ 5.0 (18)     | |
| +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
|                                                                                         |
| EARNINGS OVERVIEW (LAST 6 MONTHS)                                                       |
|                                                                                         |
|   ₹40,000 |          __/\_                                                              |
|   ₹20,000 |    _/\__/     \                                                             |
|         0 +---+---+---+---+---+---+                                                     |
|            JUN JUL AUG SEP OCT NOV                                                      |
+-----------------------------------------------------------------------------------------+
```

---

## A.2 Appendix 2 – Technical Evidence & Database Schemas

*Code evidence of primary Mongoose data schemas demonstrating data modeling, input validation, and role relationships.*

### A.2.1 User Model Schema (`server/src/models/User.js`)
```javascript
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"], trim: true, maxlength: 50 },
    lastName:  { type: String, required: [true, "Last name is required"], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: { type: String, required: [true, "Password is required"], minlength: 8, select: false },
    role: { type: String, enum: ["client", "freelancer"], required: true },
    companyName: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true },
    avatar: { url: String, publicId: String },
    domainFocus: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
```

### A.2.2 Gig Model Schema (`server/src/models/Gig.js`)
```javascript
const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Package title is required"], trim: true, maxlength: 80 },
    description: { type: String, required: [true, "Package description is required"], trim: true, maxlength: 500 },
    price: { type: Number, required: [true, "Package price is required"], min: [50, "Minimum price is ₹50"] },
    deliveryDays: { type: Number, required: true, min: 1, max: 180 },
    revisions: { type: Number, required: true, min: -1, default: 1 }, // -1 = unlimited
    features: [{ type: String, trim: true, maxlength: 120 }],
  },
  { _id: false }
);

const gigSchema = new mongoose.Schema(
  {
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true, minlength: 15, maxlength: 120 },
    description: { type: String, required: [true, "Description is required"], trim: true, minlength: 50, maxlength: 5000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
    images: [{ url: { type: String, required: true }, publicId: String }],
    packages: {
      basic: { type: packageSchema, required: true },
      standard: { type: packageSchema, required: true },
      premium: { type: packageSchema, required: true },
    },
    status: { type: String, enum: ["draft", "published", "paused"], default: "draft" },
    startingPrice: { type: Number, index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedOrders: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
```

### A.2.3 Order Model Schema (`server/src/models/Order.js`)
```javascript
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // e.g. GC-9F2A1C
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    packageTier: { type: String, enum: ["basic", "standard", "premium"], required: true },
    packageSnapshot: {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      deliveryDays: { type: Number, required: true },
      revisions: { type: Number, required: true },
      features: [String],
    },
    price: { type: Number, required: true, min: 0 },
    requirements: { type: String, required: [true, "Project requirements are required"], maxlength: 5000 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "delivered", "revision_requested", "completed", "cancelled"],
      default: "pending",
    },
    dueDate: Date,
    revisionsUsed: { type: Number, default: 0, min: 0 },
    deliveries: [
      {
        message: { type: String, required: true },
        files: [{ url: String, name: String, size: Number }],
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: Date,
  },
  { timestamps: true }
);
```

### A.2.4 Payment & Commitment Model Schema (`server/src/models/Payment.js`)
```javascript
const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", uppercase: true },
    status: { type: String, enum: ["pending", "held", "released", "refunded", "failed"], default: "pending" },
    provider: { type: String, default: "simulated" },
    isSimulated: { type: Boolean, default: true },
    transactionRef: { type: String, unique: true, sparse: true },
    releasedAt: Date,
  },
  { timestamps: true }
);
```

---
*End of Software Requirements Specification (SRS) Document.*
