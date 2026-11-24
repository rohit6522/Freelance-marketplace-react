import fs from "fs";
import path from "path";
import { Gig, Category, User, FreelancerProfile } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  DEFAULT_SEO,
  injectSeoTags,
  buildRobotsTxt,
  buildSitemapXml,
} from "../services/seo.service.js";

let cachedHtml = null;
let lastReadTime = 0;

/**
 * Resolves SEO metadata based on request path and DB records.
 */
export async function resolveMetadata(req) {
  const host = req.get("host") || "localhost";
  const protocol = req.protocol || "https";
  const origin = `${protocol}://${host}`;
  const url = `${origin}${req.originalUrl || req.url || ""}`;
  const reqPath = req.path || "/";

  // 1. Gig detail page: /gigs/:id
  const gigMatch = reqPath.match(/^\/gigs\/([a-f\d]{24})$/i);
  if (gigMatch) {
    const gigId = gigMatch[1];
    const gig = await Gig.findById(gigId)
      .populate("category", "name slug")
      .populate("freelancer", "firstName lastName avatar")
      .lean();

    if (gig && gig.status === "published") {
      const sellerName = gig.freelancer?.firstName
        ? `${gig.freelancer.firstName} ${gig.freelancer.lastName || ""}`.trim()
        : "Verified Pro";
      const cleanDesc = gig.description
        ? gig.description.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").slice(0, 155).trim()
        : "Expert freelance service";
      const desc = `${cleanDesc}... Starting at ₹${gig.startingPrice}. By ${sellerName}.`;
      const image = gig.images?.[0]?.url || DEFAULT_SEO.image;

      return {
        title: `${gig.title} | GigCraft`,
        description: desc,
        image,
        url,
        type: "product",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: gig.title,
          description: cleanDesc,
          image,
          offers: {
            "@type": "Offer",
            price: gig.startingPrice,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
          ...(gig.ratingAverage > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: gig.ratingAverage,
              reviewCount: gig.ratingCount || 1,
            },
          }),
        },
      };
    }
  }

  // 2. Explore / Category page
  if (reqPath === "/explore") {
    const catSlug = req.query?.category;
    if (catSlug) {
      const category = await Category.findOne({ slug: String(catSlug).toLowerCase() }).lean();
      if (category) {
        return {
          title: `${category.name} Freelance Services | GigCraft`,
          description: `Hire verified ${category.name} freelancers on GigCraft. Protected milestone escrow payments in INR and verified client reviews.`,
          image: DEFAULT_SEO.image,
          url,
          type: "website",
        };
      }
    }
    return {
      title: "Explore Freelance Services & Top Talent | GigCraft",
      description:
        "Search verified Indian freelance gigs across Web Development, UI/UX Design, AI, Mobile Apps, and Digital Marketing with secure simulated escrow.",
      image: DEFAULT_SEO.image,
      url,
      type: "website",
    };
  }

  // 3. Freelancer profile: /profile/:id
  const profileMatch = reqPath.match(/^\/profile\/([a-f\d]{24})$/i);
  if (profileMatch) {
    const userId = profileMatch[1];
    const [user, profile] = await Promise.all([
      User.findById(userId).select("firstName lastName avatar").lean(),
      FreelancerProfile.findOne({ user: userId }).lean(),
    ]);
    if (user) {
      const name = `${user.firstName} ${user.lastName || ""}`.trim();
      const bio = profile?.bio
        ? profile.bio.slice(0, 155)
        : `Hire ${name} on GigCraft for top-quality freelance projects.`;
      return {
        title: `${name} - Freelance Professional | GigCraft`,
        description: bio,
        image: user.avatar || DEFAULT_SEO.image,
        url,
        type: "profile",
      };
    }
  }

  // 4. Info pages
  if (reqPath.startsWith("/info/")) {
    const sub = reqPath.replace("/info/", "");
    const titles = {
      about: "About GigCraft | India's Modern Freelance Marketplace",
      terms: "Terms of Service | GigCraft",
      privacy: "Privacy Policy | GigCraft",
    };
    return {
      title: titles[sub] || DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      image: DEFAULT_SEO.image,
      url,
      type: "website",
    };
  }

  // Default homepage / generic routes
  return {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    image: DEFAULT_SEO.image,
    url,
    type: "website",
  };
}

/**
 * Controller: GET /robots.txt
 */
export const getRobots = (req, res) => {
  const host = req.get("host") || "localhost";
  const protocol = req.protocol || "https";
  const origin = `${protocol}://${host}`;
  res.type("text/plain");
  res.send(buildRobotsTxt(origin));
};

/**
 * Controller: GET /sitemap.xml
 */
export const getSitemap = asyncHandler(async (req, res) => {
  const host = req.get("host") || "localhost";
  const protocol = req.protocol || "https";
  const origin = `${protocol}://${host}`;

  const [gigs, categories] = await Promise.all([
    Gig.find({ status: "published" }).select("_id updatedAt").lean(),
    Category.find().select("slug").lean(),
  ]);

  res.type("application/xml");
  res.send(buildSitemapXml(origin, gigs, categories));
});

/**
 * Controller: GET /api/public/seo  (query path to preview metadata)
 */
export const getSeoMetadata = asyncHandler(async (req, res) => {
  const metadata = await resolveMetadata(req);
  res.json({ success: true, metadata });
});

/**
 * Serves SPA HTML with injected, pre-rendered dynamic SEO meta tags.
 */
export async function renderSpaWithSeo(req, res, distPath) {
  try {
    const indexPath = path.join(distPath, "index.html");
    const now = Date.now();

    if (!cachedHtml || now - lastReadTime > 15000) {
      cachedHtml = await fs.promises.readFile(indexPath, "utf8");
      lastReadTime = now;
    }

    const metadata = await resolveMetadata(req);
    const html = injectSeoTags(cachedHtml, metadata);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(html);
  } catch (err) {
    console.error("renderSpaWithSeo error:", err.message);
    res.sendFile(path.join(distPath, "index.html"));
  }
}
