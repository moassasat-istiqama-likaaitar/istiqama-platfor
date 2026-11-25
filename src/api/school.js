import { respond, ApiError, newId } from './client'
import { assignments, classes, levels, persons, schools, seasons } from '@/mock/db'
import { subjects, contents, lessons } from '@/mock/content'
import { collection } from '@/mock/collections'
import { classInfo, studentSnapshot, fullName, personOf } from './people'

/**
 * إدارة المدرسة (مدير المدرسة) — والإحصائيات نفسها تخدم تقارير الإدارة العامة لكل مدرسة.
 */
const notices = collection('notices', () => [
  { id: 'nt1', schoolId: 's1', title: 'اجتماع الأولياء', body: 'يُعقد اجتماع الأولياء يوم السبت القادم على الساعة العاشرة صباحاً بقاعة المدرسة.', audience: ['parents'], classIds: [], status: 'published', at: new Date(Date.now() - 3 * 864e5).toISOString(), author: 'محمد بن عيسى' },
  { id: 'nt2', schoolId: 's1', title: 'تذكير بمواعيد الفروض', body: 'نذكّر المعلمين بإدخال علامات الفروض قبل نهاية الشهر.', audience: ['teachers'], classIds: [], status: 'published', at: new Date(Date.now() - 6 * 864e5).toISOString(), author: 'محمد بن عيسى' }
])

const schoolStudents = (schoolId) => assignments.filter((a) => a.role === 'student' && a.schoolId === schoolId)
const schoolTeachers = (schoolId) => assignments.filter((a) => a.role === 'teacher' && a.schoolId === schoolId)

/** GET /api/schools/:id/overview */
export function schoolOverview(schoolId) {
  return respond(() => overviewSync(schoolId))
}

export function overviewSync(schoolId) {
  const cls = classes.filter((c) => c.schoolId === schoolId).map(classInfo)
  const studs = schoolStudents(schoolId)
  const snaps = studs.map((a) => ({ a, s: studentSnapshot(a.personId) }))
  const teacherIds = [...new Set(schoolTeachers(schoolId).map((a) => a.personId))]
  const parentIds = assignments.filter((a) => a.role === 'parent' && a.childIds?.some((c) => studs.some((s) => s.personId === c))).map((a) => a.personId)
  const pending = [...new Set([...studs.map((a) => a.personId), ...teacherIds, ...parentIds])].filter((id) => personOf(id)?.status === 'pending').length
  const avg = (k) => (snaps.length ? Math.round((snaps.reduce((n, x) => n + (x.s[k] || 0), 0) / snaps.length) * 10) / 10 : 0)
  const uploads = collection('uploads').all().filter((u) => teacherIds.includes(u.authorId))
  return {
    school: schools.find((s) => s.id === schoolId),
    classes: cls,
    counts: { students: studs.length, teachers: teacherIds.length, parents: new Set(parentIds).size, classes: cls.length, pending },
    progress: Math.round(avg('progress')),
    average: avg('average'),
    activeWeek: snaps.filter((x) => x.s.lastSeenDays <= 7).length,
    atRisk: snaps.filter((x) => x.s.progress < 30 || x.s.late >= 3).map((x) => ({ id: x.a.personId, name: fullName(personOf(x.a.personId)), className: classes.find((c) => c.id === x.a.classId)?.name, progress: x.s.progress, late: x.s.late })).slice(0, 8),
    uploadsPending: uploads.filter((u) => u.target === 'class' && u.status === 'review').length,
    minutes: snaps.reduce((n, x) => n + (x.s.minutesWeek || 0), 0),
    weekly: [...Array(8)].map((_, i) => ({ label: `أ${8 - i}`, value: Math.max(10, Math.round(avg('progress') - i * (2 + (schoolId.length % 3)) + ((i * 7) % 5))) }))
  }
}

