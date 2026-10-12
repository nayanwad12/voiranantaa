# VOIR ANANTA — Edition 01 · Infinite Raga

The official website for **VOIR ANANTA**, an annual wearable-art competition and live experience by **VOIRTALES**.

Built with Vite, React, TypeScript and Tailwind CSS v4. The 3D thread (three.js / React Three Fiber), GSAP + ScrollTrigger and Lenis are added in later build phases. The full brief is in [`docs/BRIEF.md`](docs/BRIEF.md).

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build on :4173
```

### Checks

These need `npm run preview -- --port 4173` running in another terminal.

```bash
npm run check:layout          # screenshots 360…1920 + phone landscape into screenshots/, fails on horizontal overflow
npm run check:content         # every line of brief §4 must appear on the rendered page
npm run og                    # regenerate the placeholder share image public/og-image.png
```

## Placeholders

Everything still waiting on real material is a named constant. Change it in one place:

| Placeholder | Where to change it | Current behaviour |
|---|---|---|
| `REGISTER_URL` | `src/content/site.ts` | Points to `#participation` (the fees section). Set it to the live registration link. Every Register Now button picks it up and opens it in a new tab. |
| `PARTNER_EMAIL` | `src/content/site.ts` | `null`. The Partnerships section and footer show a dashed `[ PARTNER_EMAIL ]` box. Set an address and it becomes a `mailto:` link. |
| `LOGO` | `src/content/site.ts` (`LOGO.src`, `LOGO.alt`) | `src: null`, so the typographic wordmark "VOIR ANANTA" is rendered. Put the logo file in `public/` and set `src` (for example `'/logo.svg'`). |
| `OG_IMAGE` | `public/og-image.png` (path in `src/content/site.ts` **and** the `og:image` / `twitter:image` tags in `index.html`) | A generated typographic card (`npm run og`). Replace the file with final artwork at 1200 × 630. |

Other open items:
- **Event structured data (JSON-LD):** intentionally left out until the show dates are confirmed. There is a `TODO` in `index.html`.
- **Canonical URL / `og:url`:** add them once the production domain is known. There is a `TODO` in `index.html`.

## Editing content

All copy lives in **`src/content/site.ts`**, the single source of truth. Components never hard-code text. The 95 / 5 numbers and the finalist dots are derived from the `FRAGMENTS` and `FINALISTS` constants in the same file, so the numbers on screen and the visuals always agree.

## Project structure

```
src/
  content/site.ts     all copy + placeholders
  styles/             tokens.css (design tokens via Tailwind @theme), base.css (fonts, layout utilities, grain)
  components/layout/  Header, MobileMenu, SkipLink, Footer
  components/ui/      small shared pieces (RegisterButton, SectionHeader, Marquee, Accordion, …)
  sections/           one component per section, in page order
scripts/              layout, content and OG-image scripts (Playwright)
docs/BRIEF.md         the project brief
```

## Fonts

Instrument Serif (display) and Inter (body) are self-hosted from `src/assets/fonts/`. Both are SIL Open Font License. Instrument Serif has no ₹ glyph, so a 1 KB Inter subset (`inter-rupee-wght.woff2`) supplies it.
