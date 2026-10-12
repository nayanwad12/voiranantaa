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
if (failures.length) {
  console.error(`\n${failures.length} motion check(s) failed`)
  process.exit(1)
}
console.log('\nAll motion checks passed.')
