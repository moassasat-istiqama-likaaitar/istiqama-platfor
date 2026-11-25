import { respond, ApiError } from './client'
import { levels } from '@/mock/db'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { collection } from '@/mock/collections'

/**
 * التحرير والمراجعة: طابور المراجعة (محتوى المكتبة + مقترحات المعلمين)، الأنشطة، تقارير المحتوى.
 * قرارات المراجعة: approved (معتمد) | temp (معتمد مؤقتاً) | rejected (مرفوض بملاحظة) | draft (طلب تعديل)
 */
const reviewLog = collection('reviewLog', [])
const uploads = () => collection('uploads').all()
const teacherActs = () => collection('teacherActivities').all()

const meta = (c) => ({
  subjectName: subjects.find((s) => s.id === c.subjectId)?.name || c.subjectName,
  levelName: levels.find((l) => l.id === c.levelId)?.name,
  lessonTitle: lessons.find((l) => l.id === c.lessonId)?.title || ''
})

/** GET /api/editor/queue → كل ما ينتظر قراراً */
export function reviewQueue() {
  return respond(() => {
    const lib = contents.filter((c) => ['pending', 'draft'].includes(c.status)).map((c) => ({
      id: c.id, kind: 'content', origin: 'المكتبة', title: c.title, type: c.type, classification: c.classification, authorName: c.authorName, at: c.createdAt,
      status: c.status === 'pending' ? 'content_pending' : 'draft', ...meta(c), payload: c.payload
    }))
    const props = uploads().filter((u) => u.target === 'library' && u.status === 'review').map((u) => ({
      id: u.id, kind: 'upload', origin: 'مقترح معلم', title: u.title, type: u.type, classification: 'enrichment', authorName: u.authorName, at: u.at, status: 'content_pending', ...meta(u), subjectName: u.subjectName
    }))
    const quizzes = teacherActs().filter((a) => a.status === 'review').map((a) => ({
      id: a.id, kind: 'activity', origin: 'نشاط', title: a.title, type: 'quiz', classification: 'activity', authorName: a.authorName, at: a.at, status: 'content_pending', ...meta(a), questions: a.questions
    }))
    return [...props, ...quizzes, ...lib].sort((a, b) => (b.at || '').localeCompare(a.at || ''))
  })
}

/** POST /api/editor/review/:id { decision, note } */
export function decide(item, decision, note = '') {
  return respond(() => {
    if (decision === 'rejected' && !note.trim()) throw new ApiError('required', 'اكتب سبب الرفض ليعرف صاحب المحتوى ما يعدّله')
    if (item.kind === 'content') {
      const c = contents.find((x) => x.id === item.id)
      c.status = decision
    } else if (item.kind === 'upload') {
      collection('uploads').update(item.id, { status: decision === 'temp' ? 'approved' : decision === 'draft' ? 'rejected' : decision, note })
    } else {
      collection('teacherActivities').update(item.id, { status: decision === 'rejected' || decision === 'draft' ? 'rejected' : 'published', note })
    }
    reviewLog.insert({ id: `${item.id}:${Date.now()}`, itemId: item.id, title: item.title, decision, note, at: new Date().toISOString() })
    return true
  }, 350)
}

export function recentDecisions() {
  return respond(() => reviewLog.all().slice(0, 30))
}

/** GET /api/editor/activities → اختبارات وواجبات المنصة */
export function listActivities() {
  return respond(() => [
    ...teacherActs().map((a) => ({ id: a.id, title: a.title, type: a.kind === 'quiz' ? 'quiz' : 'homework', levelName: levels.find((l) => l.id === (a.levelId || ''))?.name || '—', subjectName: subjects.find((s) => s.id === a.subjectId)?.name || '—', authorName: a.authorName, count: a.questions?.length || 0, status: a.status === 'published' ? 'approved' : a.status, questions: a.questions || [], at: a.at })),
    ...activities.map((a) => ({ id: a.id, title: a.title, type: a.type, levelName: levels.find((l) => l.id === a.levelId)?.name, subjectName: subjects.find((s) => s.id === a.subjectId)?.name, authorName: a.authorName, count: a.questions?.length || 0, status: a.status, questions: a.questions || [], instructions: a.instructions, at: a.due, lessonTitle: lessons.find((l) => l.id === a.lessonId)?.title }))
  ])
}

/** GET /api/editor/stats → تقارير المحتوى */
export function contentStats() {
  return respond(() => {
    const by = (key, list = contents) => list.reduce((m, c) => ((m[c[key]] = (m[c[key]] || 0) + 1), m), {})
    const lvlRows = levels.filter((l) => contents.some((c) => c.levelId === l.id)).map((l) => {
      const ls = lessons.filter((x) => x.levelId === l.id)
      const withEnrich = ls.filter((x) => contents.some((c) => c.lessonId === x.id && c.classification === 'enrichment' && c.status === 'approved')).length
      return { label: l.name, lessons: ls.length, enrich: Math.round((withEnrich / Math.max(1, ls.length)) * 100), items: contents.filter((c) => c.levelId === l.id).length }
    })
    const decorate = (c) => ({ id: c.id, title: c.title, views: c.views, rating: Math.round(c.rating * 10) / 10, ...meta(c) })
    return {
      total: contents.length,
      activities: activities.length,
      byStatus: by('status'),
      byType: by('type'),
      levels: lvlRows,
      topViewed: contents.slice().sort((a, b) => b.views - a.views).slice(0, 8).map(decorate),
      lowRated: contents.filter((c) => c.status === 'approved').sort((a, b) => a.rating - b.rating).slice(0, 8).map(decorate),
      authors: Object.entries(by('authorName')).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8)
    }
  })
}
