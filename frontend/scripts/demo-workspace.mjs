// Drives the Song Workspace for the Phase 3 acceptance demo: mutes drums,
// sets 0.7x, creates an A-B loop, verifies loop wrap, runs the speed trainer
// 60→100 in 10% steps, and saves screenshots along the way.
import { chromium } from 'playwright-core'

const videoId = process.argv[2] ?? '3pVQj2v7tBI'
const shotDir = process.argv[3] ?? '.'
const url = `http://localhost:5173/songs/${videoId}`

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('pageerror', (e) => console.error('[pageerror]', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.text().startsWith('[trainer]')) console.log('[console]', m.text())
  })

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await page.reload({ waitUntil: 'domcontentloaded' }) // settle vite dep optimizer
  await page.getByTitle('Play (space)').waitFor({ timeout: 60_000 })
  console.log('workspace ready')

  // Waveform must be rendered for region dragging
  await page.waitForSelector('[data-testid=main-waveform]', { timeout: 30_000 })

  // 1) mute drums, set speed to 70%
  await page.getByTitle('Mute Drums').click()
  const speed = page.locator('input[type=range][min="50"]')
  await speed.fill('70')
  console.log('drums muted, speed set to 70%')

  // 2) drag an A-B region on the main waveform (60s..68s of a 340s song)
  const wave = page.locator('[data-testid=main-waveform]')
  const box = await wave.boundingBox()
  if (!box) throw new Error('waveform not found')
  const duration = 340.056
  const x1 = box.x + (60 / duration) * box.width
  const x2 = box.x + (68 / duration) * box.width
  const y = box.y + box.height / 2
  await page.mouse.move(x1, y)
  await page.mouse.down()
  await page.mouse.move(x2, y, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(300)
  const loopLabel = await page.locator('span', { hasText: /^LOOP / }).textContent().catch(() => null)
  console.log('loop set:', loopLabel)

  // 3) play; observe loop wrap via position resetting into the loop
  await page.getByTitle('Play (space)').click()
  await page.waitForTimeout(500)
  const posAt = async () =>
    parseFloat((await page.locator('p.font-mono.text-lg').textContent()).split('/')[0].split(':')[1])
  const before = await posAt()
  await page.screenshot({ path: `${shotDir}/workspace-loop-07x-drumsmuted.png`, fullPage: true })
  console.log('screenshot 1 saved; position in loop:', before)

  // wait long enough to see a wrap (8s loop at 0.7x ≈ 11.4s wall)
  let sawWrap = false
  let prev = before
  for (let i = 0; i < 60 && !sawWrap; i++) {
    await page.waitForTimeout(500)
    const p = await posAt()
    if (p < prev - 2) sawWrap = true
    prev = p
  }
  console.log('loop wrap observed:', sawWrap)

  // 4) speed trainer: 60 → 100 in 10% steps
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  console.log('trainer started')
  const t0 = Date.now()
  let lastLog = ''
  while (Date.now() - t0 < 120_000) {
    await page.waitForTimeout(1000)
    const log = await page.locator('[data-testid=trainer-log]').textContent().catch(() => '')
    if (log && log !== lastLog) {
      lastLog = log
      console.log('trainer ramp:', log)
    }
    if (log && log.includes('100%')) {
      // let it complete one pass at target then stop
      await page.waitForTimeout(3000)
      break
    }
  }
  await page.screenshot({ path: `${shotDir}/workspace-trainer.png`, fullPage: true })
  console.log('screenshot 2 saved; final ramp:', lastLog)

  await page.getByRole('button', { name: 'Stop' }).click().catch(() => {})
  console.log('DONE')
} finally {
  await browser.close()
}
