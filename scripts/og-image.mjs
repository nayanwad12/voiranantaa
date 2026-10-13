/**
 * Generates the placeholder OG_IMAGE (public/og-image.png, 1200×630): a typographic card
 * built from site copy and the project fonts. Replace with final artwork when available.
 *   npm run og
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const font = (f) => `data:font/woff2;base64,${readFileSync(new URL(`../src/assets/fonts/${f}`, import.meta.url)).toString('base64')}`

const html = `<!doctype html><html><head><style>
@font-face{font-family:IS;src:url(${font('instrument-serif-latin-400-normal.woff2')})}
@font-face{font-family:ISI;src:url(${font('instrument-serif-latin-400-italic.woff2')})}
@font-face{font-family:Inter;src:url(${font('inter-latin-wght-normal.woff2')});font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0a0a0a;color:#f2eee6;font-family:Inter;position:relative;overflow:hidden}
.glow{position:absolute;inset:0;background:radial-gradient(40% 50% at 50% 52%,rgba(242,238,230,.07),transparent)}
svg{position:absolute;left:50%;top:52%;width:1100px;transform:translate(-50%,-50%);opacity:.32}
.wrap{position:absolute;inset:56px 64px;display:flex;flex-direction:column;justify-content:space-between}
.row{display:flex;justify-content:space-between;font-size:15px;letter-spacing:.24em;font-weight:500}
.muted{color:#d6d1c8}
h1{font-family:IS;font-weight:400;font-size:168px;line-height:.86;letter-spacing:-.01em}
h1 span{display:block;padding-left:1.6em}
.tag{font-family:ISI;font-size:38px}
</style></head><body><div class="glow"></div>
<svg viewBox="0 0 200 100" fill="none"><path d="M100 50 C 125 15, 175 15, 175 50 S 125 85, 100 50 S 25 15, 25 50 S 75 85, 100 50 Z" stroke="#f2eee6" stroke-width=".35"/></svg>
<div class="wrap">
<div class="row"><span class="muted">EDITION 01</span><span>INFINITE RAGA</span></div>
<h1>VOIR<span>ANANTA</span></h1>
<div class="row" style="align-items:flex-end"><span class="tag" style="letter-spacing:0">TO SEE THE INFINITE.</span><span class="muted">VOIRTALES</span></div>
</div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og-image.png' })
await browser.close()
console.log('wrote public/og-image.png')
