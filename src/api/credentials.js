import { respond, ApiError } from './client'
import { persons, assignments, classes, schools, levels } from '@/mock/db'
import { collection } from '@/mock/collections'

/**
 * أوراق الدخول — عمل إداري (مدير المدرسة، والإدارة العامة مع التصفية بالمدرسة).
 * ثلاث حالات فقط:
 *   الجميع: عند الإدراج أول مرة، مرتبة بالأقسام (لا تمسّ من غيّر كلمة مروره).
 *   الجدد: من سُجّل لاحقاً ولم تُطبع له ورقة.
 *   شخص: من نسي ورقته أو أراد تغيير كلمة مروره (بحث بالاسم أو اللقب) → كلمة مؤقتة جديدة.
 * الفئات: التلاميذ، الأولياء، المعلمون، الطاقم الإداري (للإدارة العامة).
 * في الخادم الحقيقي: كلمة المرور المؤقتة تُخزَّن مشفّرة وتعوّض القديمة، ولا تُعرض إلا لحظة الطباعة.
 */

// { id: personId, temp, issuedAt, by }
const temps = () => collection('tempPasswords', [])
// { id: personId, at } — أول دخول بكلمة المرور الخاصة
const logins = () => collection('firstLogins', [])
// { id: personId, at, by } — آخر طباعة لورقة هذا الشخص
const prints = () => collection('sheetPrints', [])
// أسماء المستخدمين التي ولّدتها المنصة لمن ليس له حساب دخول بعد
const usernames = () => collection('usernames', [])
// كلمات المرور التي غيّرها أصحابها (النموذج يحفظها في المتصفح؛ الخادم يحفظها مشفّرة)
const ownPw = () => collection('ownPasswords', [])

usernames().all().forEach((u) => { const p = persons.find((x) => x.id === u.id); if (p && !p.username) p.username = u.username })
ownPw().all().forEach((u) => { const p = persons.find((x) => x.id === u.id); if (p) p.password = u.pw })

export const markLogin = (personId) => { if (!logins().find(personId)) logins().insert({ id: personId, at: new Date().toISOString() }) }
export const tempOf = (personId) => temps().find(personId)?.temp || null
export const clearTemp = (personId) => temps().remove(personId)
export function setOwnPassword(p, pw) {
  p.password = pw
  if (ownPw().find(p.id)) ownPw().update(p.id, { pw })
  else ownPw().insert({ id: p.id, pw })
}

// حروف وأرقام لا تلتبس عند القراءة من ورقة (بلا 0/O ولا 1/l/I)
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789'
const makeTemp = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('')
const personOf = (id) => persons.find((p) => p.id === id)
const fullName = (p) => `${p.firstName} ${p.lastName}`
const loggedOnce = (p) => !!logins().find(p.id) && !temps().find(p.id)
const schoolOf = (id) => schools.find((s) => s.id === id)
const levelOrder = (c) => levels.find((l) => l.id === c?.levelId)?.order ?? 99
const ROLE_LABEL = { school_manager: 'مدير مدرسة', editor: 'محرر', admin: 'مشرف عام', support: 'الدعم الفني' }

function ensureUsername(p) {
  if (p.username) return p.username
  let base = `u${String(p.id).replace(/\D/g, '') || Date.now() % 100000}`
  while (persons.some((x) => x.username === base)) base += '1'
  p.username = base
  usernames().insert({ id: p.id, username: base })
  return base
}

/**
 * أشخاص الفئة في النطاق، كل واحد بمجموعته (القسم، أو المدرسة، أو الدور) ومفتاح ترتيبه.
 * schoolId فارغ = كل المدارس (للإدارة العامة).
 */
