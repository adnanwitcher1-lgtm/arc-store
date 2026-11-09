import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// Adds site-verification tags to the static index.html at build time (crawlers read raw HTML, not React).
//   VITE_GOOGLE_SITE_VERIFICATION  -> Google Search Console  (HTML tag method)
//   VITE_BING_SITE_VERIFICATION    -> Bing Webmaster Tools
//   VITE_META_DOMAIN_VERIFICATION  -> Meta Business Suite domain verification
function verificationTags(env) {
  const esc = (v) => String(v).replace(/"/g, '&quot;')
  const tags = []
  if (env.VITE_GOOGLE_SITE_VERIFICATION) tags.push(`<meta name="google-site-verification" content="${esc(env.VITE_GOOGLE_SITE_VERIFICATION)}" />`)
  if (env.VITE_BING_SITE_VERIFICATION) tags.push(`<meta name="msvalidate.01" content="${esc(env.VITE_BING_SITE_VERIFICATION)}" />`)
  if (env.VITE_META_DOMAIN_VERIFICATION) tags.push(`<meta name="facebook-domain-verification" content="${esc(env.VITE_META_DOMAIN_VERIFICATION)}" />`)
  return {
    name: 'site-verification-tags',
    transformIndexHtml: (html) => html.replace('<!--SITE_VERIFICATION-->', tags.join('\n    ')),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), verificationTags(env)],
    server: {
      port: 5173,
    },
  }
})
