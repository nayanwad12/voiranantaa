/**
 * Layout check: screenshots the page at every test width and fails on horizontal overflow.
 *   node scripts/check-layout.mjs [baseUrl] [--full] [--query=?tier=fallback]
 * Expects a running server (npm run preview -- --port 4173).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) ?? 'http://localhost:4173/'
const full = args.includes('--full')
const query = (args.find((a) => a.startsWith('--query=')) ?? '--query=').slice(8)
const out = 'screenshots'
mkdirSync(out, { recursive: true })

const viewports = [
  { name: '360', width: 360, height: 780, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '430', width: 430, height: 932, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1280', width: 1280, height: 800, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1920', width: 1920, height: 1080, mobile: false },
  { name: 'landscape-844', width: 844, height: 390, mobile: true },
]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
let failures = 0

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: 'no-preference',
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(base + query, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const offenders = []
    for (const el of document.querySelectorAll('main *, header *, footer *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0) continue
      // Ignore things that are meant to bleed: the marquee and decorative (aria-hidden) art.
      const clipped = !!el.closest('.marquee, [aria-hidden="true"], #mobile-menu[hidden]')
      // Text that spills out of its own box (e.g. a huge word in a narrow column).
      const spills = !clipped && !el.closest('.sr-only, .sr-only-focusable') && el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline'
      if (spills) offenders.push(`text spill: "${el.textContent.trim().slice(0, 40)}" (${el.scrollWidth} > ${el.clientWidth})`)
      if (!clipped && (r.right > vw + 0.5 || r.left < -0.5)) {
        offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(r.left)}→${Math.round(r.right)}]`)
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 8) }
  })

  const overflow = result.scrollWidth > result.vw || result.offenders.length > 0
  if (overflow || errors.length) failures++
  console.log(
    `${overflow ? '✗' : '✓'} ${vp.name.padEnd(14)} scrollWidth=${result.scrollWidth} vw=${result.vw}` +
      (result.offenders.length ? `\n    overflow: ${result.offenders.join('\n              ')}` : '') +
      (errors.length ? `\n    errors: ${errors.join(' | ')}` : ''),
  )
  await page.screenshot({ path: `${out}/${vp.name}${full ? '-full' : ''}.png`, fullPage: full })
  await ctx.close()
}

await browser.close()
if (failures) {
  console.error(`\n${failures} viewport(s) failed`)
  process.exit(1)
}
console.log('\nNo horizontal overflow at any width.')
