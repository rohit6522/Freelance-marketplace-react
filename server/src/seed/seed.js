import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";

import {
  User, FreelancerProfile, Category, Gig, Order, Payment, Review,
  PortfolioProject, Favorite, Conversation, Message, ModerationLog,
} from "../models/index.js";

import { recalcGigStats, recalcFreelancerStats } from "../services/rating.service.js";
import { ensureCategories } from "./categories.js";

if (env.nodeEnv === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

const PASSWORD = "Password123!";

const img = (text) => ({ url: `https://placehold.co/800x500/e5eeff/0b1c30?text=${encodeURIComponent(text)}` });
const pkg = (title, price, deliveryDays, revisions, features) => ({
  title, price, deliveryDays, revisions, features,
  description: `${title}: delivered in ${deliveryDays} day(s) with ${revisions === -1 ? "unlimited" : revisions} revision(s).`,
});



const freelancers = [
  {
    key: "priya", firstName: "Priya", lastName: "Verma", email: "priya@gigcraft.test", phone: "+91 98111 22334",
    title: "Lead UI/UX Designer & Design Systems Architect", location: "Bengaluru, Karnataka",
    skills: ["Figma", "Design Systems", "UX Research", "Prototyping", "SaaS UI", "Tailwind CSS"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }, { name: "Kannada", level: "conversational" }],
    experienceYears: 8, hourlyRate: 2500, sellerLevel: "top_rated", category: "Graphics & Design",
    gig: {
      title: "I will design a conversion-focused SaaS dashboard and responsive web app in Figma",
      tags: ["figma", "saas", "ui/ux"],
      packages: {
        basic: pkg("Starter UI Wireframe Suite", 3500, 3, 2, ["1-3 Custom Dashboard Screens", "Figma Source File (.fig)"]),
        standard: pkg("Core Design System Suite", 8500, 5, 4, ["6 Custom SaaS Screens", "Clickable Interactive Prototype", "Asset Export Kit"]),
        premium: pkg("Enterprise Scale Design System", 22000, 10, -1, ["15+ Advanced Responsive Views", "Complete Design Tokens (JSON)", "Developer Handoff Redlines"]),
      },
    },
  },
  {
    key: "rahul", firstName: "Rahul", lastName: "Sharma", email: "rahul@gigcraft.test", phone: "+91 98222 33445",
    title: "Senior Full-Stack MERN & Next.js Engineer", location: "Gurugram, Haryana",
    skills: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }],
    experienceYears: 6, hourlyRate: 2000, sellerLevel: "pro", category: "Web Development",
    gig: {
      title: "I will build full-stack responsive web applications using Next.js and Node",
      tags: ["react", "next.js", "frontend"],
      packages: {
        basic: pkg("High-Speed Landing Page", 6500, 4, 2, ["Responsive Layout", "On-Page SEO", "Tailwind Styling"]),
        standard: pkg("Full Stack Web Application", 18000, 10, 3, ["JWT Auth + Dashboard", "REST API & MongoDB", "State Management"]),
        premium: pkg("Production SaaS Platform", 45000, 21, -1, ["End-to-End SaaS Build", "Payment Webhooks", "CI/CD & Cloud Deployment"]),
      },
    },
  },
  {
    key: "ananya", firstName: "Ananya", lastName: "Singh", email: "ananya@gigcraft.test", phone: "+91 98333 44556",
    title: "Brand Identity Specialist & Art Director", location: "Mumbai, Maharashtra",
    skills: ["Branding", "Vector Design", "Typography", "Visual Identity", "Illustrator"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }, { name: "Marathi", level: "conversational" }],
    experienceYears: 5, hourlyRate: 1500, sellerLevel: "pro", category: "Graphics & Design",
    gig: {
      title: "I will craft modern brand identity guidelines and logo systems",
      tags: ["branding", "vector", "identity"],
      packages: {
        basic: pkg("Logo Starter Kit", 2500, 3, 2, ["2 Creative Concepts", "Vector & High-Res PNG Exports"]),
        standard: pkg("Comprehensive Brand Kit", 7500, 6, 3, ["Primary & Secondary Logos", "Color Palette + Typography Rules", "Brand Guidelines PDF"]),
        premium: pkg("Complete Enterprise Brand Suite", 16000, 10, -1, ["Full Brand Identity System", "Social Media & Stationery Kit", "Copyright Transfer & Source Files"]),
      },
    },
  },
  {
    key: "arjun", firstName: "Arjun", lastName: "Patel", email: "arjun@gigcraft.test", phone: "+91 98444 55667",
    title: "Mobile App UI/UX & Flutter Engineer", location: "Ahmedabad, Gujarat",
    skills: ["Flutter", "iOS", "Android", "Mobile UI", "Figma", "Dart"],
    languages: [{ name: "Gujarati", level: "native" }, { name: "Hindi", level: "fluent" }, { name: "English", level: "fluent" }],
    experienceYears: 4, hourlyRate: 1800, sellerLevel: "top_rated", category: "Graphics & Design",
    gig: {
      title: "I will design intuitive mobile app UI for iOS and Android",
      tags: ["mobile", "ios", "flutter"],
      packages: {
        basic: pkg("Essential Mobile Screens", 4500, 2, 2, ["3 Mobile App Screens", "Figma Components", "iOS/Android Guidelines"]),
        standard: pkg("Complete Feature Flow", 12000, 5, 3, ["8-10 Mobile Screens", "Clickable Interactive Prototype", "Design Handoff Guide"]),
        premium: pkg("Full Mobile App Experience", 28000, 12, -1, ["20+ Custom Screens", "Design Token Library", "Component States & Micro-interactions"]),
      },
    },
  },
  {
    key: "sneha", firstName: "Sneha", lastName: "Gupta", email: "sneha@gigcraft.test", phone: "+91 98555 66778",
    title: "Technical Content Strategist & SEO Specialist", location: "New Delhi",
    skills: ["Technical Writing", "SEO Optimization", "Content Strategy", "Developer Docs"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }],
    experienceYears: 4, hourlyRate: 1200, sellerLevel: "rising", category: "Writing & Translation",
    gig: {
      title: "I will write SEO-optimized technical blog posts and articles",
      tags: ["tech writing", "seo", "articles"],
      packages: {
        basic: pkg("Single Deep-Dive Article", 1500, 3, 1, ["1,000 Words", "Keyword & Competitor Research", "Code Snippets Included"]),
        standard: pkg("High-Authority Article Bundle", 4000, 5, 2, ["3 Technical Articles (1,200 words each)", "Meta Tags & SEO Formatting", "Diagrams & References"]),
        premium: pkg("Monthly Tech Content Strategy", 9500, 10, 3, ["6 Comprehensive Articles", "Keyword Strategy & Topic Cluster", "Editorial Calendar"]),
      },
    },
  },
  {
    key: "rohit", firstName: "Rohit", lastName: "Yadav", email: "rohit@gigcraft.test", phone: "+91 98666 77889",
    title: "3D Visualizer & Motion Graphics Artist", location: "Pune, Maharashtra",
    skills: ["3D Modeling", "Blender", "After Effects", "Motion Design", "Cinema 4D"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }, { name: "Marathi", level: "conversational" }],
    experienceYears: 7, hourlyRate: 2200, sellerLevel: "pro", category: "Video & Animation",
    gig: {
      title: "I will create 3D product animations and interactive web experiences",
      tags: ["3d", "blender", "motion"],
      packages: {
        basic: pkg("3D Product Render", 5000, 4, 1, ["1 Photorealistic Render", "4K Ultra-HD Export", "Transparent & Studio Background"]),
        standard: pkg("Commercial 3D Animation", 15000, 8, 2, ["15-Second Motion Video", "Sound Effects & Background Audio", "Full HD MP4 Export"]),
        premium: pkg("Flagship 3D Product Campaign", 35000, 16, 3, ["30-Second Hero Animation", "Multiple Aspect Ratios for Socials", "Interactive WebGL Assets Included"]),
      },
    },
  },
];

