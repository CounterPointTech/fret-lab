// Phase 4 acceptance demo: renders canon.gp (tab + notation), plays the
// AlphaTab synth with cursor, then switches to the Smoke on the Water riff in
// follow-audio mode at 0.7x — capturing sync logs, two cursor positions,
// bar-click seek and selection-loop evidence, plus sync persistence.
import { chromium } from 'playwright-core'

const videoId = process.argv[2] ?? 'Rfirxs_NUcE'
const shotDir = process.argv[3] ?? '.'
const url = `http://localhost:5173/songs/${videoId}`

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1500 } })
  page.on('pageerror', (e) => console.error('[pageerror]', e.message))
  page.on('console', (m) => {
    const t = m.text()
    if (m.type() === 'error' || /^\[(tabsync|tabclick|tabloop)\]/.test(t) || t.includes('AlphaTab'))
      console.log('[console]', t.slice(0, 220))
  })

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500)
  await page.reload({ waitUntil: 'domcontentloaded' }) // settle vite dep optimizer
  await page.getByTitle('Play (space)').waitFor({ timeout: 60_000 })
  console.log('workspace ready (stems loaded)')

  const tabSelect = page.locator('select:has(option:text-is("canon.gp"))')
  await tabSelect.waitFor({ timeout: 30_000 })

  const renderedWait = async () => {
    await page.waitForFunction(
      () => document.querySelectorAll('.at-surface svg, .at-surface canvas').length > 0,
      { timeout: 60_000 },
    )
    await page.waitForTimeout(1500)
  }

  // ---- AC1: canon.gp renders as tab + standard notation -------------------
  await renderedWait()
  await page.screenshot({ path: `${shotDir}/tab-canon-rendered.png`, fullPage: false })
  const tabArea = page.locator('[data-testid=tab-scroll]')
  await tabArea.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${shotDir}/tab-canon-rendered-scrolled.png` })
  console.log('AC1: canon.gp rendered, screenshot saved')

  // ---- AC2: synth playback with moving cursor -----------------------------
  await page.getByText('▶ Play synth').click()
  await page.waitForSelector('.at-cursor-beat', { timeout: 30_000 })
  const cursorX = async () =>
    await page.evaluate(() => {
      const c = document.querySelector('.at-cursor-beat')
      return c ? { x: c.offsetLeft, y: c.offsetTop } : null
    })
  await page.waitForTimeout(2500)
  const synthPos1 = await cursorX()
  await page.screenshot({ path: `${shotDir}/tab-synth-cursor.png` })
  await page.waitForTimeout(3000)
  const synthPos2 = await cursorX()
  console.log('AC2: synth cursor moved from', JSON.stringify(synthPos1), 'to', JSON.stringify(synthPos2))
  await page.getByText('⏸ Pause').click()

  // ---- AC3: follow-audio mode at 0.7x -------------------------------------
  await tabSelect.selectOption({ label: 'smoke_riff.alphatex' })
  await renderedWait()
  await page.getByText('🎧 Follow audio').click()
  await page.waitForTimeout(1000)

  // sync editor: BPM defaults to score tempo (112); nudge offset +0.1s
  const bpmValue = await page.locator('[data-testid=sync-editor] input[type=number]').inputValue()
  await page.locator('[data-testid=sync-editor] button', { hasText: '+0.1' }).click()
  console.log(`sync configured: bpm=${bpmValue} offset=+0.1s`)

  // 0.7x speed via the transport slider
  await page.locator('input[type=range][min="50"]').fill('70')
  await page.waitForTimeout(1300) // let the debounced PATCH persist

  await page.getByTitle('Play (space)').click()
  await page.waitForTimeout(3000)
  await tabArea.scrollIntoViewIfNeeded()
  const followPos1 = await cursorX()
  await page.screenshot({ path: `${shotDir}/tab-follow-07x-pos1.png` })
  console.log('AC3: follow-audio screenshot 1, cursor at', JSON.stringify(followPos1))
  await page.waitForTimeout(10_000)
  const followPos2 = await cursorX()
  await page.screenshot({ path: `${shotDir}/tab-follow-07x-pos2.png` })
  console.log('AC3: follow-audio screenshot 2, cursor at', JSON.stringify(followPos2))

  // ---- AC4: click a bar → StemPlayer seeks --------------------------------
  const posText = async () =>
    (await page.locator('p.font-mono.text-lg').first().textContent()) ?? ''
  const before = await posText()
  const box = await tabArea.boundingBox()
  if (!box) throw new Error('tab area not found')
  // click into a bar further down the first system
  await page.mouse.click(box.x + box.width * 0.72, box.y + 150)
  await page.waitForTimeout(700)
  const after = await posText()
  console.log(`AC4: bar click — transport before="${before.trim()}" after="${after.trim()}"`)
  await page.screenshot({ path: `${shotDir}/tab-barclick-seek.png` })

  // ---- bonus: drag-select on the tab → A-B loop ---------------------------
  await page.mouse.move(box.x + box.width * 0.15, box.y + 150)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + 150, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(800)
  const loopLabel = await page
    .locator('span', { hasText: /^LOOP / })
    .first()
    .textContent()
    .catch(() => null)
  console.log('selection loop label:', loopLabel)
  await page.screenshot({ path: `${shotDir}/tab-selection-loop.png` })

  // ---- persistence: sync survives in the DB -------------------------------
  const persisted = await page.evaluate(async (vid) => {
    const r = await fetch(`/api/songs/${vid}/transcriptions`)
    return (await r.json()).transcriptions.map((t) => ({
      name: t.name,
      sync_bpm: t.sync_bpm,
      sync_offset_s: t.sync_offset_s,
    }))
  }, videoId)
  console.log('persisted sync models:', JSON.stringify(persisted))

  console.log('demo complete')
} finally {
  await browser.close()
}
