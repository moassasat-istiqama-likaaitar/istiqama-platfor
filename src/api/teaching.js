import { respond, ApiError, newId } from './client'
import { assignments, classes, levels } from '@/mock/db'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { progressOf, save as saveProgress } from '@/mock/progress'
import { collection } from '@/mock/collections'
import { personOf, fullName, studentSnapshot, classInfo } from './people'
import { uploads, teacherActs, findActivity, classActivityItems, normActivity, linkSync } from './bank'
import { gradeQuiz, isManual } from '@/utils/quiz'

/**
 * فضاء المعلم: خطة القسم (فتح الدروس + درس الأسبوع)، التسليمات والتصحيح، المحتوى والواجبات والاختبارات.
 */

const plans = collection('classPlans', [])
const grades = collection('grades', [])
const offline = collection('offlineTests', [])

const classStudentIds = (classId) => assignments.filter((a) => a.role === 'student' && a.classId === classId).map((a) => a.personId)
const levelOfClass = (classId) => classes.find((c) => c.id === classId)?.levelId

/* ——— خطة القسم ——— */

/** خطة القسم كما تراها المنصة: mode=all (كل الدروس مفتوحة) أو gradual (حتى درس معيّن في كل مادة) */
export function planOf(classId) {
  return plans.find(classId) || { id: classId, mode: 'all', openUntil: {}, weekLesson: {} }
}

/** هل الدرس مفتوح لقسم معيّن؟ (يُستعمل في فضاء التلميذ) */
export function isLessonOpen(classId, lesson) {
  const p = planOf(classId)
  if (p.mode !== 'gradual') return true
  const until = p.openUntil[lesson.subjectId]
  return until === undefined ? lesson.order <= 3 : lesson.order <= until
}

/** درس الأسبوع للقسم (أول درس محدد من المعلم لم ينجزه التلميذ) */
export function weekLessonFor(classId, donIds = []) {
  const p = planOf(classId)
  return Object.values(p.weekLesson || {}).map((id) => lessons.find((l) => l.id === id)).find((l) => l && !donIds.includes(l.id)) || null
}

/** GET /api/teacher/classes/:id/plan → المواد ودروسها مع حالة الفتح */
export function classPlan(classId) {
  return respond(() => {
    const p = planOf(classId)
    const levelId = levelOfClass(classId)
    const g = classes.find((c) => c.id === classId)?.gender
    const studs = classStudentIds(classId)
    return {
      ...p,
      subjects: subjects.filter((s) => s.levelId === levelId).map((s) => ({
        id: s.id, name: s.name, icon: s.icon, color: s.color,
        lessons: lessons.filter((l) => l.subjectId === s.id && (!l.gender || l.gender === g)).map((l) => ({
          id: l.id, title: l.title, label: l.label, axis: l.axis, order: l.order,
          open: isLessonOpen(classId, l),
          week: p.weekLesson?.[s.id] === l.id,
          doneBy: studs.filter((sid) => personOf(sid)?.generated ? (studentSnapshot(sid).progress / 100) * 20 > l.order : progressOf(sid).done.includes(l.id)).length
        }))
      })),
      students: studs.length
    }
  })
}

/** PUT /api/teacher/classes/:id/plan { mode, openUntil, weekLesson } */
export function savePlan(classId, patch) {
  return respond(() => {
    const cur = planOf(classId)
    const next = { ...cur, ...patch, id: classId }
    if (plans.find(classId)) plans.update(classId, next)
    else plans.insert(next)
    return next
  })
}

/* ——— لوحة المعلم ——— */

export function teacherHome(assignment) {
  return respond(() => {
    const cls = classes.filter((c) => assignment.classIds?.includes(c.id)).map(classInfo)
    const subs = collectSubmissions(assignment.classIds || [])
    const pending = subs.filter((s) => s.status === 'submitted')
    const atRisk = (assignment.classIds || []).flatMap((cid) => classStudentIds(cid).map((sid) => ({ sid, cid, s: studentSnapshot(sid) })))
      .filter((x) => x.s.progress < 30 || x.s.late >= 3)
      .slice(0, 6)
      .map((x) => ({ id: x.sid, name: fullName(personOf(x.sid)), className: classes.find((c) => c.id === x.cid)?.name, progress: x.s.progress, late: x.s.late }))
    const mine = uploads().all().filter((u) => u.authorId === assignment.personId)
    const upcoming = (assignment.classIds || []).flatMap((cid) => classActivityItems(cid).map((a) => ({ ...a, className: classes.find((c) => c.id === cid)?.name })))
      .filter((a) => a.due && new Date(a.due) > new Date()).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5)
    return {
      classes: cls,
      students: cls.reduce((n, c) => n + c.students, 0),
      pendingCount: pending.length,
      pending: pending.slice(0, 5),
      atRisk,
      uploads: { total: mine.length, review: mine.filter((u) => ['review', 'temp'].includes(u.status)).length, drafts: mine.filter((u) => u.status === 'draft').length },
      upcoming: upcoming.map((a) => ({ id: a.id, title: a.title, type: a.type, due: a.due, className: a.className }))
    }
  })
}

