import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE } from "../../lib/site";

// Updates <head> in place (title, description, keywords, canonical, Open Graph, Twitter, JSON-LD).
// Edits the existing tags from index.html instead of adding duplicates.
function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}
const meta = (key, value, content, attr = "name") =>
  upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  }, { content });
const remove = (selector) => document.head.querySelector(selector)?.remove();

export default function Seo({ title, description, keywords, image, type = "website", noindex = false, jsonLd }) {
  const { pathname, search } = useLocation();
  const jsonKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const origin = SITE.url || window.location.origin;
    const category = new URLSearchParams(search).get("category");
    const canonical = `${origin}${pathname === "/" ? "" : pathname}${category ? `?category=${category}` : ""}` || origin;
    const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
    const desc = (description || SITE.description).replace(/\s+/g, " ").trim().slice(0, 160);
    const img = image || `${origin}/hero-banner.png`;

    document.title = fullTitle;
    meta("description", null, desc);
    if (keywords) meta("keywords", null, keywords);
    else remove('meta[name="keywords"]');
    meta("robots", null, noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsert('link[rel="canonical"]', () => Object.assign(document.createElement("link"), { rel: "canonical" }), { href: canonical });

    meta("og:site_name", null, SITE.name, "property");
    meta("og:type", null, type, "property");
    meta("og:title", null, fullTitle, "property");
    meta("og:description", null, desc, "property");
    meta("og:url", null, canonical, "property");
    meta("og:image", null, img, "property");
    meta("og:locale", null, "en_PK", "property");
    meta("twitter:card", null, "summary_large_image");
    meta("twitter:title", null, fullTitle);
    meta("twitter:description", null, desc);
    meta("twitter:image", null, img);

    if (jsonKey) {
      upsert('script[data-seo="page"]', () => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.seo = "page";
        return s;
      }, {}).textContent = jsonKey;
    } else {
      remove('script[data-seo="page"]');
    }
  }, [title, description, keywords, image, type, noindex, jsonKey, pathname, search]);

  return null;
}
