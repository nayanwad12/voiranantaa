# VOIR ANANTA — Edition 01 · Infinite Raga

The official website for **VOIR ANANTA**, an annual wearable-art competition and live experience by **VOIRTALES**.

Built with Vite, React, TypeScript and Tailwind CSS v4, GSAP + ScrollTrigger and Lenis for motion, and three.js / React Three Fiber for the 3D thread. The full brief is in [`docs/BRIEF.md`](docs/BRIEF.md).

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
npm run check:motion          # reveals reverse, anchors, menu, reduced motion, and the 3D scene (loads, pins, reverses)
npm run check:a11y            # axe-core (WCAG 2.2 AA) on desktop, phone, open menu, reduced motion + keyboard walk-through
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
- **Site URL:** set `VITE_SITE_URL` (e.g. `https://voirananta.com`) in Vercel → Project → Settings → Environment Variables once you have a domain. It makes the share image, canonical link and `og:url` absolute, and adds `sitemap.xml`. Until then, Vercel's own production domain is used automatically.

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
  motion/             GSAP setup, Lenis smooth scroll + anchor handling, data-reveal scroll reveals
  quality/tier.ts     3D quality tier detection (high / medium / low / fallback) + runtime step-down
  three/              the 3D scene — lazy-loaded chunk (see "The 3D thread" below)
scripts/              layout, content and OG-image scripts (Playwright)
docs/BRIEF.md         the project brief
```

## Motion

- Smooth scrolling (Lenis) is used only with a mouse or trackpad. Touch devices keep native scrolling.
- Text reveals are declared in markup with `data-reveal="lines" | "fade" | "stagger"` (see `src/motion/reveals.ts`). They play on the way down and reverse on the way back up.
- With `prefers-reduced-motion`, there is no smooth scroll, no split text and no reveals: the page is simply all there.

## The 3D thread

One fixed WebGL canvas sits behind the page and never unmounts. One glowing thread runs through it: it starts as ∞, unravels, travels through the nine rasas, becomes material, a stage and a timeline, then closes back into ∞.

- **`three/thread/shapes.ts`** holds the thread's vocabulary: ∞, line, the nine rasa behaviours, knot (FORM), waveform (VOICE), halo, horizon, ring, vertical (timeline), weave. Every shape maps t ∈ [0, 1] to a point, so any two blend point-by-point.
- **`three/choreography.ts`** is the scroll map. Each section (`data-scene="…"` in the markup) lists keyframes at its local progress: shape, camera, colour, glow, and which moments are visible (fragments, plinth, lights, beads).
- **`three/state.ts`** turns the keyframes into one track in scroll pixels. The `Director` resolves the current scroll position each frame and eases toward it. Everything is a function of scroll, so it all reverses exactly on scroll-up.
- **Moments:** `three/moments/` holds the 100 fragments (95 + 5, from the `FRAGMENTS` constant), the plinth and spotlight, the 20 lights and the timeline beads.
- **The nine rasas:** `sections/Rasas.tsx` pins a stage on desktop (fine pointer, motion allowed). Everywhere else it shows nine full-height panels that snap into place, each with its own rasa light.

### Quality tiers

| Tier | Who | What |
|---|---|---|
| high | desktop, capable GPU | 600-point thread, 4 000 particles, bloom, dpr ≤ 2 |
| medium | tablets, integrated GPUs | 400 points, 1 500 particles, no bloom, dpr ≤ 1.5 |
| low | phones | 180 points, 400 particles, no post-processing, dpr ≤ 1.5 |
| fallback | no WebGL, reduced motion, software GPU, Save-Data, ≤ 2 GB / ≤ 2 cores | no canvas: CSS light in the rasa colours, the drawn ∞ |

- The 3D chunk is fetched only after the page has loaded, and fades in. A tiny breathing ∞ appears bottom-left if it takes longer than about 1 s.
- Rendering pauses when the tab is hidden and runs at about 30 fps in calm sections.
- If the frame rate stays under 40 fps for about 3 s, the site steps down one tier, and a lost WebGL context falls back to CSS.
- To test a tier: add `?tier=high`, `?tier=medium`, `?tier=low` or `?tier=fallback` to the URL. A forced tier never steps down. `?debug` exposes `window.__scene` and `window.__lenis`.

## Deploying (Vercel)

The repository is ready for Vercel with zero configuration (`vercel.json` sets the build, caching and security headers).

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository `nayanwad12/voiranantaa`.
2. Framework preset: **Vite** (detected). Build command `npm run build`, output `dist` (both preset in `vercel.json`).
3. Choose the branch to deploy as production (for example after merging into `main`). Every other pushed branch gets its own preview URL automatically.
4. Optional: add `VITE_SITE_URL` (see above) and a custom domain.

`npm run build` type-checks, builds, then prerenders the page to static HTML (`scripts/prerender.mjs`), so every word of copy is in the HTML before any JavaScript runs.

## Performance and audit results

Measured with Lighthouse 13 against the production build. Mobile runs with simulated 4G and a 4× slower CPU.

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile | 98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

- **Mobile vitals:** LCP 2.2 s, TBT ≈ 70 ms, CLS 0.
- **Scrolling at phone size:** 60 fps, even with a 4× throttled CPU.
- **Prerendering:** the page is prerendered, and the hero intro is pure CSS.
- **Lazy setup:** scroll animations are set up lazily in idle time (`src/motion/arm.ts`). The 3D chunk loads only after the page has loaded, and the bloom chunk only on the high tier.

## Browser support

The target is current evergreen browsers: Chrome, Edge and Samsung Internet (Chromium 111+), Safari 16.4+ (macOS and iOS), and Firefox 128+. Tailwind CSS v4 sets this baseline.

Older browsers still get readable content, with simpler styling and no 3D. Features that are only progressive enhancements, such as `text-wrap: balance`, `color-mix()` glows, and snap points via `:has()`, are simply skipped where unsupported. `overflow: clip` has an `overflow: hidden` fallback.

Automated checks run in Chromium (this build environment has no Firefox or WebKit). Before launch, do a manual pass on Safari (iPhone and Mac), Firefox and Samsung Internet.

## Fonts

Instrument Serif (display) and Inter (body) are self-hosted from `src/assets/fonts/`. Both are SIL Open Font License. Instrument Serif has no ₹ glyph, so a 1 KB Inter subset (`inter-rupee-wght.woff2`) supplies it.