/* ——— التسليمات ——— */

function hashN(s) {
  let h = 0
  for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) % 99991
  return h
}

/** كل تسليمات الأقسام: الحقيقية (من تقدّم التلاميذ) + المولَّدة لأنشطة المنصة */
function collectSubmissions(classIds) {
  const out = []
  classIds.forEach((cid) => {
    const c = classes.find((x) => x.id === cid)
    if (!c) return
    const acts = classActivityItems(cid).filter((a) => !a.due || new Date(a.due) < new Date(Date.now() + 6 * 864e5))
    const platform = acts.filter((a) => a.origin === 'platform').slice(0, 8)
    const linked = acts.filter((a) => a.origin === 'teacher')
    classStudentIds(cid).forEach((sid) => {
      const p = personOf(sid)
      ;[...linked, ...platform].forEach((a) => {
        const key = `${a.id}:${sid}`
        const g = grades.find(key)
        let status, score = null, at = null, text = '', files = [], note = '', answers = null, perQuestion = null
        if (!p.generated) {
          const sub = progressOf(sid).submissions[a.id]
          if (!sub) return
          ;({ status, text = '', files = [], note = '' } = sub)
          score = sub.score ?? null
          at = sub.at
          answers = sub.answers || null
          perQuestion = sub.perQuestion || null
        } else {
          if (a.origin === 'teacher') return // أنشطة المعلمين الجديدة: لا تسليمات مولَّدة
          const h = hashN(key) % 10
          if (h < 2) return
          status = g ? 'graded' : a.type === 'quiz' || h > 6 ? 'graded' : 'submitted'
          score = g ? g.score : status === 'graded' ? Math.round(a.maxScore * (0.45 + (h % 6) / 10)) : null
          at = new Date(Date.now() - (h + 1) * 36e5 * 7).toISOString()
          text = a.type === 'homework' ? 'أنجزت الواجب في الكراس، الصورة مرفقة.' : ''
          files = a.type === 'homework' ? ['صورة-الكراس.jpg'] : []
          note = g?.note || ''
        }
        out.push({
          id: key, activityId: a.id, studentId: sid, student: fullName(p), classId: cid, className: c.name,
          title: a.title, type: a.type, subjectName: subjects.find((s) => s.id === a.subjectId)?.name, maxScore: a.maxScore,
          status, score, at, text, files, note, answers, perQuestion, questions: a.questions || [], late: a.due && at && new Date(at) > new Date(a.due)
        })
      })
    })
  })
  return out.sort((a, b) => (a.status === b.status ? (b.at || '').localeCompare(a.at || '') : a.status === 'submitted' ? -1 : 1))
}

/** GET /api/teacher/submissions */
export function submissions(classIds) {
  return respond(() => collectSubmissions(classIds))
}

/** POST /api/teacher/submissions/:id/grade { score, note, manualScores } — يظهر للتلميذ ووليه */
export function grade(id, score, note, manualScores = null) {
  return respond(() => {
    const [activityId, studentId] = id.split(':')
    const a = findActivity(activityId)
    if (score < 0 || score > a.maxScore) throw new ApiError('invalid', `العلامة بين 0 و${a.maxScore}`)
    const p = personOf(studentId)
    if (!p.generated) {
      const pr = progressOf(studentId)
      const sub = pr.submissions[activityId] || {}
      let perQuestion = sub.perQuestion
      if (manualScores && perQuestion) perQuestion = perQuestion.map((r, i) => (manualScores[i] !== undefined ? { ...r, score: manualScores[i], manual: false, correct: manualScores[i] >= r.max, gradedByTeacher: true } : r))
      pr.submissions[activityId] = { ...sub, status: 'graded', score, note, perQuestion }
      saveProgress()
    } else if (grades.find(id)) grades.update(id, { score, note })
    else grades.insert({ id, score, note })
    return true
  }, 350)
}

/* ——— المحتوى: كل ما يرفعه المعلم هدفه المكتبة المركزية ——— */

/** GET /api/teacher/uploads?authorId= */
export function myUploads(authorId) {
  return respond(() => uploads().all().filter((u) => u.authorId === authorId).map((u) => ({ ...u, levelName: levels.find((l) => l.id === u.levelId)?.name })))
}

