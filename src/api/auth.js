import { respond, ApiError } from './client'
import { persons, assignments, schools, classes, levels } from '@/mock/db'

/** يكمّل الصفة بأسماء المدرسة والأقسام والأبناء لعرضها في الواجهة */
export function describeAssignment(a) {
  const school = schools.find((s) => s.id === a.schoolId) || null
  const out = { ...a, school: school ? { id: school.id, name: school.name } : null }
  // المحرر: نطاقه مستويات (ومواد)، ويدخل كل أقسام مستوياته في كل المدارس
  if (a.role === 'editor') {
    out.classIds = classes.filter((c) => (a.levelIds || []).includes(c.levelId)).map((c) => c.id)
    out.levels = (a.levelIds || []).map((id) => ({ id, name: levels.find((l) => l.id === id)?.name }))
  }
  if (out.classIds) out.classes = classes.filter((c) => out.classIds.includes(c.id)).map((c) => ({ id: c.id, name: c.name }))
  if (a.classId) {
    const c = classes.find((x) => x.id === a.classId)
    const lvl = levels.find((l) => l.id === c?.levelId)
    out.class = c ? { id: c.id, name: c.name } : null
    out.level = lvl ? { id: lvl.id, name: lvl.name, phase: lvl.phase, order: lvl.order } : null
  }
  if (a.childIds) {
    out.children = a.childIds.map((cid) => {
      const p = persons.find((x) => x.id === cid)
      const sa = assignments.find((x) => x.personId === cid && x.role === 'student')
      const c = classes.find((x) => x.id === sa?.classId)
      const s = schools.find((x) => x.id === sa?.schoolId)
      const lv = levels.find((l) => l.id === c?.levelId)
      return { id: cid, name: `${p.firstName} ${p.lastName}`, firstName: p.firstName, gender: p.gender, classId: c?.id, className: c?.name, levelId: lv?.id, levelName: lv?.name, levelOrder: lv?.order, schoolId: s?.id, schoolName: s?.name }
    })
  }
  return out
}

function publicPerson(p) {
  const { password, ...rest } = p
  return rest
}

function session(person) {
  return {
    token: `demo-${person.id}`,
    person: publicPerson(person),
    assignments: assignments.filter((a) => a.personId === person.id).map(describeAssignment)
  }
}

/** POST /api/auth/login  { login, password } → { token, person, assignments[] } */
export function login(loginValue, password) {
  return respond(() => {
    const key = String(loginValue || '').trim().toLowerCase()
    const person = persons.find((p) => p.username.toLowerCase() === key || (p.email && p.email.toLowerCase() === key))
    if (!person || person.password !== password) throw new ApiError('invalid_credentials', 'بيانات الدخول غير صحيحة')
    if (person.status !== 'active') throw new ApiError('inactive', 'الحساب غير مفعّل')
    return session(person)
  }, 400)
}

/** GET /api/auth/me  (بالرمز) → { token, person, assignments[] } */
export function me(token) {
  return respond(() => {
    const id = String(token || '').replace('demo-', '')
    const person = persons.find((p) => p.id === id)
    if (!person) throw new ApiError('unauthorized', 'انتهت الجلسة')
    return session(person)
  }, 50)
}

/** POST /api/auth/forgot-password  { contact } → { sent: true } */
export function forgotPassword(contact) {
  return respond(() => {
    if (!String(contact || '').trim()) throw new ApiError('required', 'أدخل البريد أو رقم الهاتف')
    return { sent: true }
  }, 600)
}

/** GET /api/demo/accounts → قائمة الحسابات التجريبية (خاص بالنموذج، يُحذف عند الربط) */
export function demoAccounts() {
  return respond(() =>
    persons.filter((p) => !p.generated).map((p) => ({
      username: p.username,
      name: `${p.firstName} ${p.lastName}`,
      roles: assignments.filter((a) => a.personId === p.id).map((a) => a.role),
      // المدارس المرتبطة بالحساب (مباشرة أو عبر الأبناء) — لتصفية الحسابات في صفحة دخول المدرسة
      schoolIds: [...new Set(assignments.filter((a) => a.personId === p.id).flatMap((a) => [a.schoolId, ...(a.childIds || []).map((c) => assignments.find((x) => x.personId === c && x.role === 'student')?.schoolId)]).filter(Boolean))]
    })),
    0
  )
}

/** PUT /api/me  { firstName, lastName, email, phone } → person */
export function updateProfile(personId, data) {
  return respond(() => {
    const p = persons.find((x) => x.id === personId)
    Object.assign(p, {
      firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone
    })
    return publicPerson(p)
  })
}

/** PUT /api/me/password  { current, next } → { ok: true } */
export function changePassword(personId, current, next) {
  return respond(() => {
    const p = persons.find((x) => x.id === personId)
    if (p.password !== current) throw new ApiError('wrong_password', 'كلمة المرور الحالية غير صحيحة')
    if (!next || next.length < 4) throw new ApiError('weak_password', 'كلمة المرور الجديدة قصيرة جداً')
    p.password = next
    return { ok: true }
  })
}
