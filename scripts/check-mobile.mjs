/**
 * فحص الهاتف: يدخل بكل حساب تجريبي، ويفتح كل شاشة في قائمته بعرض هاتف (390 بكسل)،
 * ويُبلغ عن أي صفحة أعرض من الشاشة (تمرير أفقي). يوقف العملية إن وجد واحدة.
 * التشغيل: npm run build && npm run mobile   (يحتاج vite preview على المنفذ 4173 أو يشغّله بنفسه)
 * المتصفح: CHROME_PATH، وإلا متصفح Playwright المثبّت (npx playwright install chromium).
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const ACCOUNTS = ['admin', 'supervisor', 'editor', 'manager', 'teacher', 'aicha', 'khadija', 'anas', 'yahya', 'maryam', 'support']
const WIDTH = 390

async function up() {
  try { await fetch(BASE); return null } catch { /* يُشغَّل */ }
  const p = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 250)); try { await fetch(BASE); return p } catch { /* انتظار */ } }
  throw new Error('تعذّر تشغيل vite preview')
}

const server = await up()
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: WIDTH, height: 844 }, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))
const bad = []
let checked = 0

for (const user of ACCOUNTS) {
  await page.goto(BASE + '#/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.fill('input[autocomplete=username]', user)
  await page.fill('input[type=password]', '1234')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1200)
  // صاحب أكثر من دور: كل أدواره تُفحص
  const roles = page.url().includes('choose-role') ? await page.locator('.role-card').count() : 1
  for (let r = 0; r < roles; r++) {
    if (page.url().includes('choose-role') || r > 0) {
      if (r > 0) { await page.goto(BASE + '#/choose-role'); await page.waitForTimeout(600) }
      await page.locator('.role-card').nth(r).click()
      await page.waitForTimeout(900)
    }
    const routes = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/app/"]')].map((a) => a.getAttribute('href')))])
    for (const href of routes) {
      await page.goto(BASE + href)
      await page.waitForTimeout(700)
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      checked++
      if (sw > 1) bad.push(`${user} (دور ${r + 1}) ${href}: أعرض من الشاشة بـ ${sw} بكسل`)
    }
  }
}
await browser.close()
server?.kill()
if (errors.length) console.error('أخطاء في الصفحات:\n' + [...new Set(errors)].join('\n'))
if (bad.length) {
  console.error(`\n✗ ${bad.length} شاشة تخرج عن عرض الهاتف (${WIDTH} بكسل):\n` + bad.join('\n'))
  process.exit(1)
}
console.log(`✓ ${checked} شاشة تناسب عرض الهاتف (${WIDTH} بكسل)`)
