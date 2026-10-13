/**
 * Motion check (needs `npm run preview -- --port 4173` running):
 *  - no runtime errors on desktop (Lenis on) or touch (Lenis off)
 *  - reveals play on the way down and reverse on the way back up
 *  - nav anchors land just below the sticky header and move focus there
 *  - the mobile menu opens, navigates and unlocks the page
 *  - with prefers-reduced-motion nothing is left hidden and no text is split
 *   node scripts/check-motion.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4173/'
const browser = await chromium.launch()
const failures = []
const check = (ok, msg) => {
  console.log(`${ok ? '✓' : '✗'} ${msg}`)
  if (!ok) failures.push(msg)
}
const hiddenReveals = (p) =>
  p.evaluate(
    () =>
      [...document.querySelectorAll('main [data-reveal], main [data-reveal] > *')].filter((e) => +getComputedStyle(e).opacity < 0.05)
        .length,
  )
const wheelTo = async (p, y) => {
  for (let i = 0; i < 500; i++) {
    const d = y - (await p.evaluate(() => scrollY))
    if (Math.abs(d) < 20) break
    await p.mouse.wheel(0, Math.max(-700, Math.min(700, d)))
    await p.waitForTimeout(30)
  }
  await p.waitForTimeout(1500)
}

// Desktop
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(base)
  await p.waitForTimeout(2500)
  check(await p.evaluate(() => document.documentElement.classList.contains('lenis')), 'desktop: Lenis smooth scroll active')
  await p.mouse.move(720, 450)
  const before = await hiddenReveals(p)
  await wheelTo(p, await p.evaluate(() => document.documentElement.scrollHeight - innerHeight))
  check((await hiddenReveals(p)) < before, `desktop: reveals played on the way down (${before} → ${await hiddenReveals(p)} hidden)`)
  await wheelTo(p, 0)
  check((await hiddenReveals(p)) >= before - 2, 'desktop: reveals reversed after scrolling back up')
  await p.click('nav[aria-label="Primary"] a[href="#journey"]')
  await p.waitForTimeout(2200)
  const top = await p.evaluate(() => Math.round(document.getElementById('journey').getBoundingClientRect().top))
  const header = await p.evaluate(() => document.querySelector('[data-site-header]').offsetHeight)
  check(Math.abs(top - header) <= 2, `desktop: nav anchor lands under the header (top ${top}px, header ${header}px)`)
  check((await p.evaluate(() => document.activeElement?.id)) === 'journey', 'desktop: focus moved to the target section')
  check(errors.length === 0, `desktop: no runtime errors ${errors.join(' | ')}`)
  await p.close()
}

// Touch
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(base)
  await p.waitForTimeout(2000)
  check(!(await p.evaluate(() => document.documentElement.classList.contains('lenis'))), 'touch: native scrolling (no Lenis)')
  await p.tap('button[aria-controls="mobile-menu"]')
  await p.waitForTimeout(700)
  check(!(await p.evaluate(() => document.getElementById('mobile-menu').hidden)), 'touch: menu opens')
  await p.tap('#mobile-menu a[href="#partner"]')
  await p.waitForTimeout(1800)
  const state = await p.evaluate(() => ({
    hidden: document.getElementById('mobile-menu').hidden,
    top: Math.round(document.getElementById('partner').getBoundingClientRect().top),
    overflow: document.documentElement.style.overflow,
    inert: !!document.querySelector('[inert]'),
  }))
  check(state.hidden && !state.overflow && !state.inert, 'touch: menu closes and unlocks the page')
  check(Math.abs(state.top - 64) <= 2, `touch: menu link lands under the header (top ${state.top}px)`)
  check(errors.length === 0, `touch: no runtime errors ${errors.join(' | ')}`)
  await ctx.close()
}

// Reduced motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.goto(base)
  await p.waitForTimeout(800)
  check((await hiddenReveals(p)) === 0, 'reduced motion: nothing is hidden waiting for a reveal')
  check((await p.evaluate(() => document.querySelectorAll('.reveal-line').length)) === 0, 'reduced motion: text is not split')
  check(!(await p.evaluate(() => document.documentElement.classList.contains('lenis'))), 'reduced motion: no smooth-scroll hijack')
  await ctx.close()
}

await browser.close()

// 3D (software WebGL, tier forced so the watchdog stays out of the way)
{
  const gl = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const p = await gl.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(base + '?tier=medium&debug')
  const ready = await p
    .waitForFunction(() => document.documentElement.dataset['3d'] === 'ready', null, { timeout: 30000 })
    .then(() => true)
    .catch(() => false)
  check(ready, '3d: canvas loads lazily and fades in')
  const pinned = await p.evaluate(() => {
    const el = document.querySelector('[data-scene="rasa-journey"]')
    return el.getBoundingClientRect().height / innerHeight
  })
  check(pinned > 7, `3d: rasa journey is pinned on desktop (${pinned.toFixed(1)} screens of scroll)`)
  // Scene state: the shape pair being morphed (∞ is shape 1) and the camera distance.
  const snap = () => p.evaluate(() => window.__scene.debug())
  const settle = async (y) => {
    await p.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), y)
    // The scene eases toward the scroll position; wait until it has caught up.
    await p.waitForFunction(() => Math.abs(window.__scene.live.smooth - window.scrollY) < 1, null, { timeout: 60000 })
    await p.waitForTimeout(500)
  }
  await settle(0)
  const top = await snap()
  await settle(await p.evaluate(() => document.documentElement.scrollHeight * 0.55))
  const mid = await snap()
  await settle(0)
  const back = await snap()
  const isInf = (d) => d.a === 1 && (d.mix < 0.02 || d.b === 1)
  check(isInf(top) && !isInf(mid), `3d: the ∞ transforms on the way down (shape ${top.a} → ${mid.a})`)
  check(isInf(back) && Math.abs(back.camZ - top.camZ) < 0.02, '3d: scrolling back up returns the scene exactly to the hero')
  check(errors.length === 0, `3d: no runtime errors ${errors.join(' | ')}`)
  await gl.close()
}

if (failures.length) {
  console.error(`\n${failures.length} motion check(s) failed`)
  process.exit(1)
}
console.log('\nAll motion checks passed.')
