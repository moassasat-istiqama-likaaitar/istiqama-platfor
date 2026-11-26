import { respond, ApiError, newId } from './client'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { progressOf, save, BADGES } from '@/mock/progress'
import { persons, assignments, classes } from '@/mock/db'
import { isLessonOpen, weekLessonFor } from './teaching'
import { classActivityItems, classContentItems, findActivity } from './bank'
import { gradeQuiz, gradeQuestion, publicQuestion } from '@/utils/quiz'

const classIdOf = (personId) => assignments.find((x) => x.personId === personId && x.role === 'student')?.classId
/** أنشطة قسم التلميذ (أنشطة المنصة + ما ربطه المعلم أو المحرر بآخر أجله) */
const studentActs = (personId) => classActivityItems(classIdOf(personId)).filter((a) => a.due && a.visibleToStudents)

const VISIBLE = ['approved', 'temp'] // ما يراه التلميذ: معتمد أو معتمد مؤقتاً

/** جنس قسم التلميذ: لإظهار مقررات الإناث أو الذكور فقط حيث يلزم */
function genderOf(personId) {
  const a = assignments.find((x) => x.personId === personId && x.role === 'student')
  return classes.find((c) => c.id === a?.classId)?.gender || 'mixed'
}
const visibleLessons = (subjectId, personId) => {
  const g = genderOf(personId)
  return lessons.filter((l) => l.subjectId === subjectId && (!l.gender || l.gender === g))
}

const lessonContents = (lessonId) => contents.filter((c) => c.lessonId === lessonId && VISIBLE.includes(c.status))

function subjectSummary(sub, p, personId) {
  const ls = visibleLessons(sub.id, personId)
  const done = ls.filter((l) => p.done.includes(l.id)).length
  const cid = classIdOf(personId)
  // الدرس التالي = أول درس غير منجز ومفتوح (حسب خطة المعلم)
  const next = ls.find((l) => !p.done.includes(l.id) && isLessonOpen(cid, l)) || null
  return {
    ...sub,
    lessonsCount: ls.length,
    doneCount: done,
    progress: ls.length ? Math.round((done / ls.length) * 100) : 0,
    newCount: ls.filter((l) => !p.viewed.includes(l.id)).length,
    next: next ? { id: next.id, title: next.title } : null
  }
}

function activityView(a, p) {
  const sub = p.submissions[a.id]
  const lesson = lessons.find((l) => l.id === a.lessonId)
  const subject = subjects.find((s) => s.id === a.subjectId)
  let state = sub?.status || 'todo'
  if (state === 'todo' && new Date(a.due) < new Date()) state = 'late'
  return {
    // label: عنوان نشاط المعلم كما كتبه، وعنوان الدرس لأنشطة المنصة
    label: a.origin === 'teacher' ? a.title : lesson?.title || a.title,
    id: a.id, type: a.type, title: a.title, due: a.due, maxScore: a.maxScore, required: a.required,
    lesson: lesson && { id: lesson.id, title: lesson.title },
    subject: subject && { id: subject.id, name: subject.name, color: subject.color, art: subject.art, icon: subject.icon },
    state, score: sub?.score ?? null, submittedAt: sub?.at || null,
    questionsCount: a.questions?.length || 0
  }
}

/** يمنح النقاط ويحسب المواظبة: نشاط في يوم يلي آخر يوم نشاط ← تزيد السلسلة، وإلا تبدأ من 1 */
function award(p, stars) {
  p.stars += stars
  const today = new Date().toDateString()
  if (p.lastDay !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString()
    p.streak = p.lastDay === yesterday ? (p.streak || 0) + 1 : 1
    p.lastDay = today
  }
}

// شارة المعلم: «منحها المعلم فلان — السبب»
const badgeHint = (p, b) => (p.badgeNotes?.[b] ? { hint: `منحها ${p.badgeNotes[b].by}${p.badgeNotes[b].note ? ' — ' + p.badgeNotes[b].note : ''}` } : {})

