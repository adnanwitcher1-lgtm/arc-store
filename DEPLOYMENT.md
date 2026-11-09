# Going live — deployment guide (Contabo VPS)

Everything runs on your Contabo server (`167.86.77.100`) — no Render, no Vercel:

```
Browser ──► Nginx :443 ─┬─ www.jamshan.com  → React build  (/var/www/jamshan-store/frontend/dist)
                        │                     + /sitemap.xml, /feeds/products.xml and WhatsApp/Facebook link previews
                        │                       are proxied to Django
                        └─ api.jamshan.com  → Gunicorn 127.0.0.1:8004 (Django API + /admin) → PostgreSQL jamshan_db
```
Ready-made files are in the `deploy/` folder: Nginx configs, env templates, `deploy.sh` (one-command update) and
`backup-db.sh` (daily database backup).

## 1. Push to GitHub
```bash
cd arc-store
git add .
git commit -m "Contabo deployment, Meta events, SEO"
git push origin main
```
(`backend/venv/`, `frontend/node_modules/` and `frontend/dist/` are git-ignored; real `.env` files are never committed.)

## 2. DNS (Hostinger → jamshan.com → DNS records)
Lower the TTL of the records below to **300** a few hours before the switch, then:

| Type | Name | Value |
|---|---|---|
| A | `@` | `167.86.77.100` (replaces the Vercel record) |
| A | `www` | `167.86.77.100` (replaces the Vercel record) |
| A | `api` | `167.86.77.100` (replaces the CNAME to onrender.com) |

Keep the Resend (email) records untouched. Check with `dig +short www.jamshan.com`.

## 3. Backend (already on the server — just update it)
The backend already runs as the `jamshan-store` service on port 8004 in `/var/www/jamshan-store`.

