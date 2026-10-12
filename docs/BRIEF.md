# VOIR ANANTA — Website Build Brief for Claude Code

## 0. How to work on this project

1. Read this entire brief before doing anything.
2. Start in **plan mode**. Before writing code, show me:
   - the file and folder structure
   - the scroll map (which section sits at which part of the page, and what the 3D scene does there)
   - the 3D scene architecture (how one persistent scene changes with scroll)
   - the mobile / low-power strategy
   Wait for my approval.
3. Build in the phases listed in Section 9. After each phase:
   - run the dev server
   - check the page at 390px (phone), 768px (tablet), 1440px (desktop)
   - fix any layout breaks, overflow or jank
   - give me a short summary and **stop for my review** before the next phase
4. **Never invent content.** Use only the text in Section 4. Where something is marked as a placeholder, leave a clearly named placeholder. Do not create fake judges, fake partners, fake testimonials or fake statistics.

---

## 1. The project

**What it is:** the official website for **VOIR ANANTA — Edition 01: Infinite Raga**, an annual wearable-art competition and live experience by **VOIRTALES** (an independent magazine on Fashion, Lifestyle and Culture).

**Who visits:**
- Designers, artists, makers, students and creative professionals (18+) who may register
- Brands considering partnership or sponsorship
- Press and audience

**What the site must achieve, in order:**
1. Make the visitor *feel* the concept within the first 5 seconds
2. Drive registrations (Register Now must always be one tap away)
3. Attract partners (clear partnership section and contact)

**Tone:** editorial, gallery-like and premium. Think luxury magazine and art exhibition. Not a festival flyer, not a typical fashion-week runway site, no stock-template look.

**Non-negotiables:**
- Looks professional on every device
- Fully responsive: phone, tablet, laptop, large desktop, portrait and landscape
- Immersive 3D scroll experience on capable devices, with a polished fallback everywhere else

---

## 2. Creative direction

### Core visual idea: the endless thread

The edition's line is *"A melody with no end."* *Ananta* means infinite. So the whole site is built around **one continuous, glowing thread**, the raga, that the visitor travels along from top to bottom.

- It **starts** as an infinity loop (∞)
- It **unravels** and carries the visitor through the nine rasas
- It **becomes material**, then a stage, then a timeline
- It **closes back into the infinity loop** at the very end

The thread is generated procedurally in code (curves, tubes, lines, particles). **No downloaded 3D models are needed**, which avoids licensing issues and keeps the site light.

### Architecture

- One fixed, full-screen WebGL canvas behind the page
- Real HTML content scrolls over it
- One global scroll progress value (0 → 1) plus per-section progress values drive the thread's shape, the camera, colour and lighting
- Every animation must play in reverse smoothly when the visitor scrolls up

### Scroll map, section by section

