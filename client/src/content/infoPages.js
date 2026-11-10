// Plain-language copy for the demo. Not legal advice.
const email = import.meta.env.VITE_CONTACT_EMAIL;
const contact = email
  ? `Email: ${email}`
  : "Contact the person who runs this demo site (see the project's GitHub repository).";

export const PAGES = {
  about: {
    path: "/about",
    title: "How it works",
    intro: "GigCraft is a freelance marketplace built as a full-stack learning project. Freelancers sell digital services and clients find, order and review them.",
    sections: [
      {
        id: "clients",
        heading: "For clients",
        items: [
          "Browse and search gigs, then compare the Basic, Standard and Premium packages.",
          "Place an order with your requirements and optional attachments.",
          "Follow the order, message the seller, request revisions, then approve the delivery.",
          "Leave a review once the order is complete.",
        ],
      },
      {
        id: "freelancers",
        heading: "For freelancers",
        items: [
          "Create a public profile and portfolio.",
          "Publish gigs with three packages and your own prices and delivery times.",
          "Accept orders, deliver files, handle revision requests and reply to reviews.",
          "Track earnings and payment history on your dashboard.",
        ],
      },
      {
        id: "payments",
        heading: "About payments in this demo",
        paragraphs: ["Payments are simulated. Checkout creates a demo payment record, and no card details are collected and no real money moves."],
      },
    ],
  },

  help: {
    path: "/help",
    title: "Help Center",
    sections: [
      { id: "ordering", heading: "How do I order?", paragraphs: ["Open a gig, pick a package, click Continue, describe your requirements and place the order. The seller then accepts it and starts work."] },
      { id: "payment", heading: "How does payment work?", paragraphs: ["The amount is held in a simulated escrow when you order. It is released to the seller after you approve the delivery, or refunded if the order is cancelled. See Escrow explained for the full flow."] },
      { id: "revisions", heading: "What if I need changes?", paragraphs: ["After a delivery you can request a revision. The number of revisions depends on the package, and the order page shows how many are left."] },
      { id: "cancel", heading: "Can I cancel an order?", paragraphs: ["Clients can cancel while an order is still pending. After the seller has accepted it, only the seller can cancel. Cancelled orders are refunded (simulated)."] },
      { id: "messages", heading: "How do I contact a seller?", paragraphs: ["Use Contact Seller on a gig or profile, or message them from the order page. Only the two people in a conversation can read it."] },
      { id: "password", heading: "I forgot my password", paragraphs: ["Use Forgot password on the sign-in page. We email a link that works for 15 minutes. If it doesn't arrive within a few minutes, check your spam folder."] },
      { id: "selling", heading: "How do I become a seller?", paragraphs: ["Register as a freelancer, complete your profile, then create a gig with at least one image and publish it from My Gigs."] },
      { id: "contact", heading: "Contact", paragraphs: [contact] },
    ],
  },

  escrow: {
    path: "/escrow",
    title: "Escrow explained",
    notice: "Escrow on GigCraft is simulated for this demo. No real money is held or moved.",
    sections: [
      {
        id: "flow",
        heading: "The order flow",
        items: [
          "Placed: the client submits requirements and a payment record is created and held.",
          "Accepted: the seller accepts the order and the delivery clock starts.",
          "Delivered: the seller submits the work and files.",
          "Revisions: the client may request changes, within the package's revision limit.",
          "Approved: the client approves the delivery, the payment is released and the order completes.",
        ],
      },
      {
        id: "refunds",
        heading: "Cancellations and refunds",
        paragraphs: ["If an order is cancelled before it is completed, the held payment is marked as refunded. Clients can cancel while an order is pending, and sellers can cancel while it is pending, in progress or in revision."],
      },
      {
        id: "disputes",
        heading: "Disputes",
        paragraphs: ["There is no formal dispute service in this version. Sellers and clients resolve issues through messages and revisions, and an admin can moderate reported reviews."],
      },
    ],
  },

  guidelines: {
    path: "/guidelines",
    title: "Community Guidelines",
    sections: [
      {
        id: "conduct",
        heading: "Be respectful and honest",
        items: [
          "Describe your services and requirements accurately.",
          "No harassment, hate speech, threats or spam.",
          "Don't upload content you don't have the right to share.",
          "Don't try to break, overload or misuse the site.",
        ],
      },
      {
        id: "reviews",
        heading: "Reviews and moderation",
        paragraphs: [
          "Only a client with a completed order can review it, and only once per order. Sellers can reply publicly.",
          "Sellers and other users can report a review. An admin looks at reports and may hide a review, with a written reason that is saved in an activity log. Hidden reviews don't count towards ratings.",
          "Accounts that repeatedly break these guidelines can be suspended. A suspended seller's published gigs are paused.",
        ],
      },
      {
        id: "safety",
        heading: "Safety tips",
        items: [
          "Never share your password. GigCraft will never ask for it.",
          "Keep conversations and files on the platform.",
          "No real payment details are needed anywhere on this demo site.",
        ],
      },
    ],
  },

  terms: {
    path: "/terms",
    title: "Terms of Service",
    notice: "Plain-language terms for a demonstration project. This is not legal advice.",
    sections: [
      { id: "demo", heading: "1. This is a demo", paragraphs: ["GigCraft is a learning project. Services listed on it are not real commercial offers, and payments are simulated."] },
      { id: "accounts", heading: "2. Accounts", paragraphs: ["Give accurate information and keep your password private. You are responsible for activity on your account. You must be old enough to agree to these terms where you live."] },
      { id: "orders", heading: "3. Orders and simulated payments", paragraphs: ["Placing an order creates a demo payment record held in simulated escrow and released when the client approves. No card is charged and no money changes hands."] },
      { id: "content", heading: "4. Your content", paragraphs: ["You keep the rights to what you post (gigs, portfolio items, messages, files and reviews). You allow GigCraft to store and display it as part of running the site. Don't post anything unlawful or that you have no right to share."] },
      { id: "use", heading: "5. Acceptable use", paragraphs: ["Follow the Community Guidelines. Don't attack, scrape or overload the site, and don't use it to harm others."] },
      { id: "moderation", heading: "6. Moderation and suspension", paragraphs: ["Admins can hide reviews and suspend accounts that break these terms or the guidelines. Moderation actions are recorded."] },
      { id: "disclaimer", heading: "7. No warranty", paragraphs: ["The site is provided as is, without guarantees of availability or accuracy. Data may be reset at any time because this is a demo."] },
      { id: "changes", heading: "8. Changes", paragraphs: ["These terms may change as the project changes. Continuing to use the site means you accept the current version."] },
      { id: "contact", heading: "9. Contact", paragraphs: [contact] },
    ],
  },

  privacy: {
    path: "/privacy",
    title: "Privacy Policy",
    notice: "Plain-language policy for a demonstration project. This is not legal advice.",
    sections: [
      {
        id: "collect",
        heading: "What we collect",
        items: [
          "Account details: name, email, a hashed password, role, and optional company or focus.",
          "Profile content you add: photo, bio, skills, languages, work history and portfolio.",
          "Activity: gigs, orders, requirements, deliveries, messages, reviews, saved gigs and payment records (simulated).",
          "Files you upload, such as images and attachments.",
        ],
      },
      {
        id: "where",
        heading: "Where it is stored",
        paragraphs: ["Data is stored in a MongoDB Atlas database, uploaded files on Cloudinary, and the site runs on Render. Password reset and password-changed emails are sent through Brevo."],
      },
      {
        id: "cookies",
        heading: "Cookies",
        paragraphs: ["GigCraft sets one essential cookie that keeps you signed in. It is httpOnly, so scripts on the page can't read it. If you untick Keep me signed in, it ends when you close the browser. There are no analytics or advertising cookies."],
      },
      {
        id: "visible",
        heading: "Who can see what",
        paragraphs: [
          "Your public profile, published gigs, portfolio and reviews are visible to everyone. Reviewers appear as a first name and last initial.",
          "Messages, orders and files are shown only to the people involved. Admins can see account details and reported reviews, and the person who runs this site can technically access the database.",
        ],
      },
      { id: "email", heading: "Emails", paragraphs: ["We send emails only for account security: password reset links and notices that your password changed. No marketing emails are sent in this version."] },
      { id: "security", heading: "Security", paragraphs: ["Passwords are hashed with bcrypt, traffic uses HTTPS, and every private request is checked on the server. No system is perfectly secure, so use a password you don't use elsewhere."] },
      { id: "deletion", heading: "Deleting your data", paragraphs: ["There is no self-service account deletion in this version. To have your account and data removed, contact us using the details below."] },
      { id: "contact", heading: "Contact", paragraphs: [contact] },
    ],
  },
};

export const PAGE_ORDER = ["about", "help", "escrow", "guidelines", "terms", "privacy"];