function checkBadges(p) {
  const earned = []
  const add = (b) => {
    if (!p.badges.includes(b)) {
      p.badges.push(b)
      earned.push({ id: b, ...BADGES[b] })
    }
  }
  if (p.done.length >= 1) add('first-lesson')
  if (p.viewed.length >= 10) add('curious')
  if (Object.keys(p.comments).length) add('helper')
  if ((p.streak || 0) >= 3) add('streak-3')
  if ((p.streak || 0) >= 7) add('streak-7')
  return earned
}

/** GET /api/student/dashboard → لوحة التلميذ */
export function dashboard(personId, levelId) {
  return respond(() => {
    const p = progressOf(personId)
    const subs = subjects.filter((s) => s.levelId === levelId).map((s) => subjectSummary(s, p, personId))
    const visible = new Set(subs.flatMap((sb) => visibleLessons(sb.id, personId).map((l) => l.id)))
    const acts = studentActs(personId).filter((a) => !a.lessonId || visible.has(a.lessonId)).map((a) => activityView(a, p))
    const upcoming = acts.filter((a) => ['todo', 'late'].includes(a.state)).sort((a, b) => a.due.localeCompare(b.due))
    const continueSub = subs.find((s) => s.next && s.doneCount > 0) || subs.find((s) => s.next)
    // الدرس المقترح: «درس الأسبوع» الذي حدده المعلم لقسمه أولاً، ثم الدرس التالي حسب تقدّم التلميذ
    const wl = weekLessonFor(classIdOf(personId), p.done)
    const wlSub = wl && subs.find((s) => s.id === wl.subjectId)
    const totalLessons = subs.reduce((n, s) => n + s.lessonsCount, 0)
    const doneLessons = subs.reduce((n, s) => n + s.doneCount, 0)
    return {
      stars: p.stars, streak: p.streak,
      xp: { level: Math.floor(p.stars / 100) + 1, inLevel: p.stars % 100, next: 100 },
      badges: p.badges.map((b) => ({ id: b, ...BADGES[b], ...badgeHint(p, b) })),
      subjects: subs,
      week: weekPlan(acts),
      continueWith: wlSub
        ? { lessonId: wl.id, title: wl.title, subject: wlSub, fromTeacher: true }
        : continueSub?.next ? { lessonId: continueSub.next.id, title: continueSub.next.title, subject: continueSub, fromTeacher: false } : null,
      upcoming: upcoming.slice(0, 4),
      todoCount: upcoming.length,
      progress: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
      doneLessons, totalLessons,
      // هدف اليوم: درسان + نشاط
      dailyGoal: { target: 3, done: Math.min(3, (p.todayCount || 0)) }
    }
  })
}

// مهام الأسبوع: الأنشطة غير المنجزة موزّعة على الأيام السبعة القادمة
function weekPlan(acts) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const key = d.toDateString()
    days.push({ date: d.toISOString(), items: acts.filter((a) => ['todo', 'late'].includes(a.state) && new Date(a.due).toDateString() === key) })
  }
  return days
}

/** GET /api/student/subjects/{id} → المادة ودروسها مع حالة كل درس */
export function subject(personId, subjectId) {
  return respond(() => {
    const p = progressOf(personId)
    const sub = subjects.find((s) => s.id === subjectId)
    if (!sub) throw new ApiError('not_found', 'المادة غير موجودة')
    const ls = visibleLessons(subjectId, personId)
    const cid = classIdOf(personId)
    const firstOpen = ls.find((l) => !p.done.includes(l.id) && isLessonOpen(cid, l))
    const axes = [...new Set(ls.map((l) => l.axis))]
    return {
      ...subjectSummary(sub, p, personId),
      axes: axes.map((ax) => {
        const al = ls.filter((l) => l.axis === ax)
        return { name: ax, total: al.length, done: al.filter((l) => p.done.includes(l.id)).length }
      }),
      lessons: ls.map((l) => ({
        id: l.id, title: l.title, label: l.label, axis: l.axis, order: l.order, minutes: l.minutes, gender: l.gender,
        // locked = لم يفتحه المعلم بعد لهذا القسم
        state: p.done.includes(l.id) ? 'done' : !isLessonOpen(cid, l) ? 'locked' : l.id === firstOpen?.id ? 'current' : 'open',
        isNew: !p.viewed.includes(l.id),
        types: Array.from(new Set(lessonContents(l.id).map((c) => c.type))),
        activities: studentActs(personId).filter((a) => a.lessonId === l.id).length
      }))
    }
  })
}

