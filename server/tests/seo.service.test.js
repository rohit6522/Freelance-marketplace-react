import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  escapeHtml,
  injectSeoTags,
  buildRobotsTxt,
  buildSitemapXml,
  DEFAULT_SEO,
} from "../src/services/seo.service.js";

describe("seo.service", () => {
  it("escapes unsafe HTML characters", () => {
    assert.equal(
      escapeHtml('<div class="test & \'demo\'">'),
      "&lt;div class=&quot;test &amp; &#39;demo&#39;&quot;&gt;"
    );
  });

  it("injects title, meta tags, and Open Graph previews into HTML", () => {
    const rawHtml = `<!doctype html><html><head><title>Old Title</title></head><body><div id="root"></div></body></html>`;
    const metadata = {
      title: "Fullstack React Developer Gig | GigCraft",
      description: "Build robust MERN applications starting at ₹2,500.",
      image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      url: "https://freelance-marketplace-react.onrender.com/gigs/123",
      type: "product",
      jsonLd: { "@type": "Product", name: "Fullstack React Developer" },
    };

    const result = injectSeoTags(rawHtml, metadata);

    // Title replaced
    assert.match(result, /<title>Fullstack React Developer Gig \| GigCraft<\/title>/);
    assert.doesNotMatch(result, /<title>Old Title<\/title>/);

    // Meta description and canonical
    assert.match(result, /<meta name="description" content="Build robust MERN applications starting at ₹2,500\." \/>/);
    assert.match(result, /<link rel="canonical" href="https:\/\/freelance-marketplace-react\.onrender\.com\/gigs\/123" \/>/);

    // Open Graph tags
    assert.match(result, /<meta property="og:title" content="Fullstack React Developer Gig \| GigCraft" \/>/);
    assert.match(result, /<meta property="og:description" content="Build robust MERN applications starting at ₹2,500\." \/>/);
    assert.match(result, /<meta property="og:image" content="https:\/\/res\.cloudinary\.com\/demo\/image\/upload\/sample\.jpg" \/>/);
    assert.match(result, /<meta property="og:url" content="https:\/\/freelance-marketplace-react\.onrender\.com\/gigs\/123" \/>/);

    // Twitter Card
    assert.match(result, /<meta name="twitter:card" content="summary_large_image" \/>/);
    assert.match(result, /<meta name="twitter:title" content="Fullstack React Developer Gig \| GigCraft" \/>/);

    // JSON-LD structured data
    assert.match(result, /<script type="application\/ld\+json">\{"@type":"Product","name":"Fullstack React Developer"\}<\/script>/);
  });

  it("builds valid robots.txt with sitemap reference", () => {
    const robots = buildRobotsTxt("https://freelance-marketplace-react.onrender.com");
    assert.match(robots, /User-agent: \*/);
    assert.match(robots, /Disallow: \/dashboard\//);
    assert.match(robots, /Disallow: \/admin\//);
    assert.match(robots, /Disallow: \/api\//);
    assert.match(robots, /Sitemap: https:\/\/freelance-marketplace-react\.onrender\.com\/sitemap\.xml/);
  });

  it("builds valid sitemap.xml with static, category, and gig URLs", () => {
    const gigs = [
      { _id: "673000000000000000000001", updatedAt: "2026-11-20T10:00:00.000Z" },
    ];
    const categories = [{ slug: "web-development" }];

    const sitemap = buildSitemapXml("https://freelance-marketplace-react.onrender.com", gigs, categories);

    assert.match(sitemap, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(sitemap, /<loc>https:\/\/freelance-marketplace-react\.onrender\.com\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/freelance-marketplace-react\.onrender\.com\/explore\?category=web-development<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/freelance-marketplace-react\.onrender\.com\/gigs\/673000000000000000000001<\/loc>/);
    assert.match(sitemap, /<lastmod>2026-11-20<\/lastmod>/);
  });
});
