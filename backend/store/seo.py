"""SEO & marketing endpoints served by Django (proxied from the storefront domain by Nginx — see deploy/nginx/jamshan-frontend.conf):

  /sitemap.xml                 – pages + categories + products, with product images (Google Image sitemap)
  /feeds/products.xml          – product feed for Google Merchant Center (Shopping) and Meta Commerce Catalog
  /share/product/<slug>        – tiny HTML with Open Graph tags so WhatsApp / Facebook / Twitter previews
                                 show the real product (those crawlers do not run the React app)
"""
import re
from xml.sax.saxutils import escape

from django.conf import settings
from django.http import Http404, HttpResponse
from django.utils.html import strip_tags

from .models import Category, Product

STATIC_PAGES = [("/", "daily", "1.0"), ("/shop", "daily", "0.9"), ("/about", "monthly", "0.4"),
                ("/contact", "monthly", "0.4"), ("/track-order", "monthly", "0.2")]

CURRENCY = "PKR"
BRAND = "JH Store"


def _base():
    return settings.FRONTEND_URL.rstrip("/")


def _abs(request, url):
    return url if url.startswith("http") else request.build_absolute_uri(url)


def _clean(text, limit=None):
    text = re.sub(r"\s+", " ", strip_tags(text or "")).strip()
    return text[:limit] if limit else text


def _one_line(text):
    return re.sub(r"\s+", " ", text or "").strip()


def _images(request, product):
    return [_abs(request, img.image.url) for img in product.images.all()]


def _xml(body, content_type="application/xml", max_age=3600):
    resp = HttpResponse(body, content_type=f"{content_type}; charset=utf-8")
    resp["Cache-Control"] = f"public, max-age={max_age}"
    return resp


def sitemap_xml(request):
    base = _base()
    rows = [(f"{base}{path}", None, freq, prio, []) for path, freq, prio in STATIC_PAGES]
    for cat in Category.objects.filter(is_active=True):
        rows.append((f"{base}/shop?category={cat.slug}", cat.updated_at, "weekly", "0.7", []))
    products = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    for product in products:
        rows.append((f"{base}/product/{product.slug}", product.updated_at, "weekly", "0.8",
                     [(u, product.name) for u in _images(request, product)[:5]]))

    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for loc, updated, freq, prio, images in rows:
        parts.append("<url>")
        parts.append(f"<loc>{escape(loc)}</loc>")
        if updated:
            parts.append(f"<lastmod>{updated.date().isoformat()}</lastmod>")
        parts.append(f"<changefreq>{freq}</changefreq><priority>{prio}</priority>")
        for img_url, title in images:
            parts.append(f"<image:image><image:loc>{escape(img_url)}</image:loc>"
                         f"<image:title>{escape(title)}</image:title></image:image>")
        parts.append("</url>")
    parts.append("</urlset>")
    return _xml("\n".join(parts))


def products_feed(request):
    """RSS 2.0 + Google Merchant namespace. `g:id` is the product's database id — the same id the
    Meta Pixel sends as content_ids — so Facebook/Instagram dynamic ads match catalog items."""
    base = _base()
    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>',
             f"<title>{escape(BRAND)}</title><link>{escape(base)}</link>"
             f"<description>{escape(BRAND)} product feed</description>"]
    products = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    for p in products:
        images = _images(request, p)
        if not images:  # Google/Meta reject items without an image
            continue
        desc = _clean(p.description or p.short_description or p.name, 4900) or p.name
        if p.compare_at_price and p.compare_at_price > p.price:
            price, sale = p.compare_at_price, p.price
        else:
            price, sale = p.price, None
        parts.append("<item>")
        parts.append(f"<g:id>{p.id}</g:id>")
        parts.append(f"<title>{escape(_one_line(p.name)[:150])}</title>")
        parts.append(f"<description>{escape(desc)}</description>")
        parts.append(f"<link>{escape(base)}/product/{escape(p.slug)}</link>")
        parts.append(f"<g:image_link>{escape(images[0])}</g:image_link>")
        for extra in images[1:10]:
            parts.append(f"<g:additional_image_link>{escape(extra)}</g:additional_image_link>")
        parts.append(f"<g:availability>{'in stock' if p.stock > 0 else 'out of stock'}</g:availability>")
        parts.append(f"<g:price>{price:.2f} {CURRENCY}</g:price>")
        if sale is not None:
            parts.append(f"<g:sale_price>{sale:.2f} {CURRENCY}</g:sale_price>")
        parts.append("<g:condition>new</g:condition>")
        parts.append(f"<g:brand>{escape(BRAND)}</g:brand>")
        parts.append(f"<g:mpn>{escape(p.sku)}</g:mpn>")
        parts.append("<g:identifier_exists>no</g:identifier_exists>")
        parts.append(f"<g:product_type>{escape(p.category.name)}</g:product_type>")
        parts.append("</item>")
    parts.append("</channel></rss>")
    return _xml("\n".join(parts), content_type="application/rss+xml", max_age=900)


def share_product(request, slug):
    """Open Graph preview page for social crawlers. Humans are sent on to the real storefront page."""
    try:
        p = Product.objects.select_related("category").prefetch_related("images").get(slug=slug, is_active=True)
    except Product.DoesNotExist:
        raise Http404
    url = f"{_base()}/product/{p.slug}"
    images = _images(request, p)
    title = escape(f"{p.meta_title or p.name} | {BRAND}")
    desc = escape(_clean(p.meta_description or p.short_description or p.description or p.name, 200))
    tags = [
        f'<title>{title}</title>',
        f'<meta name="description" content="{desc}">',
        f'<link rel="canonical" href="{escape(url)}">',
        f'<meta property="og:site_name" content="{escape(BRAND)}">',
        '<meta property="og:type" content="product">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{desc}">',
        f'<meta property="og:url" content="{escape(url)}">',
        '<meta property="og:locale" content="en_PK">',
        f'<meta property="product:price:amount" content="{p.price:.2f}">',
        f'<meta property="product:price:currency" content="{CURRENCY}">',
        f'<meta property="product:availability" content="{"in stock" if p.stock > 0 else "out of stock"}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{desc}">',
        f'<meta http-equiv="refresh" content="0;url={escape(url)}">',
    ]
    if images:
        tags.append(f'<meta property="og:image" content="{escape(images[0])}">')
        tags.append(f'<meta name="twitter:image" content="{escape(images[0])}">')
    html = f"<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">{''.join(tags)}</head>" \
           f"<body><a href=\"{escape(url)}\">{escape(p.name)}</a></body></html>"
    return _xml(html, content_type="text/html", max_age=600)
