"""sitemap.xml for the React storefront (served by Django, proxied from the frontend domain)."""
from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse

from .models import Category, Product

STATIC_PAGES = [("/", "daily", "1.0"), ("/shop", "daily", "0.9"), ("/about", "monthly", "0.4"),
                ("/contact", "monthly", "0.4"), ("/track-order", "monthly", "0.2")]


def sitemap_xml(request):
    base = settings.FRONTEND_URL.rstrip("/")
    rows = [(f"{base}{path}", None, freq, prio) for path, freq, prio in STATIC_PAGES]
    for cat in Category.objects.filter(is_active=True):
        rows.append((f"{base}/shop?category={cat.slug}", cat.updated_at, "weekly", "0.7"))
    for product in Product.objects.filter(is_active=True).only("slug", "updated_at"):
        rows.append((f"{base}/product/{product.slug}", product.updated_at, "weekly", "0.8"))

    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, updated, freq, prio in rows:
        parts.append("<url>")
        parts.append(f"<loc>{escape(loc)}</loc>")
        if updated:
            parts.append(f"<lastmod>{updated.date().isoformat()}</lastmod>")
        parts.append(f"<changefreq>{freq}</changefreq><priority>{prio}</priority>")
        parts.append("</url>")
    parts.append("</urlset>")
    return HttpResponse("\n".join(parts), content_type="application/xml")