| # | Section | 3D / motion behaviour |
|---|---|---|
| Hero | VOIR ANANTA / To see the infinite | Black space. A slowly breathing infinity loop drawn from fine thread and particles. Huge serif title. "Edition 01 · Infinite Raga". Subtle scroll cue. |
| 01 | What is VOIR ANANTA? | The loop begins to unravel into a single line. "THIS IS NOT A FASHION SHOW. THIS IS WEARABLE ART." is a full-screen typographic moment, revealed line by line. |
| 02 | Infinite Raga + the nine rasas | **Pinned signature section.** The camera travels along the thread through nine zones. Each rasa changes the light colour (see palette) and the thread's behaviour. A counter shows 1/9 … 9/9. |
| 03 | Two categories | Split layout. RAGA / FORM: the thread twists into abstract sculptural geometry. RAGA / VOICE: the thread becomes a waveform, like a voice or sound line. Focus words reveal on hover (desktop) or tap (touch). |
| 04 | The 95 / 5 rule | The thread breaks into **exactly 100 floating fragments**: 95 rendered as unconventional materials (paper, metal, wire, wood, natural, recycled) and 5 as soft fabric. The numbers on screen must match the fragment count. |
| 05 | Made by human hands | The 3D calms and dims on purpose. A hand-drawn SVG line draws itself as you scroll (stroke-dashoffset). This contrast is the point: human-made against machine. |
| 06 | The experience | A spotlight cone falls on an empty plinth in 3D. A circular "5:00" ring fills as you scroll through the section. THE WORK / THE IDEA / THE EXPERIENCE reveal in sequence. |
| 07 | Who can participate | An endlessly looping marquee of the disciplines (fits the infinite theme). Pauses on hover; respects reduced motion. |
| 08 | The selection | 20 points of light appear, split 10 / 10 into the two categories, then 2 glow brighter as the category winners. Additional recognitions listed below. |
| 09 | How we look at the work | Six lenses as cards (Vision, Concept, Material, Craft, Experience, Relevance), each with its question. Arranged in a circle on desktop, stacked on mobile. |
| 10 | The journey | The thread turns vertical and becomes the timeline; each date is a bead of light the camera descends past. The show date carries a visible "Tentative" marker. |
| 11 | Participation | Two clean fee cards (Students / Other participants), open and close dates, primary Register Now button. |
| 12 | What participants need to develop | Five items, each with its question. Accordion on mobile. |
| 13 | The show | "20 WORKS. 20 WORLDS." large. Three "meets" lines reveal one by one. |
| 14 | The judges | Tasteful placeholder: "Judge profiles will be announced separately", with the six fields as tags. **No fake people, no placeholder faces.** |
| 15 | Partnerships | Partnership areas and tiers, then an email CTA (placeholder). |
| 16 | About VOIRTALES | Short editorial block. |
| Final | What will you make wearable? | The thread closes back into the infinity loop. Big Register Now. Footer. |

### Rasa behaviour in the pinned section

| Rasa | Thread behaviour |
|---|---|
| SHRINGARA — Beauty / Love | soft, flowing, intertwined curves |
| HASYA — Joy | light, bouncing, playful rhythm |
| KARUNA — Compassion / Sorrow | slow, drooping, heavy |
| RAUDRA — Intensity / Anger | sharp, jagged, fast |
| VEERA — Courage | strong, rising upward |
| BHAYANAKA — Fear | trembling, flickering |
| BIBHATSA — Disquiet | tangled, knotted |
| ADBHUTA — Wonder | bursting outward, expanding spiral |
| SHANTA — Peace | still, nearly straight line, near silence |

On mobile this section becomes nine full-height scroll-snap panels with a lighter version of the thread and colour transitions. Keep the same feel at a lower cost.

---

## 3. Visual system

### Colour

- **Ink (background):** `#0A0A0A`
- **Paper (main text):** `#F2EEE6`
- **Muted (secondary text):** `#8C8880`
- **Hairlines / borders:** paper at 10–15% opacity

**Rasa colours.** These are based on the traditional colour associations in Bharata's Natyashastra. Use them as lighting and accent colours only, never as large flat backgrounds behind text.

| Rasa | Traditional colour | Suggested hex |
|---|---|---|
| Shringara | shyama (dark blue-green) | `#2F5D62` |
| Hasya | sita (white) | `#F5F3EE` |
| Karuna | kapota (dove grey) | `#8A8D91` |
| Raudra | rakta (red) | `#B3261E` |
| Veera | gaura (golden / wheat) | `#D4A24C` |
| Bhayanaka | krishna (black) | `#1A1A1A` with a silver rim light `#C0C0C0` so it reads on the dark background |
| Bibhatsa | nila (blue) | `#2B3A8C` |
| Adbhuta | pita (yellow) | `#E8C547` |
| Shanta | added later by commentators; use a pale near-white | `#E6EEF0` |

All text must meet WCAG AA contrast against whatever is behind it.

### Typography (Google Fonts)

- **Display:** an editorial serif (Instrument Serif or Cormorant Garamond) for titles and big statements
- **Body:** a clean sans (Inter or Manrope)
- **Labels:** small uppercase with wide letter-spacing for section numbers (`01 —`, `02 —`) and tags, matching the source document's style
- Fluid type sizes using `clamp()` so headings scale smoothly from 360px to 1920px
- Self-host or preload fonts; use `font-display: swap`

### Layout and texture

- 12-column grid on desktop, 4-column on mobile, generous whitespace (magazine feel)
- Subtle film-grain overlay (very low opacity)
- Optional custom cursor on desktop only; never on touch devices

### Motion principles

