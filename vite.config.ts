import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The public site URL, used for absolute share-image URLs, the canonical link and the sitemap.
 * Set VITE_SITE_URL (e.g. https://voirananta.com); on Vercel it falls back to the project's
 * production domain automatically. Empty means relative URLs (fine for local previews).
 */
const siteUrl = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'site-url',
      // Canonical and og:url must be absolute: without a known URL they are left out entirely.
      transformIndexHtml: (html) =>
        (siteUrl ? html : html.replace(/^.*(rel="canonical"|property="og:url").*\n/gm, '')).replaceAll('%SITE_URL%', siteUrl),
    },
  ],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // SINGLE_FILE=1 bundles everything into one script (used only for the single-page preview).
    rollupOptions: process.env.SINGLE_FILE ? { output: { inlineDynamicImports: true } } : undefined,
  },
})
