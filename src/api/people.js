import { canGrantRole, canRemoveHolder } from '@/config/roles'
import { respond, ApiError, newId } from './client'
import { persons, assignments, classes, schools, levels } from '@/mock/db'
import { subjects, lessons, activities } from '@/mock/content'
import { progressOf } from '@/mock/progress'
import { hashStats } from '@/mock/world'

/**
 * الأشخاص والأدوار والمؤشرات — تخدم شاشات المعلم والمدير والإدارة العامة والولي.
 */

export const fullName = (p) => (p ? `${p.firstName} ${p.lastName}` : '—')
export const personOf = (id) => persons.find((p) => p.id === id)
const levelOf = (classId) => levels.find((l) => l.id === classes.find((c) => c.id === classId)?.levelId)

/** مؤشرات تلميذ: الحقيقي من تقدّمه الفعلي، والمولَّد من مؤشرات ثابتة */
export function studentSnapshot(personId) {
  const p = personOf(personId)
  const a = assignments.find((x) => x.personId === personId && x.role === 'student')
  const lvl = levelOf(a?.classId)
  if (!p || p.generated || !lvl) return { ...hashStats(personId) }
  const g = classes.find((c) => c.id === a.classId)?.gender || 'mixed'
  const pr = progressOf(personId)
  const subs = subjects.filter((s) => s.levelId === lvl.id)
  const ls = lessons.filter((l) => subs.some((s) => s.id === l.subjectId) && (!l.gender || l.gender === g))
  const done = ls.filter((l) => pr.done.includes(l.id)).length
  const acts = activities.filter((x) => x.levelId === lvl.id && ls.some((l) => l.id === x.lessonId))
  const graded = acts.filter((x) => pr.submissions[x.id]?.status === 'graded')
  const avg = graded.length ? graded.reduce((n, x) => n + (pr.submissions[x.id].score / x.maxScore) * 20, 0) / graded.length : null
  const late = acts.filter((x) => !pr.submissions[x.id] && new Date(x.due) < new Date() && pr.done.includes(x.lessonId)).length
  return {
    progress: ls.length ? Math.round((done / ls.length) * 100) : 0,
    average: avg === null ? null : Math.round(avg * 10) / 10,
    late,
    done,
    lastSeenDays: 0,
    minutesWeek: 60 + pr.streak * 15,
    stars: pr.stars,
    streak: pr.streak
  }
}

export function studentRow(personId) {
  const p = personOf(personId)
  const a = assignments.find((x) => x.personId === personId && x.role === 'student')
  const c = classes.find((x) => x.id === a?.classId)
  const parents = assignments.filter((x) => x.role === 'parent' && x.childIds?.includes(personId)).map((x) => fullName(personOf(x.personId)))
  return {
    id: personId, name: fullName(p), gender: p.gender, status: p.status, birthDate: p.birthDate,
    classId: c?.id, className: c?.name, schoolId: a?.schoolId, levelId: c?.levelId, parents: parents.join('، ') || '—',
    real: !p.generated, ...studentSnapshot(personId)
  }
}

export function classInfo(c) {
  const lvl = levels.find((l) => l.id === c.levelId)
  const sch = schools.find((s) => s.id === c.schoolId)
  const studs = assignments.filter((a) => a.role === 'student' && a.classId === c.id)
  const teachers = assignments.filter((a) => a.role === 'teacher' && a.classIds?.includes(c.id)).map((a) => fullName(personOf(a.personId)))
  const snaps = studs.map((a) => studentSnapshot(a.personId))
  const avgOf = (k) => (snaps.length ? Math.round((snaps.reduce((n, s) => n + (s[k] || 0), 0) / snaps.length) * 10) / 10 : 0)
  return {
    id: c.id, name: c.name, levelId: c.levelId, levelName: lvl?.name, levelOrder: lvl?.order, schoolId: c.schoolId, schoolName: sch?.name,
    gender: c.gender, genderLabel: { mixed: 'مختلط', male: 'ذكور', female: 'إناث' }[c.gender],
    students: studs.length, teachers, teachersLabel: teachers.join('، ') || '—',
    progress: Math.round(avgOf('progress')), average: avgOf('average'), late: snaps.reduce((n, s) => n + s.late, 0),
    atRisk: snaps.filter((s) => s.progress < 30 || s.late >= 3).length,
    subjects: subjects.filter((s) => s.levelId === c.levelId).length
  }
}

