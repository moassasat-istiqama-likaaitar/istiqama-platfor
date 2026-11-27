import { respond, ApiError } from './client'
import { persons, assignments, classes, schools } from '@/mock/db'
import { collection } from '@/mock/collections'

/**
 * أوراق الدخول: المنصة تولّد لكل تلميذ (ووليّه اختيارياً) كلمة مرور مؤقتة،
 * ويطبعها المدير أو المعلم أوراقاً لقسم كامل ويوزّعها. تغيير كلمة المرور إجباري عند أول دخول.
 * في الخادم الحقيقي: كلمة المرور المؤقتة تُخزَّن مشفّرة وتعوّض القديمة، ولا تُعرض إلا لحظة الطباعة.
 */

// { id: personId, temp, issuedAt, by }
const temps = () => collection('tempPasswords', [])
// { id: personId, at } — أول دخول بكلمة المرور الخاصة (لتمييز من لم يدخل بعد)
const logins = () => collection('firstLogins', [])
export const markLogin = (personId) => { if (!logins().find(personId)) logins().insert({ id: personId, at: new Date().toISOString() }) }
const loggedOnce = (p) => !!logins().find(p.id)
// أسماء المستخدمين التي ولّدتها المنصة لمن ليس له حساب دخول بعد (تُحفظ وتُطبَّق عند التشغيل)
const usernames = () => collection('usernames', [])
usernames().all().forEach((u) => { const p = persons.find((x) => x.id === u.id); if (p && !p.username) p.username = u.username })
// كلمات المرور التي غيّرها أصحابها (النموذج يحفظها في المتصفح؛ الخادم يحفظها مشفّرة)
const ownPw = () => collection('ownPasswords', [])
ownPw().all().forEach((u) => { const p = persons.find((x) => x.id === u.id); if (p) p.password = u.pw })
export function setOwnPassword(p, pw) {
  p.password = pw
  if (ownPw().find(p.id)) ownPw().update(p.id, { pw })
  else ownPw().insert({ id: p.id, pw })
}
function ensureUsername(p) {
  if (p.username) return p.username
  let base = `u${String(p.id).replace(/\D/g, '') || Date.now() % 100000}`
  while (persons.some((x) => x.username === base)) base += '1'
  p.username = base
  usernames().insert({ id: p.id, username: base })
  return base
}

// حروف وأرقام لا تلتبس عند القراءة من ورقة (بلا 0/O ولا 1/l/I)
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789'
const makeTemp = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('')

const personOf = (id) => persons.find((p) => p.id === id)
const parentsOf = (studentId) => assignments.filter((a) => a.role === 'parent' && (a.childIds || []).includes(studentId)).map((a) => personOf(a.personId)).filter(Boolean)

/** كلمة المرور المؤقتة السارية لهذا الشخص (إن وُجدت) */
export const tempOf = (personId) => temps().find(personId)?.temp || null
/** تُستعمل بعد تغيير كلمة المرور: تنتهي المؤقتة */
export const clearTemp = (personId) => temps().remove(personId)

/** GET /api/classes/:id/login-sheets → تلاميذ القسم وحالة دخولهم (دون كلمات المرور) */
export function loginSheetRoster(classId) {
  return respond(() => {
    const c = classes.find((x) => x.id === classId)
    if (!c) throw new ApiError('not_found', 'القسم غير موجود')
    return assignments.filter((a) => a.role === 'student' && a.classId === classId).map((a) => {
      const p = personOf(a.personId)
      const t = temps().find(p.id)
      return { id: p.id, name: `${p.firstName} ${p.lastName}`, username: p.username || '— (يُنشأ عند الطباعة)', state: t ? 'temp' : loggedOnce(p) ? 'own' : 'never', issuedAt: t?.issuedAt || null, parents: parentsOf(p.id).map((x) => `${x.firstName} ${x.lastName}`) }
    })
  })
}

/**
 * POST /api/classes/:id/login-sheets { scope: 'new'|'all'|'ids', ids?, withParents }
 * يولّد كلمات مرور مؤقتة ويعيد بيانات الطباعة. «all» يعيد تعيين كلمات مرور تلاميذ القسم كلهم.
 * «new»: من لم يغيّر كلمة مروره بعد (يبقى له رمزه الحالي، ومن لا رمز له يُولَّد له).
 */
export function issueLoginSheets(classId, { scope = 'new', ids = [], withParents = false } = {}, by = null) {
  return respond(() => {
    const c = classes.find((x) => x.id === classId)
    if (!c) throw new ApiError('not_found', 'القسم غير موجود')
    const school = schools.find((s) => s.id === c.schoolId)
    let studs = assignments.filter((a) => a.role === 'student' && a.classId === classId).map((a) => personOf(a.personId))
    if (scope === 'ids') studs = studs.filter((p) => ids.includes(p.id))
    if (scope === 'new') studs = studs.filter((p) => !loggedOnce(p))
    if (!studs.length) throw new ApiError('empty', 'لا تلاميذ في هذا الاختيار')
    const at = new Date().toISOString()
    const issue = (p, fresh) => {
      ensureUsername(p)
      const cur = temps().find(p.id)
      if (cur && !fresh) return cur.temp
      const temp = makeTemp()
      if (cur) temps().update(p.id, { temp, issuedAt: at, by: by?.id || null })
      else temps().insert({ id: p.id, temp, issuedAt: at, by: by?.id || null })
      return temp
    }
    const fresh = scope !== 'new'
    const done = new Set()
    const rows = studs.map((p) => ({
      temp: issue(p, fresh), name: `${p.firstName} ${p.lastName}`, username: p.username, role: 'student',
      parents: withParents ? parentsOf(p.id).map((x) => {
        // الولي: يُعاد استعمال رمزه الساري (قد يكون له أبناء في أقسام أخرى)، ولا يُولَّد إلا إن لم يكن له رمز
        const first = !done.has(x.id)
        done.add(x.id)
        const temp = loggedOnce(x) && !temps().find(x.id) ? null : issue(x, false)
        return { name: `${x.firstName} ${x.lastName}`, username: x.username, temp, repeat: !first }
      }) : []
    }))
    return { className: c.name, schoolId: school?.id, schoolName: school?.name, slug: school?.slug, issuedAt: at, rows }
  })
}
