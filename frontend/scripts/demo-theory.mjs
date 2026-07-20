// Phase 7 acceptance demo: chord timeline sync, Jam Mode (guitar muted +
// scale/chord-tone fretboard), Theory Lab CAGED boxes + tuning change,
// metronome. Saves screenshots along the way.
import { chromium } from 'playwright-core'

const videoId = process.argv[2] ?? 'BOTIIw76qiE' // Paranoid (E minor)
const shotDir = process.argv[3] ?? '.'
const base = process.argv[4] ?? 'http://localhost:5178'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  page.on('pageerror', (e) => console.error('[pageerror]', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('[console]', m.text())
  })

  // ---- 1) chord timeline synced to playback --------------------------------
  await page.goto(`${base}/songs/${videoId}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await page.reload({ waitUntil: 'domcontentloaded' }) // settle vite dep optimizer
  await page.getByTitle('Play (space)').waitFor({ timeout: 60_000 })
  await page.waitForSelector('[data-testid=chord-timeline]', { timeout: 30_000 })
  const keyBadge = await page.locator('[data-testid=chord-timeline] a').first().textContent()
  console.log('key badge:', keyBadge)

  await page.getByTitle('Play (space)').click()
  await page.waitForTimeout(9000)
  const chord1 = await page.locator('[data-testid=current-chord]').textContent()
  await page.screenshot({ path: `${shotDir}/timeline-moment1.png`, fullPage: false })
  console.log('t≈9s sounding chord:', chord1)

  await page.waitForTimeout(13_000)
  const chord2 = await page.locator('[data-testid=current-chord]').textContent()
  await page.screenshot({ path: `${shotDir}/timeline-moment2.png`, fullPage: false })
  console.log('t≈22s sounding chord:', chord2)
  console.log('chord changed between moments:', chord1 !== chord2)

  // ---- 2) Jam Mode ---------------------------------------------------------
  await page.getByRole('button', { name: 'Jam over backing track' }).click()
  await page.waitForSelector('[data-testid=jam-panel] svg', { timeout: 15_000 })
  await page.waitForTimeout(4000) // let a chord land so its tones highlight
  const guitarMuted = await page.getByTitle('Unmute Guitar').count()
  const greenDots = await page
    .locator('[data-testid=jam-panel] circle[fill="#34d399"]')
    .count()
  const amberDots = await page
    .locator('[data-testid=jam-panel] circle[fill="#f59e0b"]')
    .count()
  const scaleChip = await page
    .locator('[data-testid=jam-panel] button.bg-amp-500')
    .first()
    .textContent()
  console.log('guitar muted:', guitarMuted === 1)
  console.log('recommended scale:', scaleChip)
  console.log('chord-tone (green) dots:', greenDots, '| root (amber) dots:', amberDots)
  await page
    .locator('[data-testid=jam-panel]')
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${shotDir}/jam-mode.png`, fullPage: false })
  await page.getByRole('button', { name: 'Exit jam' }).click()

  // ---- 3) Theory Lab: pentatonic + CAGED, tuning change --------------------
  await page.goto(`${base}/theory?key=E%20minor&song=${videoId}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForSelector('.fretboard-view svg', { timeout: 30_000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${shotDir}/theory-whole-neck.png`, fullPage: true })
  console.log('theory lab loaded (E minor pentatonic, whole neck)')

  await page.getByRole('button', { name: 'Box 1 · E shape' }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${shotDir}/theory-box1-standard.png`, fullPage: false })
  console.log('box 1 (E shape) selected, standard tuning')

  await page.locator('select').nth(3).selectOption('dropD') // tuning select
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${shotDir}/theory-box1-dropd.png`, fullPage: false })
  console.log('tuning switched to Drop D')

  // ---- 4) metronome --------------------------------------------------------
  const metronome = page.locator('text=Metronome').locator('..')
  await metronome.getByRole('button', { name: 'Start' }).click()
  await page.waitForTimeout(2600)
  await metronome.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${shotDir}/metronome-running.png`, fullPage: false })
  await metronome.getByRole('button', { name: 'Stop' }).click()
  console.log('metronome ran (lookahead scheduler: src/theory/metronome.ts)')

  console.log('DONE')
} finally {
  await browser.close()
}