/** GET /api/student/lessons/{id} → الدرس بمحتواه وأنشطته وتعليقاته */
export function lesson(personId, lessonId) {
  return respond(() => {
    const p = progressOf(personId)
    const l = lessons.find((x) => x.id === lessonId)
    if (!l) throw new ApiError('not_found', 'الدرس غير موجود')
    if (!p.viewed.includes(l.id)) {
      p.viewed.push(l.id)
      save()
    }
    const sub = subjects.find((s) => s.id === l.subjectId)
    const siblings = visibleLessons(l.subjectId, personId)
    const idx = siblings.findIndex((x) => x.id === l.id)
    return {
      ...l,
      subject: { id: sub.id, name: sub.name, color: sub.color, accent: sub.accent, art: sub.art, icon: sub.icon },
      done: p.done.includes(l.id),
      note: p.notes?.[l.id] || '',
      // محتوى الدرس في قسم التلميذ: الأساسي + ما ربطه المعلم/المحرر + ما رفعه معلمه واعتُمد
      contents: classContentItems(classIdOf(personId)).filter((c) => c.lessonId === l.id).map((c) => ({ ...c, myRating: p.ratings[c.id] || 0 })),
      activities: studentActs(personId).filter((a) => a.lessonId === l.id).map((a) => activityView(a, p)),
      comments: (p.comments[l.id] || []).concat(SAMPLE_COMMENTS(l)),
      prev: siblings[idx - 1] ? { id: siblings[idx - 1].id, title: siblings[idx - 1].title } : null,
      next: siblings[idx + 1] ? { id: siblings[idx + 1].id, title: siblings[idx + 1].title } : null
    }
  })
}

/** PUT /api/student/lessons/{id}/note  { text } — ملاحظات التلميذ الشخصية */
export function saveNote(personId, lessonId, text) {
  return respond(() => {
    const p = progressOf(personId)
    p.notes = p.notes || {}
    p.notes[lessonId] = text
    save()
    return { ok: true, savedAt: new Date().toISOString() }
  }, 150)
}

/** POST /api/student/activities/{id}/check  { index, answer } → صحيحة أم لا (وضع التغذية الفورية للصغار) */
export function checkAnswer(id, index, answer) {
  return respond(() => {
    const q = findActivity(id).questions[index]
    const r = gradeQuestion(q, answer)
    return { correct: r.correct, answer: q.answer }
  }, 120)
}

const SAMPLE_COMMENTS = (l) => [
  { id: `sc-${l.id}`, author: 'المعلم عمر', role: 'teacher', body: 'شاهدوا الفيديو ثم حاولوا حل التقييم، وأنا هنا لأي سؤال.', at: new Date(Date.now() - 86400000 * 2).toISOString() }
]

/** POST /api/student/lessons/{id}/complete → يمنح نقاطاً وشارات */
export function completeLesson(personId, lessonId) {
  return respond(() => {
    const p = progressOf(personId)
    let gained = 0
    if (!p.done.includes(lessonId)) {
      p.done.push(lessonId)
      gained = 20
      award(p, gained)
      p.todayCount = (p.todayCount || 0) + 1
      const l = lessons.find((x) => x.id === lessonId)
      const all = visibleLessons(l.subjectId, personId)
      if (all.every((x) => p.done.includes(x.id)) && !p.badges.includes('subject-master')) p.badges.push('subject-master')
    }
    const badges = checkBadges(p)
    save()
    return { gained, stars: p.stars, badges }
  }, 300)
}

