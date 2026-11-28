import { respond } from './client'
import { assignments, schools, classes, levels } from '@/mock/db'
import { contents } from '@/mock/content'
import { fullName, personOf, studentSnapshot } from './people'
import { uploads, teacherActs } from './bank'
import { collectSubmissions } from './teaching'

/**
 * تقارير المساهمة والنشاط (تُحسب في الخادم من سجل العمليات لاحقاً).
 * تعريفات موحّدة:
 *  - التلميذ النشط: دخل المنصة خلال آخر 7 أيام. نسبة النشاط = النشطون ÷ كل التلاميذ.
 *  - المعلم النشط: له عملية واحدة على الأقل خلال آخر 7 أيام (دخول، إدراج، تصحيح، رفع).
 *  - المساهمة: ما أرسله المعلم إلى المكتبة المركزية (محتوى أو واجب/تقييم)، مع ما اعتُمد منه.
 */
const hash = (id, k = 1) => {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 100003
  return ((h * (k + 7) * 2654435761) % 1000) / 1000
}
const schoolName = (id) => schools.find((s) => s.id === id)?.short || schools.find((s) => s.id === id)?.name || '—'
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

/** GET /api/reports/contributors?levels= — المساهمون في المكتبة حسب المدارس والمعلمين (المحرر: مستوياته · الإدارة العامة: الكل) */
export function contributorsReport({ levelIds = null } = {}) {
  return respond(() => {
    const items = [
      ...uploads().all().filter((u) => u.status !== 'draft').map((u) => ({ authorId: u.authorId, levelId: u.levelId, status: u.status, kind: 'content' })),
      ...teacherActs().all().filter((a) => a.status !== 'draft').map((a) => ({ authorId: a.authorId, levelId: a.levelId, status: a.status, kind: 'activity' })),
      ...contents.filter((c) => assignments.some((a) => a.personId === c.authorId && a.role === 'teacher')).map((c) => ({ authorId: c.authorId, levelId: c.levelId, status: c.status, kind: 'content' }))
    ]
    // بيانات تجريبية: مساهمات سابقة موزّعة على المعلمين حتى يظهر التقرير كما سيكون بعد أشهر من التشغيل
    assignments.filter((a) => a.role === 'teacher').forEach((a) => {
      const n = Math.floor(hash(a.personId, 4) * 14) - 4
      const lvl = classes.find((c) => a.classIds?.includes(c.id))?.levelId
      for (let i = 0; i < n; i++) items.push({ authorId: a.personId, levelId: lvl, status: hash(a.personId + i, 5) > 0.25 ? 'approved' : 'rejected', kind: i % 3 ? 'content' : 'activity' })
    })
    const scoped = items.filter((x) => !levelIds || levelIds.includes(x.levelId))
    const teachers = {}
    scoped.forEach((x) => {
      const t = (teachers[x.authorId] ||= { id: x.authorId, name: fullName(personOf(x.authorId)), schoolId: assignments.find((a) => a.personId === x.authorId && a.role === 'teacher')?.schoolId, sent: 0, approved: 0, contents: 0, activities: 0 })
      t.sent++
      if (['approved', 'temp'].includes(x.status)) t.approved++
      x.kind === 'content' ? t.contents++ : t.activities++
    })
    const rows = Object.values(teachers).map((t) => ({ ...t, school: schoolName(t.schoolId), rate: pct(t.approved, t.sent) })).sort((a, b) => b.sent - a.sent)
    const bySchool = {}
    rows.forEach((t) => {
      const s = (bySchool[t.schoolId || '—'] ||= { id: t.schoolId, school: t.school, contributors: 0, sent: 0, approved: 0 })
      s.contributors++
      s.sent += t.sent
      s.approved += t.approved
    })
    const schoolRows = Object.values(bySchool).map((s) => ({ ...s, teachers: new Set(assignments.filter((a) => a.role === 'teacher' && a.schoolId === s.id).map((a) => a.personId)).size }))
      .map((s) => ({ ...s, share: pct(s.contributors, s.teachers) })).sort((a, b) => b.sent - a.sent)
    return { totals: { contributors: rows.length, sent: scoped.length, approved: rows.reduce((n, t) => n + t.approved, 0) }, teachers: rows, schools: schoolRows }
  })
}

