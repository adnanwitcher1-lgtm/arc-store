# JH — Full-Stack Ecommerce Store

A complete ecommerce storefront: **React 19 + Tailwind v4** frontend, **Django + Django REST
Framework** backend, JWT auth, a customized admin panel, and Framer Motion animations
throughout. Built as a from-scratch alternative to the original reference screenshot (product
page, color/strap swatches, tabs, related products) — same functionality, its own brand and
design system, currently skinned as **JH**.

## What's included

**Backend (`/backend`)**
- Categories, products (with images, price/compare-at price, stock), per-product option
  groups like Color / Strap Color, reviews, wishlist, cart, orders — all priced in **PKR**
- JWT authentication (register/login/refresh), guest carts that merge into the account cart on login
- **Order notifications**: an email confirmation to the customer and a new-order alert to the
  store owner's inbox on every checkout, plus an optional free WhatsApp alert (see
  `DEPLOYMENT.md`)
- A customized Django admin (thumbnails, discount + order-status badges, inline image/option editing)
- A `seed_store` management command that creates 6 categories, 12 demo products (with
  generated placeholder images, priced in PKR), an admin account, and 3 demo customer accounts
- A REST API covering catalog browsing, cart, wishlist, checkout and auth

**Frontend (`/frontend`)**
- Home, Shop (filters/search/sort/pagination), Product detail, Cart, Checkout, Wishlist,
  Login/Register, Order history
- A **floating WhatsApp button** (bottom-left, wired to `03431740756`) and a **color-scheme
  switcher** (bottom-right) with 4 built-in themes: Light, Gold & Black, Forest, Midnight
- A small design system: palette of ink / paper / pine / brass / stone / brick per theme,
  Fraunces + Manrope typefaces, and the JH logo used in the header, footer and favicon
- Framer Motion used for the things that deserve it: gallery crossfades, a slide-in mobile
  menu, tab switching, add-to-cart/toast feedback, page transitions, a pulsing WhatsApp
  button — not decoration on every element

## Quick start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

`db.sqlite3` and `media/` are already included with seeded demo data, so `runserver` alone
gets you a working catalog immediately. If you'd rather start clean:

```bash
python manage.py seed_store --reset
```

**Admin panel:** http://127.0.0.1:8000/admin/ → username `admin`, password `AdminPass123!`
**Demo shopper logins:** `sara.k` / `hamza.b` / `ayesha.n`, password `DemoPass123!`

> Change these before deploying anywhere public — see `DEPLOYMENT.md`.

Order emails print to the console by default (zero setup needed to see them working) —
set real SMTP credentials to send them for real; see `DEPLOYMENT.md` → "Order notifications".

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. It's already pointed at the backend via `.env`
(`VITE_API_URL=http://127.0.0.1:8000/api`) — edit that if your API runs elsewhere.

## Rebranding

Everything lives behind one name/logo and one token set, so all three are quick to change:
- **Name:** search for `JH` in `frontend/index.html` and `backend/store/admin.py` (`site_header`).
- **Logo:** replace `frontend/src/assets/logo.png` with a new image (same filename, any
  reasonable size — it's displayed at a fixed height so proportions adjust automatically).
- **Colors/fonts:** `frontend/src/index.css` — the `@theme` block plus one `[data-theme="..."]`
  block per color scheme. Add a new scheme by copying a block and changing the hex values;
  it'll automatically appear in the on-site switcher (`frontend/src/context/ThemeContext.jsx`
  → the `THEMES` array).
- **Currency:** `frontend/src/lib/format.js` (currently PKR / `Rs`).
- **WhatsApp number:** `frontend/src/components/common/WhatsAppButton.jsx`.

## API overview

| Endpoint | Notes |
|---|---|
| `GET /api/categories/`, `/api/products/` | filters: `category`, `search`, `featured`, `ordering` |
| `GET /api/products/<slug>/` | full detail: images, options, reviews |
| `POST /api/products/<slug>/reviews/` | auth required |
| `GET/POST /api/cart/`, `/api/cart/items/` | works for guests (`X-Guest-Token` header) and logged-in users |
| `POST /api/cart/merge/` | folds a guest cart into the account cart after login |
| `GET/POST /api/wishlist/`, `/api/wishlist/toggle/` | auth required |
| `POST /api/orders/checkout/`, `GET /api/orders/` | auth required — sends confirmation/alert emails |
| `POST /api/auth/register/`, `/api/auth/login/`, `/api/auth/login/refresh/`, `GET /api/auth/me/` | JWT |

## Before going live

This is a genuinely working store end to end, but a few things are intentionally left as
next steps rather than guessed at — see `DEPLOYMENT.md` for the full going-live guide:
- **Payments** — checkout captures a payment method but doesn't charge a card. Wire up
  Stripe/JazzCash/Easypaisa in `store/views.py` (`OrderViewSet.checkout`) once you have
  merchant credentials.
- **Product photography** — seeded images are generated placeholders (brand-colored, with
  the product name) so the catalog isn't empty; swap them for real photos in the admin.
- **Real email/WhatsApp credentials** — notifications are fully wired up but need a Gmail
  App Password (and optionally a CallMeBot API key) to actually send — see `DEPLOYMENT.md`.
- **Secrets & hosting** — set a real `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, a real
  database (Postgres) and proper `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS` for production; see
  `.env.example` in `/backend`.