const reviewTexts = [
  "Outstanding work! Delivered crisp Figma screens on time with great attention to detail.",
  "Precise, clean, and professional full-stack implementation. Our team will definitely hire again.",
  "Great design sensibilities and seamless communication on WhatsApp and Slack. Handled all iterations smoothly.",
  "Excellent mobile UX flow and pixel-perfect components. Highly recommend for any mobile project.",
  "Delivered well ahead of schedule with zero unnecessary back-and-forth. Thoroughly researched article.",
  "Exceptional 3D render quality and motion dynamics. Truly elevated our product showcase.",
];
const ratings = [5, 5, 4, 5, 5, 4];

async function run() {
  await connectDB();

  const realUsers = await User.countDocuments({
    email: { $not: /@gigcraft\.test$/i }
  });

  if (realUsers > 0 && !process.argv.includes("--force")) {
    console.error(`Refusing to seed: this database has ${realUsers} real user(s) and seeding wipes everything.`);
    console.error("Use a different database, or pass --force if you really mean it.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("Clearing existing data...");


  await Promise.all(
    [User, FreelancerProfile, Category, Gig, Order, Payment, Review, PortfolioProject, Favorite, Conversation, Message, ModerationLog]
      .map((M) => M.deleteMany({}))
  );


  // Categories
  const categories = await ensureCategories();
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // Client (buyer) - Indian business identity
  const client = await User.create({
    firstName: "Aman", lastName: "Kumar", email: "client@gigcraft.test",
    phone: "+91 98765 43210",
    password: PASSWORD, role: "client", companyName: "Apex Cloud Labs India",
  });

  await User.create({
    firstName: "Site", lastName: "Admin", email: "admin@gigcraft.test",
    password: PASSWORD, role: "admin",
  });

  // Freelancers, profiles, gigs
  const gigs = [];
  for (const f of freelancers) {
    const user = await User.create({
      firstName: f.firstName, lastName: f.lastName, email: f.email,
      phone: f.phone,
      password: PASSWORD, role: "freelancer", domainFocus: f.title,
    });
    await FreelancerProfile.create({
      user: user._id, title: f.title, location: f.location, skills: f.skills,
      languages: f.languages, experienceYears: f.experienceYears, hourlyRate: f.hourlyRate,
      sellerLevel: f.sellerLevel,
      bio: `${f.title} based in ${f.location} with ${f.experienceYears}+ years of experience delivering high-quality work for fast-growing startups and enterprises across India.`,
      workHistory: [
        { title: f.title, company: "Independent Specialist", location: f.location, startYear: 2021, endYear: null },
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
      description: "A representative project showing scope, process, and measurable outcomes for an Indian digital platform.",
      industry: "Fintech & SaaS", metric: "+40% conversion", durationWeeks: 8,
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
      currency: "INR",
      status: "released", transactionRef: `SIM-${order.orderNumber}`, releasedAt: new Date(),
    });
    await Review.create({
      order: order._id, gig: gig._id, client: client._id, freelancer: user._id,
      rating: ratings[i], comment: reviewTexts[i],
    });
  }

  // One active order (Priya Verma, Standard) like the Orders screen
  const { gig: priyaGig, user: priya } = gigs[0];
  const sp = priyaGig.packages.standard;
  const active = await Order.create({
    gig: priyaGig._id, client: client._id, freelancer: priya._id, packageTier: "standard",
    packageSnapshot: { title: sp.title, price: sp.price, deliveryDays: sp.deliveryDays, revisions: sp.revisions, features: sp.features },
    price: sp.price,
    requirements: "Production-ready multi-tenant admin dashboard with dark/light design tokens and responsive navigation.",
    status: "in_progress",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    statusHistory: [{ status: "pending", by: client._id }, { status: "in_progress", by: priya._id }],
  });
  await Payment.create({
    order: active._id, payer: client._id, payee: priya._id, amount: active.price,
    currency: "INR",
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
  console.log("  Client:     client@gigcraft.test (Aman Kumar)");
  freelancers.forEach((f) => console.log(`  Freelancer: ${f.email} (${f.firstName} ${f.lastName} - ${f.location})`));

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
