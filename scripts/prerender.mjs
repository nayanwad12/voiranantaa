/**
 * Injects the server-rendered page into dist/index.html so every word of copy is in the HTML
 * itself — visible before any JavaScript runs, and readable by search engines.
 * Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const html = render()
const file = resolve('dist/index.html')
const template = readFileSync(file, 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('root placeholder not found in dist/index.html')
writeFileSync(file, template.replace('<div id="root"></div>', `<div id="root">${html}</div>`))
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${Math.round(html.length / 1024)} KB of HTML into dist/index.html`)
