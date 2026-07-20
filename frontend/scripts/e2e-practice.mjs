// E2E stage 2: practice workspace — play, loop, mixer, trainer, jam,
// shortcut overlay, reduced-motion, practice-history logging.
// Usage: node scripts/e2e-practice.mjs [videoId] [outdir]
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
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${outdir}/e2e-5-workspace.png`, fullPage: true })

  // play + let it run, then set an A-B loop with L … L
  await page.keyboard.press(' ')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${outdir}/e2e-6-playing.png` })
  await page.keyboard.press('l')
  await page.waitForTimeout(5000)
  await page.keyboard.press('l')
  await page.waitForTimeout(500)

  // slow down to 85%
  await page.keyboard.press('[')
  await page.keyboard.press('[')
  await page.keyboard.press('[')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outdir}/e2e-7-loop-slow.png` })

  // mixer: solo the guitar, mute the vocals
  await page.getByTitle('Solo Guitar').click()
  await page.getByTitle('Mute Vocals').click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outdir}/e2e-8-mixer.png` })
  await page.getByTitle('Unsolo Guitar').click()
  await page.getByTitle('Unmute Vocals').click()

  // speed trainer over the loop; let it wrap a couple of passes
  await page.getByTitle('Start ramping').click()
  console.log('trainer started, waiting for passes…')
  await page.waitForFunction(
    () => {
      const log = document.querySelector('[data-testid="trainer-log"]')
      return log && log.textContent.split('→').length >= 3
    },
    { timeout: 90000 },
  )
  await page.screenshot({ path: `${outdir}/e2e-9-trainer.png` })
  const ramp = await page.locator('[data-testid="trainer-log"]').textContent()
  console.log('trainer ramp:', ramp)
  await page.getByRole('button', { name: 'Stop' }).click()

  // jam mode
  await page.getByRole('button', { name: /Jam over backing track/ }).click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${outdir}/e2e-10-jam.png`, fullPage: true })
  await page.getByRole('button', { name: /Exit jam/ }).click()
  await page.keyboard.press(' ') // pause

  // keyboard overlay
  await page.keyboard.press('?')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outdir}/e2e-11-shortcuts.png` })
  await page.keyboard.press('Escape')

  // reduced-motion: decorative animation + transitions collapse to ~0ms
  const before = await page.evaluate(() => {
    const el = document.querySelector('.animate-rise') ?? document.body
    return getComputedStyle(el).animationDuration
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => {
    const el = document.querySelector('.animate-rise') ?? document.body
    const play = document.querySelector('[title^="Play"], [title^="Pause"]')
    return {
      animationDuration: getComputedStyle(el).animationDuration,
      playButtonTransition: play ? getComputedStyle(play).transitionDuration : null,
    }
  })
  console.log('reduced-motion check — animation duration normal:', before, '→ reduced:', JSON.stringify(after))
  await page.emulateMedia({ reducedMotion: null })

  // leave the page via SPA nav → practice session flushes
  await page.getByRole('link', { name: 'LIBRARY' }).click()
  await page.waitForTimeout(1500)
  const sessions = await (
    await fetch(`http://localhost:8000/api/songs/${videoId}/practice-sessions`)
  ).json()
  console.log('practice sessions:', JSON.stringify(sessions, null, 2).slice(0, 1200))

  // back to the song: the practice log panel should render the session
  await page.goto(`http://localhost:5173/songs/${videoId}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="practice-history"]', { timeout: 60000 })
  await page.locator('[data-testid="practice-history"]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page
    .locator('[data-testid="practice-history"]')
    .screenshot({ path: `${outdir}/e2e-12-practice-log.png` })
  console.log('practice log rendered')
} finally {
  console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'no console errors')
  await browser.close()
}
