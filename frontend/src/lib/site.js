// Single place for store contact details — change here and it updates everywhere.
export const SITE = {
  name: "JH Store",
  // Public storefront URL (no trailing slash) — used for canonical links & social previews.
  // Set VITE_SITE_URL=https://yourdomain.com on Vercel; falls back to the current origin.
  url: (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, ""),
  tagline: "Everyday, elevated",
  description: "JH Store — everyday essentials, elevated. Shop watches, footwear, skincare, grooming and fashion with cash on delivery across Pakistan.",
  email: "jamshankalair398@gmail.com",
  whatsapp: "923714905398", // international format, no + or spaces
  address: "Faisalabad, Pakistan",
  hours: "Mon–Sat, 9am–7pm",
};