/** POST /api/teacher/uploads — submit=false: مسودة عند المعلم؛ submit=true: قيد المراجعة */
export function createUpload(author, data, submit = true) {
  return respond(() => {
    if (data.id && uploads().find(data.id)) return uploads().update(data.id, { ...data, status: submit ? 'review' : 'draft', at: new Date().toISOString() })
    return uploads().insert({ id: newId('up'), authorId: author.id, authorName: fullName(author), note: '', classification: null, essential: false, ...data, status: submit ? 'review' : 'draft', at: new Date().toISOString() })
  }, 450)
}
/** POST /api/teacher/uploads/:id/submit — إرسال مسودة (أو بعد طلب تعديل) للمراجعة */
export function submitUpload(id) {
  return respond(() => uploads().update(id, { status: 'review', at: new Date().toISOString() }))
}
export function removeUpload(id) {
  return respond(() => uploads().remove(id))
}

/* ——— الأنشطة (واجبات واختبارات) ——— */

/**
 * POST /api/teacher/activities — يُنشر لأقسام المعلم فوراً (targets) بآخر أجل،
 * ويُرسل للمكتبة المركزية للمراجعة (submit) أو يبقى مسودة.
 */
export function createActivity(author, data, { targets = [], due = null, submit = true, byRole = 'teacher' } = {}) {
  return respond(() => {
    const row = teacherActs().insert({ id: newId('ta'), authorId: author.id, authorName: fullName(author), at: new Date().toISOString(), note: '', ...data, status: byRole === 'editor' ? 'approved' : submit ? 'review' : 'draft' })
    let reached = 0
    if (targets.length) reached = linkSync(author, byRole, { itemKind: 'activity', itemId: row.id, targets, lessonId: data.lessonId || null, due }).classes
    return { id: row.id, reached }
  }, 450)
}
export function listMyActivities(authorId) {
  return respond(() => teacherActs().all().filter((a) => a.authorId === authorId))
}
export function submitActivity(id) {
  return respond(() => teacherActs().update(id, { status: 'review' }))
}

/** بنك الأسئلة: أسئلة اختبارات المنصة والمعتمدة من المعلمين لمستوى ومادة */
export function questionBank(levelId, subjectId) {
  return respond(() => {
    const plat = activities.filter((a) => a.type === 'quiz' && a.levelId === levelId && (!subjectId || a.subjectId === subjectId))
    const mine = teacherActs().all().filter((a) => a.kind === 'quiz' && a.status === 'approved').map(normActivity).filter((a) => a.levelId === levelId && (!subjectId || a.subjectId === subjectId))
    return [...mine, ...plat].flatMap((a) => (a.questions || []).map((q, i) => ({ id: `${a.id}#${i}`, ...q, lessonTitle: lessons.find((l) => l.id === a.lessonId)?.title || a.title })))
  })
}

export function listOfflineTests(authorId) {
  return respond(() => offline.all().filter((t) => t.authorId === authorId))
}
export function saveOfflineTest(author, data) {
  return respond(() => (data.id && offline.find(data.id) ? offline.update(data.id, data) : offline.insert({ ...data, id: newId('ot'), authorId: author.id, at: new Date().toISOString() })))
}
export function getOfflineTest(id) {
  return respond(() => offline.find(id))
}

/* ——— مدير المدرسة: يصادق فقط (← معتمد مؤقتاً لأقسام المعلم)، ولا يرفض ولا يطلب تعديلاً ——— */
export function managerQueue(schoolTeacherIds) {
  return respond(() => [
    ...uploads().all().filter((u) => schoolTeacherIds.includes(u.authorId) && u.status !== 'draft').map((u) => ({ ...u, kind: 'upload', levelName: levels.find((l) => l.id === u.levelId)?.name })),
    ...teacherActs().all().filter((a) => schoolTeacherIds.includes(a.authorId) && a.status !== 'draft').map((a) => ({ ...normActivity(a), kind: 'activity', type: a.kind === 'quiz' ? 'quiz' : 'homework', subjectName: subjects.find((s) => s.id === a.subjectId)?.name, levelName: levels.find((l) => l.id === a.levelId)?.name, classIds: [] }))
  ].sort((a, b) => (b.at || '').localeCompare(a.at || '')))
}
export function managerApprove(kind, id) {
  return respond(() => {
    const col = kind === 'upload' ? uploads() : teacherActs()
    const r = col.find(id)
    if (r.status !== 'review') throw new ApiError('invalid', 'المصادقة للعناصر قيد المراجعة فقط')
    return col.update(id, { status: 'temp', managerAt: new Date().toISOString() })
  }, 300)
}
