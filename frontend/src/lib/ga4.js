// Google Analytics 4 — optional. Set VITE_GA_MEASUREMENT_ID (G-XXXXXXXXXX) in the frontend env.
// Empty = every function is a safe no-op. Events are mirrored from metaPixel.js so Meta and GA4 always agree.

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
let ready = false;

export function initGA() {
  if (ready || !GA_ID || typeof window === "undefined") return;
  ready = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // gtag.js requires the `arguments` object
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false }); // page views are sent per SPA route (see Layout.jsx)
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function gaEvent(name, params) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", name, params || {});
  } catch {
    /* tracking must never break the shop */
  }
}

// Meta event name -> GA4 recommended e-commerce event name.
const MAP = {
  PageView: "page_view",
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  AddToWishlist: "add_to_wishlist",
  Search: "search",
  InitiateCheckout: "begin_checkout",
  AddPaymentInfo: "add_payment_info",
  Purchase: "purchase",
  CompleteRegistration: "sign_up",
  Lead: "generate_lead",
  Contact: "contact",
  ViewCart: "view_cart",
  RemoveFromCart: "remove_from_cart",
  ViewCategory: "view_item_list",
};

export function mirrorToGA(metaName, p = {}, eventID) {
  const name = MAP[metaName];
  if (!name) return;
  const out = {};
  if (p.contents?.length) {
    out.items = p.contents.map((c) => ({
      item_id: c.id,
      quantity: c.quantity,
      ...(c.item_price ? { price: c.item_price } : {}),
      ...(p.contents.length === 1 && p.content_name ? { item_name: p.content_name } : {}),
      ...(p.contents.length === 1 && p.content_category ? { item_category: p.content_category } : {}),
    }));
  }
  if (p.value !== undefined) {
    out.value = p.value;
    out.currency = p.currency || "PKR";
  }
  if (metaName === "Search") out.search_term = p.search_string;
  if (metaName === "AddPaymentInfo") out.payment_type = p.payment_method;
  if (metaName === "ViewCategory") out.item_list_name = p.content_name;
  if (metaName === "Purchase" && eventID) out.transaction_id = String(eventID).replace(/^order_/, "");
  if (metaName === "Lead" || metaName === "Contact") out.method = p.content_name;
  gaEvent(name, out);
}