- Smooth scroll via Lenis
- Text reveals: line-by-line, small upward movement plus fade, ease-out
- Everything reverses cleanly on scroll-up
- Only the rasa section is pinned. No other scroll-jacking: the visitor must always feel in control.

---

## 4. Content (single source of truth)

Put all copy in one file, `src/content/site.ts`, so text can be edited without touching components. Use this content exactly. One correction is already applied: the source had "ADB HUTA", which is correctly spelled **ADBHUTA**.

**Placeholders to create as named constants:**
- `REGISTER_URL`: registration link (not yet provided)
- `PARTNER_EMAIL`: partnership email (not yet provided)
- `LOGO`: VOIRTALES / VOIR ANANTA logo (use a typographic wordmark until provided)
- `OG_IMAGE`: social share image (generate a simple typographic one for now)

### Hero
VOIR ANANTA
TO SEE THE INFINITE.
EDITION 01
INFINITE RAGA
A wearable-art competition and live experience by VOIRTALES.

### 01 — WHAT IS VOIR ANANTA?
VOIR ANANTA is an annual wearable-art competition and live experience by VOIRTALES, bringing together fashion, art, unconventional materials, performance, music, movement and visual expression.

It invites designers, artists and makers to move beyond conventional fashion and create something that exists between garment, artwork and performance.

THIS IS NOT A FASHION SHOW.
THIS IS WEARABLE ART.

### 02 — THE FIRST EDITION
INFINITE RAGA
A MELODY WITH NO END.

The first edition explores the relationship between emotion, expression and form.

Inspired by the idea of a melody that can take infinite directions, INFINITE RAGA invites participants to translate emotion and thought into wearable art.

The work can interpret one or more of the nine rasas:
- SHRINGARA — Beauty / Love
- HASYA — Joy
- KARUNA — Compassion / Sorrow
- RAUDRA — Intensity / Anger
- VEERA — Courage
- BHAYANAKA — Fear
- BIBHATSA — Disquiet
- ADBHUTA — Wonder
- SHANTA — Peace

ONE THEME.
NINE EMOTIONAL WORLDS.
INFINITE INTERPRETATIONS.

### 03 — TWO CATEGORIES

**RAGA / FORM — THE EXPERIMENTAL**
For the most creative, unconventional and experimental interpretations of fashion + art.
Focus: FORM · MATERIAL · STRUCTURE · SILHOUETTE · MOVEMENT · IMAGINATION
HOW FAR CAN YOU TAKE THE FORM?

**RAGA / VOICE — THE REFLECTIVE**
For wearable art that carries a thought, cause, social issue, cultural question or human experience.
Focus: IDEA · MESSAGE · EMOTION · RELEVANCE · REFLECTION · IMPACT
WHAT DO YOU WANT YOUR ART TO SAY?

### 04 — THE 95 / 5 RULE
95% UNCONVENTIONAL MATERIAL
5% TEXTILE / FABRIC

The challenge is to rethink what a garment can be made from.

Materials may include: Paper · Metal · Wire · Wood · Found Objects · Natural Materials · Recycled Materials · Experimental Materials

THE MATERIAL MUST BECOME PART OF THE IDEA.
It should not simply decorate the garment.

### 05 — MADE BY HUMAN HANDS
100% HUMAN-MADE.

The final wearable artwork must demonstrate human authorship, making and intervention.

- No AI-generated final artwork.
- No machine-generated final form.
- No mass-produced final garment.

THE HAND IS PART OF THE STORY.

### 06 — THE EXPERIENCE
THE GARMENT IS ONLY HALF THE STORY.

Every selected finalist gets 5 MINUTES to bring their wearable artwork to life.

The presentation may combine: Performance · Movement · Music · Dance · Theatre · Light · Sound · Spoken Word

The designer must present three things:
THE WORK.
THE IDEA.
THE EXPERIENCE.

The garment and performance should work together as one concept.

### 07 — WHO CAN PARTICIPATE?
IF YOU HAVE AN IDEA, YOU HAVE A PLACE HERE.

Open to individuals 18 years and above.

Designers · Fashion Designers · Costume Designers · Artists · Stylists · Costume Makers · Sculptors · Architects · Performers · Illustrators · Makers · Students · Independent Practitioners · Creative Professionals

