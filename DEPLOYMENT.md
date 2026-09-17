# Going live — deployment guide

## 1. Push to GitHub
Both hosts below deploy from a git repo.

```bash
cd arc-store
git init
git add .
git commit -m "JH store"
```
Create an empty repo on GitHub, then `git remote add origin <url>` and `git push -u origin main`.
(`backend/venv/`, `frontend/node_modules/` and `frontend/dist/` should be git-ignored — the
starter `.gitignore` files already handle this.)

## 2. Backend → Render
1. [render.com](https://render.com) → **New +** → **Postgres** → create a small paid instance (the free Postgres expires after 90 days — fine for testing, not for a client's live store).
2. **New +** → **Web Service** → connect the GitHub repo, root directory `backend`.
   - **Build command:** `pip install -r requirements.txt -r requirements-prod.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start command:** `gunicorn config.wsgi:application`
3. Add environment variables on the service:

   | Key | Value |
   |---|---|
   | `DJANGO_SECRET_KEY` | a long random string (generate one: `python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
   | `DJANGO_DEBUG` | `False` |
   | `DJANGO_ALLOWED_HOSTS` | `yourdomain.com,api.yourdomain.com,your-service.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com` |
   | `DATABASE_URL` | auto-filled if you link the Postgres instance to this service |

4. Deploy. Then run once, from Render's shell (or locally with `DATABASE_URL` pointed at the same Postgres): `python manage.py createsuperuser` and `python manage.py seed_store` (or add the client's real products instead of the demo set).

**Note on product images:** Render's web services don't guarantee the local disk survives a redeploy. Fine while you're setting things up; before real customers rely on it, move `MEDIA` storage to S3-compatible object storage (Cloudflare R2, Backblaze B2, or AWS S3) via `django-storages` — a next step, not blocking for a first launch.

## 3. Frontend → Vercel
1. [vercel.com](https://vercel.com) → **New Project** → import the same repo, root directory `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output `dist` (Vercel usually detects this automatically).
3. Add environment variable: `VITE_API_URL` = `https://api.yourdomain.com/api` (or the Render URL, before the domain is connected).
4. Deploy.

## 4. Domain
1. Buy a domain (Namecheap, GoDaddy, or a `.pk` via PKNIC).
2. In Vercel: **Project → Settings → Domains** → add `yourdomain.com` and `www.yourdomain.com` → Vercel gives you the DNS records to add at your registrar.
3. In Render: add a **Custom Domain** on the web service, e.g. `api.yourdomain.com` → Render gives you a CNAME to add at your registrar.
4. Update `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` on Render, and `VITE_API_URL` on Vercel, to the final domain — then redeploy both.

## 5. Order notifications (email + WhatsApp)

Without any setup, order emails just print to the console/logs — fine for testing, not for a
real store. To send real emails:

1. Turn on 2-Step Verification on the Gmail account you want to send from.
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and create an **App Password** (not your normal Gmail password — Google blocks that for this).
3. Set these on Render (or your `.env` locally):

   | Key | Value |
   |---|---|
   | `EMAIL_HOST_USER` | the sending Gmail address |
   | `EMAIL_HOST_PASSWORD` | the 16-character App Password |
   | `DEFAULT_FROM_EMAIL` | same Gmail address |
   | `ADMIN_EMAIL` | `mumtazahmadfaheem@gmail.com` (already the default) |

Once both `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set, every checkout sends the
customer a confirmation and sends `ADMIN_EMAIL` a new-order alert automatically.

**Optional — WhatsApp alert on every order** (free, personal-use API, 2-minute setup):
1. Save `+34 644 71 81 99` (CallMeBot's number) as a contact on the phone that owns `03431740756`.
2. From WhatsApp, message that contact: `I allow callmebot to send me messages`.
3. Within ~2 minutes you'll get a reply with an API key.
4. Set `CALLMEBOT_APIKEY` to that key (on Render or in `.env`). Nothing else to change —
   `CALLMEBOT_PHONE` already defaults to `923431740756`.

Leave `CALLMEBOT_APIKEY` blank to skip WhatsApp alerts entirely — email still works either way.

## 6. Final checks before handing over
- Visit the live site in an incognito window: browse, add to cart, register, checkout.
- `/admin/` loads over `https://` and the padlock is green.
- Change (or remove) the demo accounts created by `seed_store` if you seeded demo data on the production database.

## 7. Handing the admin panel to the client
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
