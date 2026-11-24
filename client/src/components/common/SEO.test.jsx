import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SEO from "./SEO";

describe("SEO component", () => {
  beforeEach(() => {
    document.title = "";
    document.querySelectorAll('meta[name="description"]').forEach((el) => el.remove());
    document.querySelectorAll('meta[property^="og:"]').forEach((el) => el.remove());
    document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
  });

  it("sets document title and open graph metadata", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <SEO
          title="Browse Gigs"
          description="Find expert developers on GigCraft."
          image="https://example.com/banner.jpg"
          type="website"
        />
      </MemoryRouter>
    );

    expect(document.title).toBe("Browse Gigs | GigCraft");

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute("content")).toBe("Find expert developers on GigCraft.");

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe("Browse Gigs | GigCraft");

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute("content")).toBe("https://example.com/banner.jpg");
  });

  it("injects JSON-LD structured data when provided", () => {
    const schema = { "@type": "Product", name: "Next.js App Development" };

    render(
      <MemoryRouter initialEntries={["/gigs/123"]}>
        <SEO title="Next.js App" jsonLd={schema} />
      </MemoryRouter>
    );

    const script = document.getElementById("structured-data-jsonld");
    expect(script).not.toBeNull();
    expect(JSON.parse(script.textContent)).toEqual(schema);
  });
});