Participants may come from any creative discipline.

### 08 — THE SELECTION
20 FINALISTS.

From all eligible entries:
- 10 — RAGA / FORM
- 10 — RAGA / VOICE

These 20 finalists will develop and present their wearable artworks at VOIR ANANTA — Edition 01.

2 CATEGORY WINNERS
One winner from each category.
- RAGA / FORM WINNER
- RAGA / VOICE WINNER

Additional recognitions may include: Material Innovation · Best Performance · Best Concept · Audience Choice

### 09 — HOW WE LOOK AT THE WORK
Every submission will be evaluated through six lenses:
- VISION — Is the idea distinctive?
- CONCEPT — Is the thought clearly expressed?
- MATERIAL — How creatively has material been explored?
- CRAFT — How well is the work constructed?
- EXPERIENCE — How effectively does it come alive on stage?
- RELEVANCE — Does it leave something to think about?

### 10 — THE JOURNEY
- 25 OCTOBER — REGISTRATIONS OPEN
- 10 NOVEMBER — REGISTRATIONS CLOSE
- 11–20 NOVEMBER — PRELIMINARY SCREENING
- 21–25 NOVEMBER — TECHNICAL + SAFETY REVIEW
- 26–29 NOVEMBER — FINALIST DEVELOPMENT / VERIFICATION
- 30 NOVEMBER — 20 FINALISTS ANNOUNCED
- 26–27 DECEMBER* — VOIR ANANTA · EDITION 01 · INFINITE RAGA

*Tentative show dates.

### 11 — PARTICIPATION
- STUDENTS — ₹2,000
- OTHER PARTICIPANTS — ₹3,500

Registration opens: 25 October 2026
Registration closes: 10 November 2026

[ REGISTER NOW ] → `REGISTER_URL`

### 12 — WHAT PARTICIPANTS NEED TO DEVELOP
Participants will be expected to develop:
- THE WEARABLE ARTWORK — What is it?
- THE CONCEPT — What does it mean?
- THE MATERIAL — Why this material?
- THE RASA — What emotion or emotional world does it explore?
- THE PERFORMANCE — How will you bring it alive in five minutes?

The final selection process will consider both the wearable artwork and its potential as a live experience.

### 13 — THE SHOW
20 WORKS.
20 WORLDS.

One stage where:
FASHION MEETS ART.
MATERIAL MEETS MOVEMENT.
IDEA MEETS PERFORMANCE.

VOIR ANANTA is designed as an immersive live experience rather than a conventional runway presentation.

VOIR ANANTA — TO SEE THE INFINITE.

### 14 — THE JUDGES
MEET THE EYES BEHIND ANANTA.

The judging panel will bring perspectives from relevant fields including:
Fashion · Art · Design · Material · Performance · Culture

Judge profiles will be announced separately.

### 15 — PARTNERSHIPS
BUILD THE INFINITE WITH US.

VOIR ANANTA creates opportunities across:
Fashion · Art · Material · Technology · Performance · Music · Beauty · Hospitality · Mobility · Culture

Partnership opportunities include:
- Title / Founding Partner
- Category Partner
- Material Partner
- Technology Partner
- Experience Partner
- Hospitality Partner
- Media Partner

For partnership enquiries: `PARTNER_EMAIL`

### 16 — ABOUT VOIRTALES
THE WORLD BEHIND ANANTA.

VOIRTALES is an independent magazine exploring Fashion, Lifestyle and Culture through people, perspectives, ideas and experiences shaping how we see, live and express.

VOIR ANANTA extends that perspective into a physical experience where ideas become form.

VOIRTALES — Fashion · Lifestyle · Culture

### Final
WHAT WILL YOU MAKE WEARABLE?
VOIR ANANTA
EDITION 01 · INFINITE RAGA
TO SEE THE INFINITE.
An annual initiative by VOIRTALES.
[ REGISTER NOW ]

---

## 5. Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS** with design tokens (colours, fonts, spacing) defined once in the config
- **three + @react-three/fiber + @react-three/drei** for the 3D scene
- **@react-three/postprocessing** for a subtle bloom on the thread (desktop tier only)
- **GSAP + ScrollTrigger** for scroll-timed animation
- **Lenis** for smooth scrolling, synced with ScrollTrigger
- Deploy on **Vercel**

