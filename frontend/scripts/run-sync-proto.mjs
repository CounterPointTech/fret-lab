// Drives the /proto/sync page in headless system Chrome and prints results.
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5173/proto/sync'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[console.error]', msg.text())
  })
  page.on('pageerror', (err) => console.error('[pageerror]', err.message))

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // Vite may discover/optimize new deps on first load and force a reload,
  // which would wipe the running scenario — warm up, then start fresh.
  await page.waitForTimeout(3000)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: /Run full scenario/ }).click()

  // Loading + full scenario is ~2 minutes; poll state.
  const deadline = Date.now() + 8 * 60 * 1000
  let lastLog = 0
  for (;;) {
    if (Date.now() > deadline) throw new Error('timed out waiting for scenario')
    const snap = await page.evaluate(() => ({
      state: window.__syncProto?.state ?? document.querySelector('p')?.textContent,
      wraps: window.__syncProto?.wrapCount ?? 0,
      results: window.__syncProto?.results ?? null,
      log: [...document.querySelectorAll('div.space-y-1 p')].map((p) => p.textContent),
    }))
    if (snap.log.length > lastLog) {
      snap.log.slice(lastLog).forEach((l) => console.log('[page]', l))
      lastLog = snap.log.length
    }
    if (snap.results) {
      console.log('WRAP_COUNT:', snap.wraps)
      console.log('RESULTS_JSON:', JSON.stringify(snap.results))
      break
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
} finally {
  await browser.close()
}
