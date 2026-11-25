import { respond, ApiError, newId } from './client'
import { assignments, classes, levels } from '@/mock/db'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { progressOf, save as saveProgress } from '@/mock/progress'
import { collection } from '@/mock/collections'
import { personOf, fullName, studentSnapshot, classInfo } from './people'

/**
 * فضاء المعلم: خطة القسم (فتح الدروس + درس الأسبوع)، التسليمات والتصحيح، المحتوى والواجبات والاختبارات.
 */

const plans = collection('classPlans', [])
const grades = collection('grades', [])
const uploads = collection('uploads', () => SEED_UPLOADS())
const myActs = collection('teacherActivities', [])
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
    const mine = uploads.all().filter((u) => u.authorId === assignment.personId)
    return {
      classes: cls,
      students: cls.reduce((n, c) => n + c.students, 0),
      pendingCount: pending.length,
      pending: pending.slice(0, 5),
      atRisk,
      uploads: { total: mine.length, review: mine.filter((u) => u.status === 'review').length },
      upcoming: activities.filter((a) => cls.some((c) => c.levelId === a.levelId) && new Date(a.due) > new Date()).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5)
        .map((a) => ({ id: a.id, title: a.title, type: a.type, due: a.due, className: cls.find((c) => c.levelId === a.levelId)?.name }))
    }
  })
}

/* ——— التسليمات ——— */

function hashN(s) {
  let h = 0
  for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) % 99991
  return h
}

