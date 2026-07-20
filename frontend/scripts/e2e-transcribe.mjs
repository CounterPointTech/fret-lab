// E2E stage 3: AI-transcribe the guitar stem → tab renders → open the editor.
// Usage: node scripts/e2e-transcribe.mjs [videoId] [outdir]
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
  await page.waitForTimeout(1500)

  // open the guitar lane's transcribe popover and start the job
  await page.getByTitle('Transcribe the guitar stem to tab (AI draft)').click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outdir}/e2e-13-transcribe-popover.png` })
  await page.getByRole('button', { name: /Transcribe → AI draft/ }).click()
  console.log('transcription started…')

  // wait for the draft to land (toast + tab panel select). Basic Pitch takes a while.
  await page.waitForFunction(
    () => document.body.textContent.includes('AI draft ready for guitar'),
    { timeout: 300000 },
  )
  console.log('draft ready')

  // let AlphaTab load + render the score
  await page.waitForSelector('[data-testid="tab-scroll"]', { timeout: 60000 })
  await page.waitForFunction(
    () => !document.body.textContent.includes('Rendering score…'),
    { timeout: 120000 },
  )
  await page.waitForTimeout(3000)
  const tab = page.locator('[data-testid="tab-scroll"]')
  await tab.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${outdir}/e2e-14-tab-draft.png`, fullPage: true })

  // enter the correction editor
  await page.locator('[data-testid="edit-toggle"]').click()
  await page.waitForTimeout(1200)
  await tab.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${outdir}/e2e-15-editor.png`, fullPage: true })
  console.log('editor open')
} finally {
  console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'no console errors')
  await browser.close()
}