/** POST /api/contents/{id}/rating  { stars } */
export function rateContent(personId, contentId, stars) {
  return respond(() => {
    const p = progressOf(personId)
    p.ratings[contentId] = stars
    save()
    return { ok: true }
  }, 100)
}

/** POST /api/lessons/{id}/comments  { body } */
export function addComment(personId, lessonId, body) {
  return respond(() => {
    const p = progressOf(personId)
    const person = persons.find((x) => x.id === personId)
    const c = { id: newId('cm'), author: person ? person.firstName : 'أنا', role: 'student', mine: true, body, at: new Date().toISOString() }
    p.comments[lessonId] = [c, ...(p.comments[lessonId] || [])]
    const badges = checkBadges(p)
    save()
    return { comment: c, badges }
  })
}

/** GET /api/student/activities → كل أنشطة المستوى مع حالة كل نشاط */
export function myActivities(personId, levelId) {
  return respond(() => {
    const p = progressOf(personId)
    const visible = new Set(subjects.filter((x) => x.levelId === levelId).flatMap((sb) => visibleLessons(sb.id, personId).map((l) => l.id)))
    return studentActs(personId).filter((a) => !a.lessonId || visible.has(a.lessonId)).map((a) => activityView(a, p)).sort((a, b) => a.due.localeCompare(b.due))
  })
}

/** GET /api/student/activities/{id} */
export function activity(personId, id) {
  return respond(() => {
    const p = progressOf(personId)
    const a = studentActs(personId).find((x) => x.id === id) || findActivity(id)
    if (!a) throw new ApiError('not_found', 'النشاط غير موجود')
    const sub = p.submissions[a.id]
    const view = activityView(a, p)
    const done = !!sub
    return {
      ...view,
      instructions: a.instructions, attachments: a.attachments, minutes: a.minutes,
      // الإجابات الصحيحة لا تُرسل قبل التسليم؛ بعده تُرسل كاملة للمراجعة
      questions: a.questions?.map((q, i) => (done ? { ...q, type: q.type || (q.options?.length === 2 ? 'tf' : 'mcq') } : publicQuestion(q, i + personId.length))),
      modelAnswer: sub?.status === 'graded' ? a.modelAnswer : null,
      submission: sub || null
    }
  })
}

/** POST /api/student/activities/{id}/quiz  { answers[] } → النتيجة (تصحيح آلي) */
export function submitQuiz(personId, id, answers) {
  return respond(() => {
    const p = progressOf(personId)
    const a = findActivity(id)
    // تصحيح آلي لكل الأنواع؛ الأسئلة المفتوحة تنتظر المعلم (الحالة: بانتظار التصحيح)
    const g = gradeQuiz(a.questions, answers)
    const correct = g.perQuestion.filter((r) => r.correct).length
    const score = Math.round((g.auto / g.max) * a.maxScore * 10) / 10
    p.submissions[id] = { status: g.needsManual ? 'submitted' : 'graded', answers, score, perQuestion: g.perQuestion, at: new Date().toISOString() }
    const gained = 10 + correct * 5
    award(p, gained)
    p.todayCount = (p.todayCount || 0) + 1
    if (score === a.maxScore && !p.badges.includes('quiz-ace')) p.badges.push('quiz-ace')
    const badges = checkBadges(p)
    save()
    return { score, correct, total: a.questions.length, maxScore: a.maxScore, gained, stars: p.stars, badges, pending: g.needsManual }
  }, 500)
}

