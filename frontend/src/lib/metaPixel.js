// Meta (Facebook) Pixel — single place for every tracking call.
// Set VITE_META_PIXEL_ID in the frontend env (Vercel / .env). If it is empty, every function is a safe no-op.

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || "").trim();
const CURRENCY = "PKR";

let initialised = false;

export function initPixel() {
  if (initialised || !PIXEL_ID || typeof window === "undefined") return;
  initialised = true;

  // Standard Meta Pixel bootstrap snippet.
  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", PIXEL_ID);
}

function fire(method, name, params, eventID) {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  try {
    if (eventID) window.fbq(method, name, params || {}, { eventID });
    else window.fbq(method, name, params || {});
  } catch {
    /* tracking must never break the shop */
  }
}

export const track = (name, params, eventID) => fire("track", name, params, eventID);
export const trackCustom = (name, params, eventID) => fire("trackCustom", name, params, eventID);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ---- Page view (call on every route change) -------------------------------
export const pageView = () => track("PageView");

// ---- Product helpers -------------------------------------------------------
// Works with product detail objects, list objects and cart-item products.
export function productParams(product, quantity = 1) {
  return {
    content_ids: [String(product.id)],
    content_type: "product",
    content_name: product.name,
    content_category: product.category_name || undefined,
    contents: [{ id: String(product.id), quantity }],
    value: num(product.price) * quantity,
    currency: CURRENCY,
  };
}

export const viewContent = (product) => track("ViewContent", productParams(product));

export const addToCart = (product, quantity = 1) => track("AddToCart", productParams(product, quantity));

export const addToWishlist = (product) => track("AddToWishlist", productParams(product));

export const search = (query) =>
  track("Search", { search_string: query, content_type: "product" });

export const viewCategory = (name, slug) =>
  trackCustom("ViewCategory", { content_name: name, content_category: slug });

export const removeFromCart = (product, quantity = 1) =>
  trackCustom("RemoveFromCart", productParams(product, quantity));

export const viewCart = (cart) =>
  trackCustom("ViewCart", cartParams(cart));

// ---- Cart / checkout -------------------------------------------------------
function cartParams(cart) {
  const items = cart?.items || [];
  return {
    content_ids: items.map((i) => String(i.product.id)),
    content_type: "product",
    contents: items.map((i) => ({ id: String(i.product.id), quantity: i.quantity })),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: num(cart?.subtotal),
    currency: CURRENCY,
  };
}

export const initiateCheckout = (cart) => track("InitiateCheckout", cartParams(cart));

export const addPaymentInfo = (cart, paymentMethod) =>
  track("AddPaymentInfo", { ...cartParams(cart), payment_method: paymentMethod });

// Purchase fires once per order (guarded in localStorage so a refresh doesn't double-count).
export function purchase(order) {
  const key = `fb_purchase_${order.id}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* storage unavailable — fire anyway */
  }
  track(
    "Purchase",
    {
      content_ids: order.items.map((i) => String(i.product)),
      content_type: "product",
      contents: order.items.map((i) => ({ id: String(i.product), quantity: i.quantity, item_price: num(i.unit_price) })),
      num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
      value: num(order.total),
      currency: CURRENCY,
    },
    `order_${order.id}`
  );
}

// ---- Other engagement ------------------------------------------------------
export const completeRegistration = () => track("CompleteRegistration", { status: true });
export const lead = (source) => track("Lead", { content_name: source });
export const contact = (source) => track("Contact", { content_name: source });
