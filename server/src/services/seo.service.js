/**
 * SEO Service: Dynamic meta tags, Open Graph / Twitter link previews,
 * sitemap.xml, and robots.txt generation.
 */

export const DEFAULT_SEO = {
  title: "GigCraft | India's Modern Freelance Marketplace",
  description:
    "Hire top Indian freelance developers, designers, and digital experts. Milestone-backed simulated escrow payments, verified client reviews, and direct collaboration.",
  image: "https://placehold.co/1200x630/0b1c30/ffffff?text=GigCraft+Freelance+Marketplace",
  type: "website",
};

/**
 * Escapes characters for safe HTML attribute insertion.
 */
export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Injects meta tags, Open Graph, Twitter Cards, canonical link, and JSON-LD into raw HTML.
 */
export function injectSeoTags(html = "", metadata = {}) {
  const title = metadata.title || DEFAULT_SEO.title;
  const description = metadata.description || DEFAULT_SEO.description;
  const image = metadata.image || DEFAULT_SEO.image;
  const url = metadata.url || "";
  const type = metadata.type || "website";
  const jsonLd = metadata.jsonLd || null;

  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<!-- Open Graph / Social Link Previews -->`,
    `<meta property="og:site_name" content="GigCraft" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    url ? `<meta property="og:url" content="${escapeHtml(url)}" />` : "",
    `<!-- Twitter Card -->`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];

  if (jsonLd) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    );
  }

  const tagsString = tags.filter(Boolean).join("\n    ");

  let modified = html;

  // Replace or inject <title>
  if (/<title>.*?<\/title>/i.test(modified)) {
    modified = modified.replace(
      /<title>.*?<\/title>/i,
      `<title>${escapeHtml(title)}</title>`
    );
  } else {
    modified = modified.replace("</head>", `  <title>${escapeHtml(title)}</title>\n</head>`);
  }

  // Inject meta tags right before </head>
  if (modified.includes("</head>")) {
    modified = modified.replace("</head>", `  ${tagsString}\n</head>`);
  } else {
    modified = tagsString + "\n" + modified;
  }

  return modified;
}

/**
 * Builds robots.txt content.
 */
export function buildRobotsTxt(origin = "https://freelance-marketplace-react.onrender.com") {
  return [
    "# GigCraft Robots.txt",
    "User-agent: *",
    "Allow: /",
    "Allow: /explore",
    "Allow: /gigs/",
    "Allow: /info/",
    "",
    "# Private & Authenticated Workspaces",
    "Disallow: /dashboard/",
    "Disallow: /admin/",
    "Disallow: /orders/",
    "Disallow: /messages/",
    "Disallow: /settings/",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin.replace(/\/+$/, "")}/sitemap.xml`,
    "",
  ].join("\n");
}

/**
 * Builds XML Sitemap for search engines.
 */
export function buildSitemapXml(origin = "https://freelance-marketplace-react.onrender.com", gigs = [], categories = []) {
  const base = origin.replace(/\/+$/, "");
  const now = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: `${base}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${base}/explore`, changefreq: "daily", priority: "0.9" },
    { loc: `${base}/info/about`, changefreq: "monthly", priority: "0.6" },
    { loc: `${base}/info/terms`, changefreq: "monthly", priority: "0.4" },
    { loc: `${base}/info/privacy`, changefreq: "monthly", priority: "0.4" },
    { loc: `${base}/login`, changefreq: "monthly", priority: "0.5" },
    { loc: `${base}/register`, changefreq: "monthly", priority: "0.5" },
  ];

  const categoryUrls = categories.map((cat) => ({
    loc: `${base}/explore?category=${encodeURIComponent(cat.slug)}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const gigUrls = gigs.map((gig) => ({
    loc: `${base}/gigs/${gig._id}`,
    lastmod: gig.updatedAt ? new Date(gig.updatedAt).toISOString().split("T")[0] : now,
    changefreq: "weekly",
    priority: "0.85",
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...gigUrls];

  const xmlEntries = allUrls
    .map((item) => {
      return [
        "  <url>",
        `    <loc>${escapeHtml(item.loc)}</loc>`,
        item.lastmod ? `    <lastmod>${item.lastmod}</lastmod>` : `    <lastmod>${now}</lastmod>`,
        `    <changefreq>${item.changefreq}</changefreq>`,
        `    <priority>${item.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    xmlEntries,
    `</urlset>`,
  ].join("\n");
}