/** POST /api/student/activities/{id}/homework  { text, files[] } */
export function submitHomework(personId, id, { text, files }) {
  return respond(() => {
    if (!text?.trim() && !files?.length) throw new ApiError('required', 'اكتب إجابتك أو أرفق ملفاً')
    const p = progressOf(personId)
    p.submissions[id] = { status: 'submitted', text, files, at: new Date().toISOString() }
    award(p, 15)
    p.todayCount = (p.todayCount || 0) + 1
    save()
    return { ok: true, gained: 15, stars: p.stars }
  }, 500)
}

/** GET /api/student/progress → التقرير الشخصي */
export function progressReport(personId, levelId) {
  return respond(() => {
    const p = progressOf(personId)
    const subs = subjects.filter((s) => s.levelId === levelId).map((s) => {
      const sum = subjectSummary(s, p, personId)
      const acts = studentActs(personId).filter((a) => a.subjectId === s.id)
      const quizzes = acts.filter((a) => a.type === 'quiz')
      const graded = acts.filter((a) => p.submissions[a.id]?.status === 'graded')
      const avg = graded.length ? graded.reduce((n, a) => n + (p.submissions[a.id].score / a.maxScore) * 20, 0) / graded.length : null
      return {
        ...sum,
        quizzesDone: quizzes.filter((a) => p.submissions[a.id]).length,
        quizzesTotal: quizzes.length,
        homeworkDone: acts.filter((a) => a.type === 'homework' && p.submissions[a.id]).length,
        homeworkTotal: acts.filter((a) => a.type === 'homework').length,
        average: avg === null ? null : Math.round(avg * 10) / 10,
        comments: Object.entries(p.comments).filter(([lid]) => lid.startsWith(s.id)).reduce((n, [, arr]) => n + arr.length, 0) + Math.floor(sum.doneCount / 2)
      }
    })
    const graded = Object.values(p.submissions).filter((x) => x.status === 'graded')
    return {
      stars: p.stars, streak: p.streak, badges: p.badges.map((b) => ({ id: b, ...BADGES[b], ...badgeHint(p, b) })),
      xp: { level: Math.floor(p.stars / 100) + 1, inLevel: p.stars % 100, next: 100 },
      history: gradeHistory(p),
      allBadges: Object.entries(BADGES).filter(([id, b]) => !b.manual || p.badges.includes(id)).map(([id, b]) => ({ id, ...b, ...badgeHint(p, id), earned: p.badges.includes(id) })),
      subjects: subs,
      totals: {
        lessons: subs.reduce((n, s) => n + s.doneCount, 0),
        lessonsAll: subs.reduce((n, s) => n + s.lessonsCount, 0),
        activities: Object.keys(p.submissions).length,
        graded: graded.length
      }
    }
  })
}

function gradeHistory(p) {
  return Object.entries(p.submissions)
    .filter(([, x]) => x.status === 'graded')
    .map(([id, x]) => {
      const a = findActivity(id)
      return a ? { id, title: a.title, at: x.at, score20: Math.round((x.score / a.maxScore) * 200) / 10, subjectId: a.subjectId } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.at.localeCompare(b.at))
}

/** GET /api/student/search?q=&type= → البحث في محتوى القسم */
export function search(levelId, q, type) {
  return respond(() => {
    const s = (q || '').trim()
    return contents
      .filter((c) => c.levelId === levelId && VISIBLE.includes(c.status))
      .filter((c) => !type || type === 'all' || c.type === type)
      .filter((c) => !s || c.title.includes(s) || c.keywords.some((k) => k.includes(s)))
      .slice(0, 40)
      .map((c) => {
        const sub = subjects.find((x) => x.id === c.subjectId)
        const l = lessons.find((x) => x.id === c.lessonId)
        return { id: c.id, title: c.title, type: c.type, classification: c.classification, lessonId: c.lessonId, lessonTitle: l?.title, subject: { name: sub.name, color: sub.color, art: sub.art, icon: sub.icon } }
      })
  }, 150)
}
