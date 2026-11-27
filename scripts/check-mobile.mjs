/**
 * فحص الهاتف: يدخل بكل حساب تجريبي، ويفتح كل شاشة في قائمته بعرض هاتف (390 بكسل)،
 * ويُبلغ عن: صفحة أعرض من الشاشة، أو عنصر يخرج عن إطار بطاقته، أو زر/تبويب انكسر نصه على سطرين.
 * يوقف العملية إن وجد واحدة.
 * التشغيل: npm run build && npm run mobile   (يحتاج vite preview على المنفذ 4173 أو يشغّله بنفسه)
 * المتصفح: CHROME_PATH، وإلا متصفح Playwright المثبّت (npx playwright install chromium).
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const ACCOUNTS = ['admin', 'supervisor', 'editor', 'manager', 'teacher', 'aicha', 'khadija', 'anas', 'yahya', 'maryam', 'support']
const WIDTH = Number(process.env.WIDTH || 360)

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
      const res = await page.evaluate(() => {
        const out = []
        const sw = document.documentElement.scrollWidth - document.documentElement.clientWidth
        if (sw > 1) out.push(`أعرض من الشاشة بـ ${sw} بكسل`)
        const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
        const name = (e) => e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '') + ` «${(e.innerText || '').trim().slice(0, 20)}»`
        // 1) عنصر يخرج عن إطار بطاقته (الحاوية ذات الإطار أو الخلفية)
        for (const box of document.querySelectorAll('.panel, .card, .p-card, .p-selectbutton, .p-dialog-content')) {
          if (!vis(box) || getComputedStyle(box).overflow !== 'visible') continue
          const b = box.getBoundingClientRect()
          for (const e of box.querySelectorAll('*')) {
            const cs = getComputedStyle(e)
            if (!vis(e) || cs.position === 'absolute' || cs.position === 'fixed') continue
            // محتوى <details> مطويّ: له أبعاد لكنه غير ظاهر
            const det = e.closest('details:not([open])')
            if (det && box.contains(det) && !e.closest('summary')) continue
            if (e.closest('[style*="overflow"], .p-datatable-table-container, .p-tablist-content') && e.closest('[style*="overflow"], .p-datatable-table-container, .p-tablist-content') !== box && box.contains(e.closest('[style*="overflow"], .p-datatable-table-container, .p-tablist-content'))) continue
            let a = e.parentElement, clipped = false
            while (a && a !== box) { if (getComputedStyle(a).overflow !== 'visible') { clipped = true; break } a = a.parentElement }
            if (clipped) continue
            const r = e.getBoundingClientRect()
            if (r.left < b.left - 2 || r.right > b.right + 2 || r.bottom > b.bottom + 2) { out.push(`يخرج عن إطاره: ${name(e)} داخل ${name(box)}`); break }
          }
        }
        // 2) زر أو تبويب انكسر نصه على سطرين
        for (const e of document.querySelectorAll('.p-togglebutton, .p-tab, .p-button:not(.p-button-icon-only)')) {
          if (!vis(e)) continue
          // نص انكسر: عقدة نصية واحدة تمتد على أكثر من سطر
          const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
          let wrapped = false
          for (let n = tw.nextNode(); n && !wrapped; n = tw.nextNode()) {
            if (!n.textContent.trim()) continue
            const rg = document.createRange()
            rg.selectNodeContents(n)
            const rs = [...rg.getClientRects()].filter((x) => x.width > 1)
            wrapped = new Set(rs.map((x) => Math.round(x.top))).size > 1
          }
          if (wrapped) out.push(`نص انكسر على سطرين: ${name(e)}`)
        }
        return [...new Set(out)].slice(0, 5)
      })
      checked++
      for (const m of res) bad.push(`${user} (دور ${r + 1}) ${href}: ${m}`)
    }
  }
}
await browser.close()
server?.kill()
if (errors.length) console.error('أخطاء في الصفحات:\n' + [...new Set(errors)].join('\n'))
if (bad.length) {
  console.error(`\n✗ ${bad.length} خطأ عرض على الهاتف (${WIDTH} بكسل):\n` + bad.join('\n'))
  process.exit(1)
}
console.log(`✓ ${checked} شاشة تناسب عرض الهاتف (${WIDTH} بكسل)`)