const studentRowOf = (a) => {
  const s = studentSnapshot(a.personId)
  const c = classes.find((x) => x.id === a.classId)
  return { id: a.personId, name: fullName(personOf(a.personId)), className: c?.name, levelName: levels.find((l) => l.id === c?.levelId)?.name, lastSeenDays: s.lastSeenDays ?? 0, minutesWeek: s.minutesWeek ?? 0, active: (s.lastSeenDays ?? 0) <= 7, progress: s.progress }
}
/**
 * GET /api/reports/student-activity — نسبة نشاط التلاميذ:
 * المعلم ← تلاميذ أقسامه تلميذاً تلميذاً · الإدارة العامة ← حسب كل مدرسة.
 */
export function studentActivityReport({ classIds = null } = {}) {
  return respond(() => {
    const studs = assignments.filter((a) => a.role === 'student' && (!classIds || classIds.includes(a.classId)))
    if (classIds) {
      const rows = studs.map(studentRowOf).sort((a, b) => b.lastSeenDays - a.lastSeenDays)
      const byClass = classIds.map((cid) => {
        const rs = rows.filter((r) => studs.find((a) => a.personId === r.id)?.classId === cid)
        return { label: classes.find((c) => c.id === cid)?.name, value: pct(rs.filter((r) => r.active).length, rs.length) }
      })
      return { totals: { students: rows.length, active: rows.filter((r) => r.active).length, rate: pct(rows.filter((r) => r.active).length, rows.length), minutes: rows.length ? Math.round(rows.reduce((n, r) => n + r.minutesWeek, 0) / rows.length) : 0 }, students: rows, byClass }
    }
    const rows = schools.map((s) => {
      const ss = studs.filter((a) => a.schoolId === s.id).map((a) => studentSnapshot(a.personId))
      const active = ss.filter((x) => (x.lastSeenDays ?? 0) <= 7).length
      return { id: s.id, school: s.short || s.name, students: ss.length, active, rate: pct(active, ss.length), minutes: ss.length ? Math.round(ss.reduce((n, x) => n + (x.minutesWeek || 0), 0) / ss.length) : 0 }
    }).filter((r) => r.students)
    const all = rows.reduce((n, r) => n + r.students, 0), act = rows.reduce((n, r) => n + r.active, 0)
    return { totals: { students: all, active: act, rate: pct(act, all), minutes: all ? Math.round(rows.reduce((n, r) => n + r.minutes * r.students, 0) / all) : 0 }, schools: rows.sort((a, b) => b.rate - a.rate) }
  })
}

/** GET /api/reports/teacher-activity — نشاط المعلمين حسب كل مدرسة (الإدارة العامة) */
export function teacherActivityReport() {
  return respond(() => {
    const ups = uploads().all(), acts = teacherActs().all()
    const tas = assignments.filter((a) => a.role === 'teacher')
    const teachers = tas.map((a) => {
      const days = Math.max(0, Math.round(hash(a.personId, 1) * 9) - 2)
      const graded = a.classIds?.length ? collectSubmissions(a.classIds).filter((s) => s.status === 'graded').length : 0
      return {
        id: a.personId + a.schoolId, name: fullName(personOf(a.personId)), schoolId: a.schoolId, school: schoolName(a.schoolId),
        days, active: days > 0, lastSeenDays: days ? Math.floor(hash(a.personId, 2) * 3) : 8 + Math.floor(hash(a.personId, 3) * 20),
        uploads: ups.filter((u) => u.authorId === a.personId).length + acts.filter((x) => x.authorId === a.personId).length, graded, classes: a.classIds?.length || 0
      }
    })
    const bySchool = schools.map((s) => {
      const ts = teachers.filter((t) => t.schoolId === s.id)
      return { id: s.id, school: s.short || s.name, teachers: ts.length, active: ts.filter((t) => t.active).length, rate: pct(ts.filter((t) => t.active).length, ts.length), days: ts.length ? Math.round((ts.reduce((n, t) => n + t.days, 0) / ts.length) * 10) / 10 : 0, graded: ts.reduce((n, t) => n + t.graded, 0) }
    }).filter((r) => r.teachers)
    return { totals: { teachers: teachers.length, active: teachers.filter((t) => t.active).length, rate: pct(teachers.filter((t) => t.active).length, teachers.length) }, schools: bySchool.sort((a, b) => b.rate - a.rate), teachers: teachers.sort((a, b) => b.days - a.days) }
  })
}