1. Compare `/var/www/jamshan-store/backend/.env` with `deploy/backend.env.example`; add any missing keys
   (`FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `DJANGO_ALLOWED_HOSTS` must contain the real domains).
2. The `api.jamshan.com` Nginx block and the systemd service already exist (`deploy/nginx/jamshan-api.conf` and
   `deploy/systemd/jamshan-store.service` are only for reference / a fresh server).
3. Restart: `sudo systemctl restart jamshan-store`.

Fresh server only: create the database (`sudo -u postgres createdb jamshan_db`, plus a user), clone the repo to
`/var/www/jamshan-store`, `python3 -m venv venv`, `venv/bin/pip install -r backend/requirements.txt -r backend/requirements-prod.txt`,
write `backend/.env`, `venv/bin/python backend/manage.py migrate`, `createsuperuser` (and `seed_store` for demo data),
install the systemd unit, `systemctl enable --now jamshan-store`.

## 4. Frontend (Nginx serves the built files)
One-time setup on the server:

```bash
# Node 22 (needed to build the React app)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - && sudo apt-get install -y nodejs

cd /var/www/jamshan-store && git pull origin main
cp deploy/frontend.env.production.example frontend/.env.production
nano frontend/.env.production          # VITE_API_URL, VITE_SITE_URL, Pixel / GA4 ids ...

# Nginx site for the storefront
sudo cp deploy/nginx/jamshan-frontend.conf /etc/nginx/sites-available/jamshan-frontend
sudo ln -s /etc/nginx/sites-available/jamshan-frontend /etc/nginx/sites-enabled/jamshan-frontend

# build + reload
bash deploy/deploy.sh
```
`deploy.sh` also runs `nginx -t` before reloading, so a typo in the config can never take the other sites
(sameermart.com, Keen Academy ...) down. The storefront block only matches `jamshan.com` / `www.jamshan.com`, so
it does not touch your other projects.

Don't want Node on the server? Build on your PC (`cd frontend && npm ci && npm run build` with the same
`.env.production`) and upload the result: `scp -r dist/* root@167.86.77.100:/var/www/jamshan-store/frontend/dist/`.

## 5. HTTPS (once DNS points to the server)
```bash
sudo certbot --nginx -d jamshan.com -d www.jamshan.com -d api.jamshan.com
```
Certbot adds the certificates and the http→https redirect to both Nginx blocks and renews them automatically.
The bare `jamshan.com` redirects to `www.jamshan.com` (the canonical address used in `robots.txt`, the sitemap and
`FRONTEND_URL`). Prefer the bare domain? Change it in `jamshan-frontend.conf`, `robots.txt`, `VITE_SITE_URL`
and `FRONTEND_URL` together.

## 6. Updating the site later
```bash
ssh root@167.86.77.100
cd /var/www/jamshan-store && bash deploy/deploy.sh
```
(pulls from GitHub, installs backend packages, runs migrations, restarts Gunicorn, rebuilds the frontend, reloads Nginx).

## 7. Backups (important — the VPS has no Auto Backup)
```bash
chmod +x /var/www/jamshan-store/deploy/backup-db.sh
( crontab -l 2>/dev/null; echo "0 3 * * * /var/www/jamshan-store/deploy/backup-db.sh" ) | crontab -
```
Keeps the last 14 daily dumps in `/var/backups/jamshan`. Copy them off the server now and then
(`scp`, or enable Contabo Auto Backup). Product images live on Cloudinary, not on the server.

## 8. Order notifications (email + WhatsApp)
Order emails are sent with **Resend** (HTTPS API). In `backend/.env`:

| Key | Value |
|---|---|
| `RESEND_API_KEY` | your Resend API key (domain `jamshan.com` verified in Resend) |
| `DEFAULT_FROM_EMAIL` | e.g. `JH Store <orders@jamshan.com>` |
| `ADMIN_EMAIL` | the store owner's inbox for new-order alerts |

Without `RESEND_API_KEY`, emails are only printed to the Gunicorn log (`journalctl -u jamshan-store`).

**Optional — WhatsApp alert on every order** (free CallMeBot API):
1. Save `+34 644 71 81 99` as a contact on the WhatsApp phone that should receive the alerts (the number in `CALLMEBOT_PHONE`).
2. From WhatsApp message it: `I allow callmebot to send me messages` — you get an API key within ~2 minutes.
3. Put the key in `CALLMEBOT_APIKEY` (backend `.env`) and restart `jamshan-store`.

## 9. Final checks before handing over
- Visit the live site in an incognito window: browse, add to cart, register, checkout.
- Server checks (replace the domain if needed):
  ```bash
  curl -sI https://www.jamshan.com/ | head -3                       # 200, served by Nginx
  curl -s  https://www.jamshan.com/sitemap.xml | head -5            # XML from Django
  curl -s  https://www.jamshan.com/feeds/products.xml | head -8     # product feed
  curl -s -A "facebookexternalhit/1.1" https://www.jamshan.com/product/<a-product-slug> | grep og:title   # share preview
  curl -sI https://www.jamshan.com/some/unknown/page | head -1      # 200 (React shows its own 404 page)
  ```
- `/admin/` loads over `https://` and the padlock is green.
- Change (or remove) the demo accounts created by `seed_store` if you seeded demo data on the production database.

## 10. Handing the admin panel to the client
Give the client their own account — not your `admin` / `AdminPass123!` login.

```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_user('client_username', 'client@email.com', 'a-strong-password', is_staff=True)
"
```
Then in `/admin/`, open that user and tick permissions for **Store → Product, Category, Product image,
Product option, Product option value, Order** (skip Users/Groups/Cart/Wishlist — the client doesn't
need those). That way they can manage products and see orders without being able to touch accounts
or break the underlying system. Keep your own superuser account for maintenance.

A short screen-share walking them through "add a product" and "check today's orders" goes a long way —
the admin panel is only useful to them if they're comfortable in it.

## 11. Meta (Facebook) Pixel
The storefront tracks these Meta Pixel events: `PageView`, `ViewContent`, `AddToCart`, `AddToWishlist`,
`Search`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase`, `CompleteRegistration`, `Lead`, `Contact`
plus custom `ViewCategory`, `ViewCart`, `RemoveFromCart`.

1. In Meta Events Manager copy your **Pixel ID**.
2. Set `VITE_META_PIXEL_ID=<pixel id>` in `frontend/.env.production` on the server.
3. Run `bash deploy/deploy.sh` (Vite bakes env vars in at build time, so the frontend must be rebuilt).
4. Verify with the *Meta Pixel Helper* Chrome extension or Events Manager → Test Events.

### Server-side events (Conversions API) — recommended
Browser pixels are blocked by ad-blockers and iOS privacy features, so `Purchase` is also sent from the Django backend
with the same `event_id` (`order_<id>`) — Meta de-duplicates the two, so you never get double counts.

1. Events Manager → your Pixel → **Settings → Conversions API → Generate access token**.
2. In `backend/.env` on the server set:
   `META_PIXEL_ID=<pixel id>` and `META_CAPI_ACCESS_TOKEN=<token>`, then `systemctl restart jamshan-store`.
3. To test: set `META_TEST_EVENT_CODE=<code from Events Manager → Test events>`, place an order, check the event shows
   as *Browser + Server* (de-duplicated). Then remove `META_TEST_EVENT_CODE`.

## 12. SEO & digital marketing
| What | Where | Used for |
|---|---|---|
| `sitemap.xml` (pages, categories, products + product images) | `https://yourdomain/sitemap.xml` | Google Search Console, Bing |
| `robots.txt` (blocks cart/checkout/search duplicates) | `frontend/public/robots.txt` | crawlers |
| Product feed (RSS, Google Merchant format) | `https://yourdomain/feeds/products.xml` | Google Merchant Center (free Shopping listings), Meta Commerce Catalog (Instagram/Facebook Shop, dynamic ads) |
| Product / Breadcrumb / Organization / WebSite JSON-LD | automatic | rich results, price & stock in Google, sitelinks search box |
| Google Analytics 4 | `VITE_GA_MEASUREMENT_ID` | same events as Meta (view_item, add_to_cart, begin_checkout, purchase …) |
| Verification tags | `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_BING_SITE_VERIFICATION`, `VITE_META_DOMAIN_VERIFICATION` | Search Console, Bing, Meta domain verification |
| Social share previews | `/share/product/<slug>` (automatic via the Nginx config) | WhatsApp / Facebook / Twitter links show the product photo, name and price |

Steps (after the domain is live):
1. `robots.txt`, `VITE_SITE_URL` and `FRONTEND_URL` already use `https://www.jamshan.com` — change all three together if the domain differs.
2. **Google Search Console** → add property → HTML tag → copy the `content` value into `VITE_GOOGLE_SITE_VERIFICATION` → `bash deploy/deploy.sh` → Verify → Sitemaps → submit `sitemap.xml`.
3. **Bing Webmaster Tools** → "Import from Google Search Console" (or use `VITE_BING_SITE_VERIFICATION`).
4. **Google Analytics 4** → create property → copy the `G-…` id into `VITE_GA_MEASUREMENT_ID` → `bash deploy/deploy.sh`; check Reports → Realtime.
5. **Google Merchant Center** → Products → Feeds → Add feed → *Scheduled fetch* → URL `https://yourdomain/feeds/products.xml` (daily).
6. **Meta Commerce Manager** → Catalog → Data sources → *Data feed* → *Scheduled feed* → same URL. Product ids match the Pixel `content_ids`, so dynamic ads work.
7. **Meta Business Settings → Brand safety → Domains** → verify your domain (meta-tag method → `VITE_META_DOMAIN_VERIFICATION`).
8. Test a product link in the Facebook Sharing Debugger (developers.facebook.com/tools/debug) — it should show the product photo and price.
