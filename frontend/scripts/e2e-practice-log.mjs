// E2E stage 2b: verify a practice session is recorded and rendered.
// Usage: node scripts/e2e-practice-log.mjs [videoId] [outdir]
import { chromium } from 'playwright-core'

const outdir = process.argv[3] ?? '../docs/goals/shots'
let videoId = process.argv[2]
if (!videoId) {
  const { songs } = await (await fetch('http://localhost:8000/api/songs')).json()
  videoId = songs[0].video_id
  console.log('newest song:', songs[0].title, videoId)
}

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

  await page.goto(`http://localhost:5173/songs/${videoId}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[title="Play (space)"]', { timeout: 120000 })
  await page.waitForTimeout(1000)

  // practice: play, loop a section, slow to 85%, let it wrap a few times
  await page.keyboard.press(' ')
  await page.waitForTimeout(3000)
  await page.keyboard.press('l')
  await page.waitForTimeout(4000)
  await page.keyboard.press('l') // loop set: ~4s section
  await page.keyboard.press('[')
  await page.keyboard.press('[')
  await page.keyboard.press('[') // 85%
  console.log('looping at 85%…')
  await page.waitForTimeout(12000) // ≥2 wraps
  await page.keyboard.press(']') // 90% — a new top speed for the section
  await page.waitForTimeout(6000)
  await page.keyboard.press(' ') // pause

  // leave via SPA nav → session flushes
  await page.getByRole('link', { name: 'Library' }).click()
  await page.waitForTimeout(2000)
  const data = await (
    await fetch(`http://localhost:8000/api/songs/${videoId}/practice-sessions`)
  ).json()
  console.log('practice sessions:', JSON.stringify(data, null, 2).slice(0, 1500))
  if (!data.sessions.length) throw new Error('no session recorded!')

  // reopen: the log panel must render it
  await page.goto(`http://localhost:5173/songs/${videoId}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="practice-history"]', { timeout: 120000 })
  await page.locator('[data-testid="practice-history"]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page
    .locator('[data-testid="practice-history"]')
    .screenshot({ path: `${outdir}/e2e-12-practice-log.png` })
  console.log('practice log rendered ✔')
} finally {
  console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'no console errors')
  await browser.close()
}
