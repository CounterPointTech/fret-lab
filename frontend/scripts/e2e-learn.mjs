// E2E: Learn area — catalog, lesson + quiz, progress recording, /theory redirect, nav order.
// Usage: node scripts/e2e-learn.mjs [outdir]
import { chromium } from 'playwright-core'

const outdir = process.argv[2] ?? '../docs/goals/shots'
const errors = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

  // 1. catalog
  await page.goto('http://localhost:5173/learn', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text=Guitar Theory Foundations', { timeout: 30000 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${outdir}/learn-1-catalog.png`, fullPage: true })

  // nav order
  const navLabels = await page.$$eval('header nav a, header a[class*="rounded-lg"]', (as) =>
    as.map((a) => a.textContent.trim()).filter(Boolean),
  )
  console.log('nav links:', JSON.stringify(navLabels))

  // 2. course syllabus
  await page.click('text=Guitar Theory Foundations')
  await page.waitForSelector('text=The Musical Alphabet', { timeout: 30000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${outdir}/learn-2-course.png`, fullPage: true })

  // 3. lesson 1
  await page.click('text=The Musical Alphabet & the Fretboard Map')
  await page.waitForSelector('[data-testid="quiz"]', { timeout: 30000 })
  await page.waitForTimeout(2500) // fretboard render
  await page.screenshot({ path: `${outdir}/learn-3-lesson.png`, fullPage: true })

  // 4. take the quiz: q1 deliberately wrong, rest right
  const quiz = page.locator('[data-testid="quiz"]')
  await quiz.locator('button', { hasText: 'A–B and C–D' }).click() // wrong
  await page.waitForTimeout(500)
  await quiz.locator('button', { hasText: /^A$/ }).click() // right (fret 5 = A)
  await page.waitForTimeout(300)
  await quiz.locator('button', { hasText: 'One half step' }).click() // right
  await page.waitForTimeout(1200)
  await quiz.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${outdir}/learn-4-quiz.png`, fullPage: true })

  const progress = await (await fetch('http://localhost:8000/api/learn/progress')).json()
  console.log('recorded progress:', JSON.stringify(progress))

  // 5. /theory redirect preserves params
  await page.goto('http://localhost:5173/theory?key=A%20minor&song=AMfG3sMo34s', {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForTimeout(1500)
  const url = page.url()
  console.log('redirected to:', url)
  if (!url.includes('/learn/tools?key=A%20minor&song=AMfG3sMo34s')) {
    throw new Error(`redirect lost params: ${url}`)
  }
  await page.screenshot({ path: `${outdir}/learn-5-tools.png` })

  // 6. back to catalog: ring should show progress
  await page.goto('http://localhost:5173/learn', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${outdir}/learn-6-catalog-progress.png` })
  console.log('done')
} finally {
  console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'no console errors')
  await browser.close()
}
