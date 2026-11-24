import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function setOrCreateMeta(attrName, attrValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setOrCreateCanonical(url) {
  if (!url) return;
  let element = document.querySelector(`link[rel="canonical"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

export default function SEO({
  title,
  description,
  image,
  type = "website",
  jsonLd,
}) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? `${title} | GigCraft`
      : "GigCraft | India's Modern Freelance Marketplace";
    document.title = fullTitle;

    const fullUrl = window.location.origin + location.pathname + location.search;
    setOrCreateCanonical(fullUrl);

    if (description) {
      setOrCreateMeta("name", "description", description);
      setOrCreateMeta("property", "og:description", description);
      setOrCreateMeta("name", "twitter:description", description);
    }

    setOrCreateMeta("property", "og:title", fullTitle);
    setOrCreateMeta("name", "twitter:title", fullTitle);
    setOrCreateMeta("property", "og:type", type);
    setOrCreateMeta("property", "og:url", fullUrl);

    if (image) {
      setOrCreateMeta("property", "og:image", image);
      setOrCreateMeta("name", "twitter:image", image);
    }

    let scriptEl = document.getElementById("structured-data-jsonld");
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = "structured-data-jsonld";
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, image, type, jsonLd, location]);

  return null;
}