function people(category, schoolId) {
  const out = []
  const seen = new Set()
  const add = (o) => { if (o.p && !seen.has(o.p.id)) { seen.add(o.p.id); out.push(o) } }
  if (category === 'students') {
    for (const a of assignments.filter((x) => x.role === 'student')) {
      const c = classes.find((x) => x.id === a.classId)
      if (!c || (schoolId && c.schoolId !== schoolId)) continue
      const s = schoolOf(c.schoolId)
      add({ p: personOf(a.personId), group: schoolId ? c.name : `${s?.short || s?.name} — ${c.name}`, sort: [s?.name, String(levelOrder(c)).padStart(2, '0'), c.name], sub: `تلميذ · ${c.name}`, school: s })
    }
  } else if (category === 'parents') {
    // الولي: ورقة واحدة، في قسم أكبر أبنائه
    for (const a of assignments.filter((x) => x.role === 'parent')) {
      const kids = (a.childIds || []).map((id) => ({ p: personOf(id), a: assignments.find((x) => x.personId === id && x.role === 'student') })).filter((k) => k.p && k.a)
      if (!kids.length) continue
      kids.sort((x, y) => String(x.p.birthDate || '9').localeCompare(String(y.p.birthDate || '9')))
      const c = classes.find((x) => x.id === kids[0].a.classId)
      if (!c || (schoolId && c.schoolId !== schoolId)) continue
      const s = schoolOf(c.schoolId)
      add({ p: personOf(a.personId), group: schoolId ? c.name : `${s?.short || s?.name} — ${c.name}`, sort: [s?.name, String(levelOrder(c)).padStart(2, '0'), c.name], sub: `ولي ${kids.map((k) => k.p.firstName).join(' و')} · ${c.name}`, school: s })
    }
  } else if (category === 'teachers') {
    for (const a of assignments.filter((x) => x.role === 'teacher')) {
      if (schoolId && a.schoolId !== schoolId) continue
      const s = schoolOf(a.schoolId)
      const others = assignments.filter((x) => x.role === 'teacher' && x.personId === a.personId && x.schoolId !== a.schoolId).map((x) => schoolOf(x.schoolId)?.name).filter(Boolean)
      add({ p: personOf(a.personId), group: s?.name || '', sort: [s?.name], sub: `معلم · ${s?.short || s?.name}`, school: s, otherSchools: others })
    }
  } else if (category === 'staff') {
    for (const a of assignments.filter((x) => ROLE_LABEL[x.role])) {
      if (schoolId && a.schoolId !== schoolId) continue
      const s = schoolOf(a.schoolId)
      add({ p: personOf(a.personId), group: ROLE_LABEL[a.role], sort: [String(Object.keys(ROLE_LABEL).indexOf(a.role))], sub: s ? `${ROLE_LABEL[a.role]} · ${s.short || s.name}` : ROLE_LABEL[a.role], school: s })
    }
  }
  const key = (o) => [...o.sort, fullName(o.p)].join('|')
  return out.sort((x, y) => key(x).localeCompare(key(y), 'ar'))
}

/** GET /api/login-sheets/summary?category&schoolId → أعداد الأزرار */
export function sheetsSummary(category, schoolId = null) {
  return respond(() => {
    const list = people(category, schoolId)
    const pending = list.filter((o) => !loggedOnce(o.p))
    return { total: list.length, toPrint: pending.length, fresh: pending.filter((o) => !prints().find(o.p.id)).length, logged: list.length - pending.length }
  })
}

/** GET /api/login-sheets/search?category&schoolId&q → بحث بالاسم أو اللقب (لورقة شخص) */
export function searchSheetPeople(category, schoolId, q) {
  return respond(() => {
    const k = String(q || '').trim()
    if (k.length < 2) return []
    return people(category, schoolId).filter((o) => fullName(o.p).includes(k) || `${o.p.lastName} ${o.p.firstName}`.includes(k)).slice(0, 15).map((o) => ({
      id: o.p.id, name: fullName(o.p), username: o.p.username || '', sub: o.sub, printedAt: prints().find(o.p.id)?.at || null, logged: loggedOnce(o.p), otherSchools: o.otherSchools || []
    }))
  })
}

/**
 * POST /api/login-sheets { category, schoolId, mode: 'all'|'new'|'one', personId }
 * يعيد مجموعات الطباعة: [{ name, rows: [{ name, username, temp, sub, slug }] }]
 */
export function issueSheets({ category, schoolId = null, mode = 'all', personId = null }, by = null) {
  return respond(() => {
    let list = people(category, schoolId)
    if (mode === 'one') list = list.filter((o) => o.p.id === personId)
    else list = list.filter((o) => !loggedOnce(o.p))
    if (mode === 'new') list = list.filter((o) => !prints().find(o.p.id))
    if (!list.length) throw new ApiError('empty', mode === 'new' ? 'لا جدد: كل من في هذه الفئة طُبعت له ورقة' : 'لا أحد في هذا الاختيار')
    const at = new Date().toISOString()
    const groups = []
    for (const o of list) {
      const p = o.p
      ensureUsername(p)
      if (mode === 'one') {
        // ورقة جديدة لشخص: كلمة مؤقتة جديدة تلغي كلمته الحالية وأي ورقة سابقة
        setOwnPassword(p, `!reset-${makeTemp()}${makeTemp()}`)
        logins().remove(p.id)
        temps().remove(p.id)
      }
      // الطباعة الجماعية تعيد استعمال الكلمة المؤقتة السارية حتى لا تُلغى ورقة وُزّعت
      if (!temps().find(p.id)) temps().insert({ id: p.id, temp: makeTemp(), issuedAt: at, by: by?.id || null })
      if (prints().find(p.id)) prints().update(p.id, { at, by: by?.id || null })
      else prints().insert({ id: p.id, at, by: by?.id || null })
      let g = groups.find((x) => x.name === o.group)
      if (!g) groups.push((g = { name: o.group, rows: [] }))
      g.rows.push({ name: fullName(p), username: p.username, temp: temps().find(p.id).temp, sub: o.sub, slug: o.school?.slug || '', schoolName: o.school?.name || '' })
    }
    const school = schoolId ? schoolOf(schoolId) : null
    return { category, mode, schoolId, schoolName: school?.name || 'كل المدارس', issuedAt: at, count: list.length, groups }
  })
}