Keep components small and named by section (`Hero.tsx`, `Rasas.tsx`, `NinetyFive.tsx` …). Keep 3D code in `src/three/`, with the thread logic in one place.

---

## 6. Responsiveness requirements

**Test widths:** 360, 390, 430, 768, 1024, 1280, 1440, 1920 px, plus phone landscape.

- Mobile-first CSS
- No horizontal overflow at any width
- Use `svh` / `dvh` units for full-height sections so the iOS Safari address bar doesn't cause jumps
- Respect safe-area insets (notches)
- All tap targets at least 44 × 44 px
- Hover effects have a tap equivalent on touch devices
- **Sticky header:** wordmark left, Register Now button always visible on the right; links (About, Rasas, Categories, Journey, Partner) on desktop; full-screen menu on mobile

### 3D quality tiers (detect on load)

| Tier | Who gets it | What they get |
|---|---|---|
| High | desktop with a good GPU | full thread, particles, bloom, pixel ratio up to 2 |
| Medium | tablets, laptops with integrated graphics | fewer particles, no bloom, pixel ratio up to 1.5 |
| Low | phones | simplified thread, no post-processing, pixel ratio 1–1.5, lighter rasa section |
| Fallback | no WebGL, `prefers-reduced-motion`, or very slow device | no canvas; elegant CSS gradients in the rasa colours and simple fades; the site must still look finished and premium |

Also:
- Pause rendering when the tab is hidden
- Lower frame work when the canvas isn't visible
- Watch frame rate and drop a tier automatically if it stays low

---

## 7. Performance budget

- Hero text renders immediately as HTML; the 3D loads after first paint and fades in. Visitors never stare at a blank screen.
- Elegant minimal loader only if 3D takes longer than about 1 second
- Code-split the 3D bundle and lazy-load it
- Lighthouse on mobile targets: **Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95**
- Largest Contentful Paint under 2.5 s on a mid-range phone over 4G
- Smooth 60 fps scrolling on a mid-range Android phone

---

## 8. Accessibility and SEO

- All content is real HTML text, never baked into the canvas
- Semantic structure: one `h1`, section `h2`s, lists as lists
- The canvas is `aria-hidden`
- Keyboard navigable, with visible focus states and a skip-to-content link
- `prefers-reduced-motion` → fallback tier
- Meta title and description, Open Graph and Twitter cards (`OG_IMAGE`), favicon, theme-color
- Smooth-scroll anchor links from the nav to each section
- Add Event structured data (JSON-LD) only after show dates are confirmed; leave a `TODO` for now because the dates are tentative

---

## 9. Build phases (stop for review after each)

1. **Foundation.** Scaffold, design tokens, fonts, `site.ts` content file, every section built as clean responsive static HTML with **no 3D**. This must already look like a finished, professional site on all devices.
2. **Motion.** Lenis plus GSAP text reveals, sticky header, mobile menu, marquee, timeline reveals.
3. **3D foundation.** Fixed canvas, quality-tier detection, fallback mode, hero infinity loop.
4. **Rasa journey.** The pinned nine-rasa section on desktop plus the lighter mobile version.
5. **Remaining 3D moments.** Unravel, Form/Voice, 100 fragments, spotlight plinth, 20 lights, vertical timeline, closing infinity loop.
6. **Performance pass.** Tier tuning, auto tier-drop, bundle splitting, test on real phone sizes.
7. **Polish and audit.** Accessibility, SEO meta, Lighthouse runs, cross-browser check (Chrome, Safari, Firefox, Samsung Internet).
8. **Deploy** to Vercel and give me the live link.

---

## 10. Definition of done

- [ ] Every line of content from Section 4 is present and correctly spelled
- [ ] No invented judges, partners, numbers or claims
- [ ] Register Now is reachable in one tap from anywhere on the page
- [ ] No horizontal scroll at any tested width
- [ ] Every animation reverses cleanly on scroll-up
- [ ] Fallback mode looks finished and premium, not broken
- [ ] Lighthouse mobile targets met
- [ ] Placeholders (`REGISTER_URL`, `PARTNER_EMAIL`, `LOGO`, `OG_IMAGE`) are listed in the README with where to change them
