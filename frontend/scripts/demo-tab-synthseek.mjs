// AC2 evidence: synth mode — cursor moves during playback and click-to-seek
// jumps it, measured via the beat cursor's bounding rect.
import { chromium } from 'playwright-core'

const url = 'http://localhost:5173/songs/Rfirxs_NUcE'
const shotDir = process.argv[2] ?? '.'
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1500 } })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await page.getByTitle('Play (space)').waitFor({ timeout: 60_000 })
  await page.waitForFunction(
    () => document.querySelectorAll('.at-surface svg, .at-surface canvas').length > 0,
    { timeout: 60_000 },
  )
  await page.waitForTimeout(1000)

  const rect = () =>
    page.evaluate(() => {
      const c = document.querySelector('.at-cursor-beat')
      if (!c) return null
      const r = c.getBoundingClientRect()
      return { x: Math.round(r.x + window.scrollX), y: Math.round(r.y + window.scrollY) }
    })

  await page.getByText('▶ Play synth').click()
  await page.waitForSelector('.at-cursor-beat', { timeout: 30_000 })
  await page.waitForTimeout(1000)
  const a = await rect()
  await page.waitForTimeout(3000)
  const b = await rect()
  console.log('synth cursor moved during playback:', JSON.stringify(a), '→', JSON.stringify(b))

  // click a beat in the second system to seek the synth
  const tabArea = page.locator('[data-testid=tab-scroll]')
  await tabArea.scrollIntoViewIfNeeded()
  const box = await tabArea.boundingBox()
  await page.mouse.click(box.x + box.width * 0.5, box.y + 420)
  await page.waitForTimeout(800)
  const c = await rect()
  console.log('after beat click, cursor jumped to:', JSON.stringify(c))
  await page.screenshot({ path: `${shotDir}/tab-synth-clickseek.png` })
} finally {
  await browser.close()
}