/** GET /api/classes?schoolId= */
export function listClasses({ schoolId, classIds } = {}) {
  return respond(() => classes.filter((c) => (!schoolId || c.schoolId === schoolId) && (!classIds || classIds.includes(c.id))).map(classInfo))
}

/** GET /api/classes/:id/students */
export function classStudents(classId) {
  return respond(() => assignments.filter((a) => a.role === 'student' && a.classId === classId).map((a) => studentRow(a.personId)))
}

/** GET /api/users?role=&schoolId= → صفوف جدول المستخدمين (شخص واحد قد يظهر بأكثر من دور) */
export function listUsers({ role, schoolId } = {}) {
  return respond(() => {
    const rows = persons
      .map((p) => {
        const as = assignments.filter((a) => a.personId === p.id)
        if (role && !as.some((a) => a.role === role)) return null
        if (schoolId && !as.some((a) => a.schoolId === schoolId || (a.role === 'parent' && a.childIds?.some((cid) => assignments.find((x) => x.personId === cid && x.role === 'student')?.schoolId === schoolId)))) return null
        const sch = [...new Set(as.map((a) => schools.find((s) => s.id === a.schoolId)?.short).filter(Boolean))]
        const extra = {}
        if (role === 'teacher') {
          const ta = as.filter((a) => a.role === 'teacher' && (!schoolId || a.schoolId === schoolId))
          extra.classesLabel = ta.flatMap((a) => (a.classIds || []).map((id) => classes.find((c) => c.id === id)?.name)).join('، ')
          extra.subjects = [...new Set(ta.flatMap((a) => a.subjects || []))]
          extra.classCount = ta.reduce((n, a) => n + (a.classIds?.length || 0), 0)
        }
        if (role === 'student') Object.assign(extra, studentRow(p.id))
        if (role === 'parent') {
          const kids = as.filter((a) => a.role === 'parent').flatMap((a) => a.childIds || [])
          extra.childrenLabel = kids.map((k) => personOf(k)?.firstName).join('، ')
          extra.childCount = kids.length
        }
        return {
          id: p.id, name: fullName(p), username: p.username || '—', email: p.email || '', phone: p.phone || '', gender: p.gender, status: p.status,
          roles: [...new Set(as.map((a) => a.role))], schools: sch, schoolsLabel: sch.join('، ') || 'كل المدارس', demo: !p.generated, ...extra, name2: fullName(p)
        }
      })
      .filter(Boolean)
    return rows
  })
}

/** GET /api/users/:id → الشخص وكل أدواره */
export function getUser(id) {
  return respond(() => {
    const p = personOf(id)
    if (!p) throw new ApiError('not_found', 'المستخدم غير موجود')
    const { password, ...rest } = p
    return {
      ...rest,
      assignments: assignments.filter((a) => a.personId === id).map((a) => ({
        ...a,
        schoolName: schools.find((s) => s.id === a.schoolId)?.name || null,
        classNames: (a.classIds || (a.classId ? [a.classId] : [])).map((cid) => classes.find((c) => c.id === cid)?.name),
        childNames: (a.childIds || []).map((cid) => fullName(personOf(cid)))
      }))
    }
  })
}

/** POST /api/users { person, assignment } — شخص جديد بدوره الأولى */
export function createUser(data, actorRole = null) {
  return respond(() => {
    if (actorRole && data.role && !canGrantRole(actorRole, data.role)) throw new ApiError('forbidden', 'إضافة مشرف عام أو مدير عام من صلاحية المدير العام وحده')
    const login = (data.username || '').trim()
    if (login && persons.some((p) => p.username === login)) throw new ApiError('duplicate', 'اسم المستخدم مستعمل')
    const p = { id: newId('p'), username: login, email: data.email || '', password: '1234', firstName: data.firstName, lastName: data.lastName, gender: data.gender || 'male', phone: data.phone || '', birthDate: data.birthDate || '', status: data.status || 'active', generated: !login }
    persons.push(p)
    if (data.role) addAssignmentSync(p.id, data)
    return { id: p.id }
  }, 400)
}