/** كل تسليمات أقسام المعلم: الحقيقية (من تقدّم التلاميذ) + المولَّدة */
function collectSubmissions(classIds) {
  const out = []
  classIds.forEach((cid) => {
    const c = classes.find((x) => x.id === cid)
    const acts = activities.filter((a) => a.levelId === c.levelId && new Date(a.due) < new Date(Date.now() + 6 * 864e5)).slice(0, 8)
    classStudentIds(cid).forEach((sid) => {
      const p = personOf(sid)
      acts.forEach((a) => {
        const key = `${a.id}:${sid}`
        const g = grades.find(key)
        let status, score = null, at = null, text = '', files = [], note = ''
        if (!p.generated) {
          const sub = progressOf(sid).submissions[a.id]
          if (!sub) return
          ;({ status, text = '', files = [], note = '' } = sub)
          score = sub.score ?? null
          at = sub.at
        } else {
          const h = hashN(key) % 10
          if (h < 2) return // لم يسلّم بعد
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
          status, score, at, text, files, note, late: at && new Date(at) > new Date(a.due)
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

/** POST /api/teacher/submissions/:id/grade { score, note } — يظهر للتلميذ ووليه */
export function grade(id, score, note) {
  return respond(() => {
    const [activityId, studentId] = id.split(':')
    const a = activities.find((x) => x.id === activityId)
    if (score < 0 || score > a.maxScore) throw new ApiError('invalid', `العلامة بين 0 و${a.maxScore}`)
    const p = personOf(studentId)
    if (!p.generated) {
      const pr = progressOf(studentId)
      pr.submissions[activityId] = { ...pr.submissions[activityId], status: 'graded', score, note }
      saveProgress()
    } else if (grades.find(id)) grades.update(id, { score, note })
    else grades.insert({ id, score, note })
    return true
  }, 350)
}

/* ——— المحتوى ——— */

function SEED_UPLOADS() {
  const now = Date.now()
  return [
    { id: 'up1', authorId: 'p5', authorName: 'عمر باعمر', title: 'خريطة ذهنية: البيع في الإسلام', type: 'image', levelId: 'S2', subjectName: 'الفقه', classIds: ['c3'], target: 'library', status: 'review', note: '', at: new Date(now - 2 * 864e5).toISOString() },
    { id: 'up2', authorId: 'p5', authorName: 'عمر باعمر', title: 'ملخص أحكام الطهارة', type: 'pdf', levelId: 'M4', subjectName: 'الفقه', classIds: ['c2'], target: 'class', status: 'approved', note: '', at: new Date(now - 6 * 864e5).toISOString() },
    { id: 'up3', authorId: 'p6', authorName: 'عائشة الشيخ', title: 'بطاقات التاء المربوطة والمفتوحة', type: 'slides', levelId: 'P1', subjectName: 'اللغة العربية', classIds: ['c4'], target: 'library', status: 'review', note: '', at: new Date(now - 864e5).toISOString() },
    { id: 'up4', authorId: 'p6', authorName: 'عائشة الشيخ', title: 'فيديو: قراءة جماعية', type: 'video', levelId: 'M1', subjectName: 'اللغة العربية', classIds: ['c5'], target: 'class', status: 'rejected', note: 'جودة الصوت ضعيفة، يرجى إعادة التسجيل.', at: new Date(now - 9 * 864e5).toISOString() },
    { id: 'up6', authorId: 'p5', authorName: 'عمر باعمر', title: 'بطاقات مراجعة: أحكام البيع', type: 'slides', levelId: 'S2', subjectName: 'الفقه', classIds: ['c3'], target: 'class', status: 'review', note: '', at: new Date(now - 5 * 36e5).toISOString() },
    { id: 'up5', authorId: 'g1003', authorName: 'معلم مدرسة النور', title: 'تمارين تطبيقية في التجويد', type: 'pdf', levelId: 'M1', subjectName: 'أحكام التجويد', classIds: [], target: 'library', status: 'review', note: '', at: new Date(now - 3 * 864e5).toISOString() }
  ]
}

/** GET /api/teacher/class-library?classIds= → المحتوى المتاح لأقسام المعلم (معتمد + ما رفعه) */
export function classLibrary(classIds) {
  return respond(() => {
    const lvls = [...new Set(classIds.map(levelOfClass))]
    const central = contents.filter((c) => lvls.includes(c.levelId) && ['approved', 'temp'].includes(c.status)).slice(0, 60).map((c) => ({
      id: c.id, title: c.title, type: c.type, status: c.status, source: 'central', lessonTitle: lessons.find((l) => l.id === c.lessonId)?.title,
      subjectName: subjects.find((s) => s.id === c.subjectId)?.name, levelName: levels.find((l) => l.id === c.levelId)?.name, views: c.views
    }))
    const own = uploads.all().filter((u) => u.classIds.some((id) => classIds.includes(id)) && u.status === 'approved').map((u) => ({ ...u, source: 'mine', levelName: levels.find((l) => l.id === u.levelId)?.name, views: 0 }))
    return [...own, ...central]
  })
}

/** GET /api/teacher/uploads?authorId= */
export function myUploads(authorId) {
  return respond(() => uploads.all().filter((u) => u.authorId === authorId).map((u) => ({ ...u, levelName: levels.find((l) => l.id === u.levelId)?.name })))
}

/** POST /api/teacher/uploads — target: class (يظهر لأقسامي بعد مصادقة المدير) | library (يُقترح للمكتبة المركزية ← المحرر) */
export function createUpload(author, data) {
  return respond(() => uploads.insert({ id: newId('up'), authorId: author.id, authorName: fullName(author), status: 'review', note: '', at: new Date().toISOString(), ...data }), 500)
}
export function removeUpload(id) {
  return respond(() => uploads.remove(id))
}

/** POST /api/teacher/activities — واجب أو اختبار ينشئه المعلم لأقسامه */
export function createActivity(author, data) {
  return respond(() => myActs.insert({ id: newId('ta'), authorId: author.id, authorName: fullName(author), at: new Date().toISOString(), status: 'published', ...data }), 400)
}
export function listMyActivities(authorId) {
  return respond(() => myActs.all().filter((a) => a.authorId === authorId))
}

/** بنك الأسئلة: أسئلة اختبارات المنصة لمستوى ومادة (لبناء اختبار أو ورقة حضورية) */
export function questionBank(levelId, subjectId) {
  return respond(() =>
    activities
      .filter((a) => a.type === 'quiz' && a.levelId === levelId && (!subjectId || a.subjectId === subjectId))
      .flatMap((a) => a.questions.map((q, i) => ({ id: `${a.id}#${i}`, ...q, lessonTitle: lessons.find((l) => l.id === a.lessonId)?.title })))
  )
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

/* ——— للمحرر ومدير المدرسة: مراجعة ما رفعه المعلمون ——— */
export function uploadsQueue({ target, schoolTeacherIds } = {}) {
  return respond(() => uploads.all().filter((u) => (!target || u.target === target) && (!schoolTeacherIds || schoolTeacherIds.includes(u.authorId))).map((u) => ({ ...u, levelName: levels.find((l) => l.id === u.levelId)?.name })))
}
export function decideUpload(id, status, note = '') {
  return respond(() => uploads.update(id, { status, note, decidedAt: new Date().toISOString() }))
}
