/**
 * Accessibility audit with axe-core (WCAG 2.2 A/AA + best practices) in several states,
 * plus a keyboard check. Needs `npm run preview -- --port 4173` running.
 *   node scripts/check-a11y.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const base = process.argv[2] ?? 'http://localhost:4173/'
const browser = await chromium.launch()
let failed = 0

async function audit(name, ctxOpts, prepare) {
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  await page.goto(base + '?debug')
  await page.waitForTimeout(1200)
  // Scroll through once (via Lenis when it is active) so every reveal has played, then come back
  // to the top: axe then sees each section the way a visitor does once it is on screen.
  await page.evaluate(async () => {
    const lenis = window.__lenis
    const to = (y) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y))
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      to(y)
      await new Promise((r) => setTimeout(r, 90))
    }
    await new Promise((r) => setTimeout(r, 1500))
  })
  if (prepare) await prepare(page)
  await page.waitForTimeout(600)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
  const issues = result.violations
  console.log(`${issues.length ? '✗' : '✓'} ${name}: ${issues.length} violation(s), ${result.passes.length} rules passed`)
  for (const v of issues) console.log(`    [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
  failed += issues.length
  await ctx.close()
}

await audit('desktop', { viewport: { width: 1440, height: 900 } })
await audit('phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await audit('phone, menu open', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, async (p) => {
  await p.tap('button[aria-controls="mobile-menu"]')
  await p.waitForTimeout(800)
})
await audit('reduced motion', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

// Keyboard: the first Tab reaches the skip link, which moves focus to the main content;
// the next stops are the header's wordmark, links and Register Now.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  await p.goto(base)
  await p.waitForTimeout(800)
  await p.keyboard.press('Tab')
  const first = await p.evaluate(() => document.activeElement?.textContent?.trim())
  await p.keyboard.press('Enter')
  await p.waitForTimeout(1500)
  const afterSkip = await p.evaluate(() => document.activeElement?.id)
  const stops = []
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press('Tab')
    stops.push(await p.evaluate(() => (document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label') || '').trim().slice(0, 24)))
  }
  const ok = first === 'Skip to content' && afterSkip === 'main'
  console.log(`${ok ? '✓' : '✗'} keyboard: first Tab = "${first}", skip link → #${afterSkip}; next stops: ${stops.join(' → ')}`)
  if (!ok) failed++
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
  console.log(`${ring !== 'none' ? '✓' : '✗'} keyboard: focused element shows a visible focus ring (${ring})`)
  if (ring === 'none') failed++
  await ctx.close()
}

await browser.close()
if (failed) {
  console.error(`\n${failed} accessibility problem(s)`)
  process.exit(1)
}
console.log('\nNo accessibility violations.')