function addAssignmentSync(personId, d) {
  const a = { id: newId('a'), personId, role: d.role, schoolId: d.schoolId || null }
  if (d.role === 'teacher') Object.assign(a, { classIds: d.classIds || [], subjects: d.subjects || [] })
  if (d.role === 'student') a.classId = d.classId
  if (d.role === 'parent') a.childIds = d.childIds || []
  assignments.push(a)
  return a
}

/** PATCH /api/users/:id */
export function updateUser(id, patch) {
  return respond(() => {
    const p = personOf(id)
    ;['firstName', 'lastName', 'email', 'phone', 'gender', 'status', 'birthDate'].forEach((k) => patch[k] !== undefined && (p[k] = patch[k]))
    return true
  })
}

/** POST /api/users/:id/assignments — إضافة دور لشخص موجود (مثلاً معلم يصبح ولياً) */
export function addAssignment(personId, data, actorRole = null) {
  return respond(() => {
    if (actorRole && !canGrantRole(actorRole, data.role)) throw new ApiError('forbidden', 'إضافة مشرف عام أو مدير عام من صلاحية المدير العام وحده')
    return addAssignmentSync(personId, data)
  })
}
/** DELETE /api/assignments/:id */
export function removeAssignment(id, actorRole = null) {
  return respond(() => {
    const i = assignments.findIndex((a) => a.id === id)
    if (actorRole && i >= 0 && !canRemoveHolder(actorRole, [assignments[i].role])) throw new ApiError('forbidden', 'نزع دور المدير العام من صلاحية المدير العام وحده')
    if (i >= 0) assignments.splice(i, 1)
    return true
  })
}

/** POST /api/users/status { ids, status } — تفعيل/إيقاف جماعي */
export function setStatus(ids, status, actorRole = null) {
  return respond(() => {
    if (actorRole && status !== 'active' && ids.some((id) => !canRemoveHolder(actorRole, assignments.filter((a) => a.personId === id).map((a) => a.role)))) throw new ApiError('forbidden', 'تعطيل حساب المدير العام من صلاحية المدير العام وحده')
    ids.forEach((id) => {
      const p = personOf(id)
      if (p) p.status = status
    })
    return ids.length
  })
}

/** GET /api/users/duplicates → حسابات محتملة التكرار (نفس الاسم واللقب، أو نفس الهاتف) */
export function duplicates() {
  return respond(() => {
    const groups = {}
    persons.forEach((p) => {
      const k = `${p.firstName}|${p.lastName}`
      ;(groups[k] = groups[k] || []).push(p)
    })
    return Object.entries(groups)
      .filter(([, list]) => list.length > 1)
      .slice(0, 25)
      .map(([k, list]) => ({
        id: k,
        name: k.replace('|', ' '),
        reason: list.some((x, i) => list.findIndex((y) => y.birthDate && y.birthDate === x.birthDate) !== i) ? 'نفس الاسم وتاريخ الميلاد' : 'نفس الاسم واللقب',
        people: list.map((p) => ({ id: p.id, roles: assignments.filter((a) => a.personId === p.id).map((a) => a.role), school: schools.find((s) => s.id === assignments.find((a) => a.personId === p.id)?.schoolId)?.short || '—', birthDate: p.birthDate || '—', phone: p.phone || '—' }))
      }))
  })
}

/** POST /api/users/merge { keepId, mergeIds } — دمج: تنتقل الأدوار إلى الحساب المحتفظ به */
export function mergeUsers(keepId, mergeIds) {
  return respond(() => {
    assignments.forEach((a) => mergeIds.includes(a.personId) && (a.personId = keepId))
    mergeIds.forEach((id) => {
      const i = persons.findIndex((p) => p.id === id)
      if (i >= 0) persons.splice(i, 1)
    })
    return true
  }, 400)
}

export { schools, levels, classes }

/** GET /api/classes/:id/teachers → معلمو القسم ومواد كل منهم (للولي: التواصل) */
export function classTeachers(classId) {
  return respond(() =>
    assignments
      .filter((a) => a.role === 'teacher' && a.classIds?.includes(classId))
      .map((a) => {
        const p = personOf(a.personId)
        return { id: p.id, assignmentId: a.id, name: fullName(p), gender: p.gender, subjects: a.subjects || [], canMessage: !p.generated }
      })
  )
}
