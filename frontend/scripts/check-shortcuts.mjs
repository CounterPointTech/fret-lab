// Verifies workspace keyboard shortcuts: space (play/pause), [ ] (speed),
// arrows (seek), L twice (loop A/B) and L again (clear).
import { chromium } from 'playwright-core'

const videoId = process.argv[2] ?? '3pVQj2v7tBI'
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('pageerror', (e) => console.error('[pageerror]', e.message))
  await page.goto(`http://localhost:5173/songs/${videoId}`, { waitUntil: 'domcontentloaded' })
  await page.getByTitle('Play (space)').waitFor({ timeout: 60_000 })
  await page.locator('body').click() // focus the page, away from inputs

  const speedText = () => page.locator('span.text-amp-300.font-mono, span.font-mono.text-amp-300').first().textContent()
  const timeText = () => page.locator('p.font-mono.text-lg').textContent()

  await page.keyboard.press('Space')
  await page.waitForTimeout(800)
  const playingAfterSpace = (await page.getByTitle('Pause (space)').count()) === 1
  console.log('space starts playback:', playingAfterSpace)

  const before = await speedText()
  await page.keyboard.press('[')
  await page.waitForTimeout(300)
  const afterDown = await speedText()
  await page.keyboard.press(']')
  await page.keyboard.press(']')
  await page.waitForTimeout(300)
  const afterUp = await speedText()
  console.log(`speed nudge: ${before?.trim()} -[→ ${afterDown?.trim()} -]]→ ${afterUp?.trim()} (clamped at 100%)`)

  const t1 = await timeText()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(300)
  const t2 = await timeText()
  console.log(`arrow seek: ${t1?.split('/')[0].trim()} → ${t2?.split('/')[0].trim()}`)

  await page.keyboard.press('l')
  await page.waitForTimeout(2500)
  await page.keyboard.press('l')
  await page.waitForTimeout(300)
  const loopBadge = await page.locator('span', { hasText: /^LOOP / }).textContent().catch(() => null)
  console.log('L twice sets loop:', loopBadge)
  await page.keyboard.press('l')
  await page.waitForTimeout(300)
  const cleared = (await page.locator('span', { hasText: /^LOOP / }).count()) === 0
  console.log('L again clears loop:', cleared)

  await page.keyboard.press('Space')
  await page.waitForTimeout(500)
  const pausedAgain = (await page.getByTitle('Play (space)').count()) === 1
  console.log('space pauses:', pausedAgain)
  console.log('DONE')
} finally {
  await browser.close()
}
