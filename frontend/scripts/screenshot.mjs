// Quick full-page screenshot of any app route via headless system Chrome.
// Usage: node scripts/screenshot.mjs <path-or-url> <outfile.png> [waitMs]
import { chromium } from 'playwright-core'

const target = process.argv[2] ?? '/'
const outfile = process.argv[3] ?? 'screenshot.png'
const waitMs = Number(process.argv[4] ?? 2500)
const url = target.startsWith('http') ? target : `http://localhost:5173${target}`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(waitMs)
  await page.screenshot({ path: outfile, fullPage: true })
  console.log('saved', outfile)
} finally {
  await browser.close()
}