/** POST /api/classes { name, levelId, gender } */
export function createClass(schoolId, data) {
  return respond(() => {
    if (!data.name?.trim() || !data.levelId) throw new ApiError('required', 'الاسم والمستوى إجباريان')
    const c = { id: newId('c'), name: data.name.trim(), levelId: data.levelId, schoolId, gender: data.gender || 'mixed', seasonId: seasons[0].id }
    classes.push(c)
    if (data.teacherIds?.length) data.teacherIds.forEach((pid) => assignTeacherSync(pid, c.id, schoolId))
    return classInfo(c)
  })
}
export function updateClass(id, data) {
  return respond(() => {
    const c = classes.find((x) => x.id === id)
    Object.assign(c, { name: data.name ?? c.name, levelId: data.levelId ?? c.levelId, gender: data.gender ?? c.gender })
    if (data.teacherIds) {
      assignments.filter((a) => a.role === 'teacher' && a.classIds?.includes(id) && !data.teacherIds.includes(a.personId)).forEach((a) => (a.classIds = a.classIds.filter((x) => x !== id)))
      data.teacherIds.forEach((pid) => assignTeacherSync(pid, id, c.schoolId))
    }
    return classInfo(c)
  })
}
function assignTeacherSync(personId, classId, schoolId) {
  let a = assignments.find((x) => x.role === 'teacher' && x.personId === personId && x.schoolId === schoolId)
  if (!a) {
    a = { id: newId('a'), personId, role: 'teacher', schoolId, classIds: [], subjects: [] }
    assignments.push(a)
  }
  if (!a.classIds.includes(classId)) a.classIds.push(classId)
}
export function teacherOptions(schoolId) {
  return respond(() => [...new Set(schoolTeachers(schoolId).map((a) => a.personId))].map((id) => ({ label: fullName(personOf(id)), value: id })))
}
export function classTeacherIds(classId) {
  return assignments.filter((a) => a.role === 'teacher' && a.classIds?.includes(classId)).map((a) => a.personId)
}

/** GET /api/schools/:id/pending-accounts → حسابات بانتظار التفعيل (تلاميذ، أولياء، معلمون) */
export function pendingAccounts(schoolId) {
  return respond(() => {
    const out = []
    const seen = new Set()
    const push = (pid, role, detail) => {
      const p = personOf(pid)
      if (!p || p.status !== 'pending' || seen.has(pid)) return
      seen.add(pid)
      out.push({ id: pid, name: fullName(p), role, detail, phone: p.phone || '—', requestedAt: new Date(Date.now() - ((pid.charCodeAt(pid.length - 1) % 9) + 1) * 864e5).toISOString() })
    }
    schoolStudents(schoolId).forEach((a) => push(a.personId, 'student', classes.find((c) => c.id === a.classId)?.name))
    schoolTeachers(schoolId).forEach((a) => push(a.personId, 'teacher', (a.subjects || []).join('، ')))
    assignments.filter((a) => a.role === 'parent').forEach((a) => {
      const kid = a.childIds?.find((cid) => schoolStudents(schoolId).some((s) => s.personId === cid))
      if (kid) push(a.personId, 'parent', `ولي ${personOf(kid)?.firstName}`)
    })
    return out
  })
}

/** GET /api/schools/:id/content-follow → استهلاك المحتوى حسب القسم والمادة */
export function contentFollow(schoolId) {
  return respond(() =>
    classes.filter((c) => c.schoolId === schoolId).flatMap((c) => {
      const info = classInfo(c)
      return subjects.filter((s) => s.levelId === c.levelId).map((s, i) => {
        const ls = lessons.filter((l) => l.subjectId === s.id)
        const items = contents.filter((x) => x.subjectId === s.id && ['approved', 'temp'].includes(x.status))
        const k = (c.id.length * 7 + i * 13) % 30
        return {
          id: `${c.id}-${s.id}`, className: c.name, subjectName: s.name, lessons: ls.length, contents: items.length,
          views: Math.round(items.reduce((n, x) => n + x.views, 0) / 6) + k,
          completion: Math.max(5, Math.min(98, info.progress + ((i * 9) % 17) - 8)),
          rating: Math.round((3.6 + ((k % 12) / 10)) * 10) / 10
        }
      })
    })
  )
}

/* ——— الإشعارات المدرسية ——— */
export function listNotices(schoolId) {
  return respond(() => notices.all().filter((n) => !schoolId || n.schoolId === schoolId))
}
export function createNotice(schoolId, author, data) {
  return respond(() => {
    if (!data.title?.trim() || !data.body?.trim() || !data.audience?.length) throw new ApiError('required', 'العنوان والنص والفئة المستهدفة إجبارية')
    const reach = estimateReach(schoolId, data.audience, data.classIds || [])
    return notices.insert({ id: newId('nt'), schoolId, author: fullName(author), status: data.schedule ? 'scheduled' : 'published', at: data.schedule || new Date().toISOString(), reach, ...data })
  }, 400)
}
export function removeNotice(id) {
  return respond(() => notices.remove(id))
}
export function estimateReach(schoolId, audience = [], classIds = []) {
  const studs = schoolStudents(schoolId).filter((a) => !classIds.length || classIds.includes(a.classId))
  let n = 0
  if (audience.includes('students')) n += studs.length
  if (audience.includes('parents')) n += new Set(assignments.filter((a) => a.role === 'parent' && a.childIds?.some((c) => studs.some((s) => s.personId === c))).map((a) => a.personId)).size
  if (audience.includes('teachers')) n += new Set(schoolTeachers(schoolId).filter((a) => !classIds.length || a.classIds?.some((c) => classIds.includes(c))).map((a) => a.personId)).size
  return n
}

export { levels, persons }
