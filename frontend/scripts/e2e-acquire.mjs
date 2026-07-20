// E2E stage 1: search → add → download → separate, screenshotting each stage.
// Usage: node scripts/e2e-acquire.mjs "<search query>" <outdir>
import { chromium } from 'playwright-core'

const query = process.argv[2] ?? 'Judas Priest Breaking the Law official audio'
const outdir = process.argv[3] ?? '../docs/goals/shots'

const errors = []
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)

  // 1. search modal
  await page.getByRole('button', { name: /Add song/ }).click()
  await page.getByPlaceholder(/Search a song/).fill(query)
  await page.keyboard.press('Enter')
  await page.waitForSelector('div[role="dialog"] img', { timeout: 30000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${outdir}/e2e-1-search.png` })

  // 2. pick the first result
  const first = page.locator('div[role="dialog"] button:has(img)').first()
  const title = await first.locator('span span').first().textContent()
  console.log('picking:', title)
  await first.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${outdir}/e2e-2-downloading.png` })

  // 3. wait for the download to finish (card stops showing progress)
  await page.waitForFunction(
    () => [...document.querySelectorAll('article')].some((a) => /Separate stems/.test(a.textContent)),
    { timeout: 180000 },
  )
  console.log('download done')

  // 4. kick off separation on that card
  await page.getByRole('button', { name: /Separate stems/ }).first().click()
  await page.waitForTimeout(8000)
  await page.screenshot({ path: `${outdir}/e2e-3-separating.png` })

  // 5. wait for 6 stems (card shows "6 stems")
  await page.waitForFunction(
    () => [...document.querySelectorAll('article')].some((a) => /6 stems/.test(a.textContent)),
    { timeout: 600000 },
  )
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${outdir}/e2e-4-ready.png` })
  console.log('separation done')
} finally {
  console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'no console errors')
  await browser.close()
}
