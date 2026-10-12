/**
 * Content check: every line of brief §4 (docs/BRIEF.md) must appear in the rendered page text.
 *   node scripts/check-content.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173/'
const brief = readFileSync(new URL('../docs/BRIEF.md', import.meta.url), 'utf8')
const section = brief.split('## 4. Content')[1].split('\n## 5.')[0]
const body = section.split('### Hero')[1]

const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase()
const needles = new Set()
for (let line of body.split('\n')) {
  line = line.trim()
  if (!line || /^-+$/.test(line) || (line.startsWith('###') && /hero|final/i.test(line))) continue
  line = line.replace(/^###\s*/, '').replace(/^-\s*/, '').replace(/\*\*/g, '').replace(/`[^`]*`/g, '')
  line = line.replace(/\[ REGISTER NOW \]\s*(→)?/, 'Register Now').replace(/^Focus:\s*/, '')
  for (const part of line.split(/ — |: | · /)) {
    const p = part.trim().replace(/:$/, '')
    if (p && p !== '→') needles.add(p)
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(base, { waitUntil: 'networkidle' })
const text = norm(await page.evaluate(() => document.body.innerText))
await browser.close()

const missing = [...needles].filter((n) => !text.includes(norm(n)))
if (/adb huta/i.test(text)) missing.push('(misspelling "ADB HUTA" present)')
console.log(`${needles.size - missing.length}/${needles.size} brief fragments found on the page`)
if (missing.length) {
  console.error('Missing:\n  ' + missing.join('\n  '))
  process.exit(1)
}
