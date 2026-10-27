import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import {
  User, FreelancerProfile, Category, Gig, Order, Payment, Review,
  PortfolioProject, Favorite, Conversation, Message,
} from "../models/index.js";
import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";

if (env.nodeEnv === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

const PASSWORD = "Password123!";
const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const img = (text) => ({ url: `https://placehold.co/800x500/e5eeff/0b1c30?text=${encodeURIComponent(text)}` });
const pkg = (title, price, deliveryDays, revisions, features) => ({
  title, price, deliveryDays, revisions, features,
  description: `${title}: delivered in ${deliveryDays} day(s) with ${revisions === -1 ? "unlimited" : revisions} revision(s).`,
});

const categoryNames = [
  ["Web Development", "code"],
  ["Graphics & Design", "palette"],
  ["Writing & Translation", "edit_note"],
  ["Digital Marketing", "campaign"],
  ["Video & Animation", "movie"],
  ["Data & AI", "neurology"],
  ["Programming & Technology", "terminal"],
  ["Business", "business_center"],
];

const freelancers = [
  {
    key: "elena", firstName: "Elena", lastName: "Rostova", email: "elena@gigcraft.test",
    title: "Senior Product & UI/UX Systems Designer", location: "Berlin, Germany",
    skills: ["Figma", "Design Systems", "UX Research", "Prototyping", "SaaS UI", "Tailwind CSS"],
    languages: [{ name: "German", level: "native" }, { name: "English", level: "fluent" }, { name: "Spanish", level: "conversational" }],
    experienceYears: 8, hourlyRate: 95, sellerLevel: "top_rated", category: "Graphics & Design",
    gig: {
      title: "I will design a conversion-focused SaaS dashboard and responsive web app in Figma",
      tags: ["figma", "saas", "ui/ux"],
      packages: {
        basic: pkg("Basic Prototype Suite", 120, 3, 2, ["1-3 Custom SaaS Dashboard Screens", "Source File Included (.fig)"]),
        standard: pkg("Standard Core Suite", 280, 5, 4, ["6 Custom SaaS Dashboard Screens", "Interactive Clickable Prototype", "Source File + Export Assets Kit"]),
        premium: pkg("Enterprise Design System", 550, 10, -1, ["15+ Advanced Views", "Complete Design Tokens (JSON)", "Production Handoff Redlines"]),
      },
    },
  },
  {
    key: "marcus", firstName: "Marcus", lastName: "Chen", email: "marcus@gigcraft.test",
    title: "Full-Stack Next.js Engineer", location: "Singapore",
    skills: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS"],
    languages: [{ name: "English", level: "fluent" }, { name: "Mandarin", level: "native" }],
    experienceYears: 6, hourlyRate: 80, sellerLevel: "pro", category: "Web Development",
    gig: {
      title: "I will build full-stack responsive web applications using Next.js and Node",
      tags: ["react", "next.js", "frontend"],
      packages: {
        basic: pkg("Landing Page", 350, 4, 2, ["Responsive layout", "Basic SEO"]),
        standard: pkg("Full Web App", 700, 10, 3, ["Auth + dashboard", "REST API integration"]),
        premium: pkg("Production SaaS", 1400, 21, -1, ["Full-stack build", "Deployment + CI"]),
      },
    },
  },
  {
    key: "sarah", firstName: "Sarah", lastName: "Jenkins", email: "sarah@gigcraft.test",
    title: "Brand Identity Designer", location: "London, UK",
    skills: ["Branding", "Vector", "Identity", "Typography"],
    languages: [{ name: "English", level: "native" }],
    experienceYears: 5, hourlyRate: 60, sellerLevel: "pro", category: "Graphics & Design",
    gig: {
      title: "I will craft modern brand identity guidelines and logo systems",
      tags: ["branding", "vector", "identity"],
      packages: {
        basic: pkg("Logo Starter", 120, 3, 2, ["2 logo concepts", "Vector files"]),
        standard: pkg("Brand Kit", 260, 6, 3, ["Logo + color palette", "Typography guide"]),
        premium: pkg("Full Identity", 480, 10, -1, ["Complete brand guidelines", "Social media kit"]),
      },
    },
  },
  {
    key: "david", firstName: "David", lastName: "Miller", email: "david@gigcraft.test",
    title: "Mobile App UI Designer", location: "Austin, USA",
    skills: ["Mobile", "iOS", "Flutter", "Figma"],
    languages: [{ name: "English", level: "native" }],
    experienceYears: 4, hourlyRate: 70, sellerLevel: "top_rated", category: "Graphics & Design",
    gig: {
      title: "I will design intuitive mobile app UI for iOS and Android",
      tags: ["mobile", "ios", "flutter"],
      packages: {
        basic: pkg("Basic Screens", 220, 1, 1, ["3 mobile screens", "Figma source"]),
        standard: pkg("App Flow", 450, 4, 3, ["10 mobile screens", "Clickable prototype"]),
        premium: pkg("Complete App UI", 900, 8, -1, ["25+ screens", "Design system"]),
      },
    },
  },
  {
    key: "amina", firstName: "Amina", lastName: "Al-Mansour", email: "amina@gigcraft.test",
    title: "Technical Writer & SEO Specialist", location: "Dubai, UAE",
    skills: ["Tech Writing", "SEO", "Articles"],
    languages: [{ name: "English", level: "fluent" }, { name: "Arabic", level: "native" }],
    experienceYears: 3, hourlyRate: 40, sellerLevel: "rising", category: "Writing & Translation",
    gig: {
      title: "I will write SEO-optimized technical blog posts and articles",
      tags: ["tech writing", "seo", "articles"],
      packages: {
        basic: pkg("Single Article", 85, 3, 1, ["1000 words", "Keyword research"]),
        standard: pkg("Article Bundle", 160, 5, 2, ["3 articles", "Meta descriptions"]),
        premium: pkg("Content Plan", 300, 10, 3, ["6 articles", "Editorial calendar"]),
      },
    },
  },
  {
    key: "lucas", firstName: "Lucas", lastName: "Vance", email: "lucas@gigcraft.test",
    title: "3D & Motion Designer", location: "Toronto, Canada",
    skills: ["3D", "Blender", "Motion"],
    languages: [{ name: "English", level: "native" }, { name: "French", level: "conversational" }],
    experienceYears: 7, hourlyRate: 90, sellerLevel: "pro", category: "Video & Animation",
    gig: {
      title: "I will create 3D product animations and interactive web experiences",
      tags: ["3d", "blender", "motion"],
      packages: {
        basic: pkg("Single Render", 450, 5, 1, ["1 product render", "4K export"]),
        standard: pkg("Animated Spot", 900, 10, 2, ["15s animation", "Sound design"]),
        premium: pkg("Product Campaign", 1800, 21, 3, ["30s hero animation", "Social cutdowns"]),
      },
    },
  },
];

const reviewTexts = [
  "Outstanding work. Clear communication and delivered exactly what was scoped.",
  "Precise, fast, and professional. Would hire again for the next sprint.",
  "Great quality overall, with a couple of small revisions handled quickly.",
  "Excellent attention to detail and well-organized deliverables.",
  "Delivered ahead of schedule with zero unnecessary back-and-forth.",
  "Strong results. Minor delay, but communication was great throughout.",
];
const ratings = [5, 5, 4, 5, 5, 4];

async function run() {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all(
    [User, FreelancerProfile, Category, Gig, Order, Payment, Review, PortfolioProject, Favorite, Conversation, Message]
      .map((M) => M.deleteMany({}))
  );

  // Categories
  const categories = await Category.insertMany(
    categoryNames.map(([name, icon], i) => ({ name, icon, slug: slugify(name), sortOrder: i }))
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // Client (buyer)
  const client = await User.create({
    firstName: "Jordan", lastName: "Lee", email: "client@gigcraft.test",
    password: PASSWORD, role: "client", companyName: "Apex Cloud Labs",
  });

  // Freelancers, profiles, gigs
  const gigs = [];
  for (const f of freelancers) {
    const user = await User.create({
      firstName: f.firstName, lastName: f.lastName, email: f.email,
      password: PASSWORD, role: "freelancer", domainFocus: f.title,
    });
    await FreelancerProfile.create({
      user: user._id, title: f.title, location: f.location, skills: f.skills,
      languages: f.languages, experienceYears: f.experienceYears, hourlyRate: f.hourlyRate,
      sellerLevel: f.sellerLevel,
      bio: `${f.title} with ${f.experienceYears}+ years of experience delivering production-grade work for product teams.`,
      workHistory: [
        { title: f.title, company: "Independent", location: f.location, startYear: 2021, endYear: null },
      ],
    });
    const gig = await Gig.create({
      freelancer: user._id,
      category: catByName[f.category]._id,
      description: `${f.gig.title}. I deliver clean, well-documented work with clear milestones, fast communication, and a focus on measurable results for your product team.`,
      images: [img(f.firstName + " gig 1"), img(f.firstName + " gig 2")],
      status: "published",
      ...f.gig,
    });
    gigs.push({ gig, user });

    await PortfolioProject.create({
      freelancer: user._id,
      title: `${f.firstName}'s featured case study`,
      description: "A representative project showing scope, process, and measurable outcomes.",
      industry: "SaaS", metric: "+40% conversion", durationWeeks: 8,
      deliverables: f.skills.slice(0, 3), images: [img("Case study")],
      externalLink: "https://example.com",
    });
  }

  // Orders + simulated payments + reviews (ratings are computed from these)
  for (let i = 0; i < gigs.length; i++) {
    const { gig, user } = gigs[i];
    const tier = "standard";
    const p = gig.packages[tier];
    const order = await Order.create({
      gig: gig._id, client: client._id, freelancer: user._id, packageTier: tier,
      packageSnapshot: { title: p.title, price: p.price, deliveryDays: p.deliveryDays, revisions: p.revisions, features: p.features },
      price: p.price,
      requirements: "Please follow the brief we discussed and share milestones as you go.",
      status: "completed", completedAt: new Date(),
      statusHistory: [
        { status: "pending", by: client._id },
        { status: "in_progress", by: user._id },
        { status: "delivered", by: user._id },
        { status: "completed", by: client._id },
      ],
    });
    await Payment.create({
      order: order._id, payer: client._id, payee: user._id, amount: order.price,
      status: "released", transactionRef: `SIM-${order.orderNumber}`, releasedAt: new Date(),
    });
    await Review.create({
      order: order._id, gig: gig._id, client: client._id, freelancer: user._id,
      rating: ratings[i], comment: reviewTexts[i],
    });
  }

  // One active order (Elena, Standard) like the Orders screen
  const { gig: elenaGig, user: elena } = gigs[0];
  const sp = elenaGig.packages.standard;
  const active = await Order.create({
    gig: elenaGig._id, client: client._id, freelancer: elena._id, packageTier: "standard",
    packageSnapshot: { title: sp.title, price: sp.price, deliveryDays: sp.deliveryDays, revisions: sp.revisions, features: sp.features },
    price: sp.price,
    requirements: "Production-ready multi-tenant admin dashboard with dark/light design tokens and responsive navigation.",
    status: "in_progress",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    statusHistory: [{ status: "pending", by: client._id }, { status: "in_progress", by: elena._id }],
  });
  await Payment.create({
    order: active._id, payer: client._id, payee: elena._id, amount: active.price,
    status: "held", transactionRef: `SIM-${active.orderNumber}`,
  });

  // Derived stats from real data
  for (const { gig, user } of gigs) {
    await recalcGigStats(gig._id);
    await recalcFreelancerStats(user._id);
  }

  console.log("\nSeed complete.");
  console.log(`Categories: ${await Category.countDocuments()}`);
  console.log(`Users:      ${await User.countDocuments()}`);
  console.log(`Gigs:       ${await Gig.countDocuments()}`);
  console.log(`Orders:     ${await Order.countDocuments()}`);
  console.log(`Reviews:    ${await Review.countDocuments()}`);
  console.log("\nTest accounts (password for all: " + PASSWORD + ")");
  console.log("  Client:     client@gigcraft.test");
  freelancers.forEach((f) => console.log(`  Freelancer: ${f.email}`));

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});