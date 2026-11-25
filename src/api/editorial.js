import { respond, ApiError } from './client'
import { levels } from '@/mock/db'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { collection } from '@/mock/collections'
import { uploads, teacherActs, normUpload } from './bank'

/**
 * التحرير والمراجعة: طابور المراجعة (محتوى المكتبة + مقترحات المعلمين)، الأنشطة، تقارير المحتوى.
 * قرارات المراجعة: approved (معتمد) | temp (معتمد مؤقتاً) | rejected (مرفوض بملاحظة) | draft (طلب تعديل)
 */
const reviewLog = collection('reviewLog', [])

const meta = (c) => ({
  subjectName: subjects.find((s) => s.id === c.subjectId)?.name || c.subjectName,
  levelName: levels.find((l) => l.id === c.levelId)?.name,
  lessonTitle: lessons.find((l) => l.id === c.lessonId)?.title || ''
})
const STATUS_TAG = { review: 'review', temp: 'temp', pending: 'review' }

/**
 * GET /api/editor/queue?levels=&subjects= → ما ينتظر قرار المحرر:
 *  ما رفعه المعلمون (قيد المراجعة أو معتمد مؤقتاً من المدير) + محتوى المكتبة قيد المراجعة.
 *  المسودات لا تصل المحرر (تبقى عند المعلم حتى يرسلها).
 */
export function reviewQueue(scope = {}) {
  return respond(() => {
    const inScope = (x) => (!scope.levels?.length || scope.levels.includes(x.levelId)) && (!scope.subjects?.length || scope.subjects.includes(subjects.find((s) => s.id === x.subjectId)?.name || x.subjectName))
    const props = uploads().all().filter((u) => ['review', 'temp'].includes(u.status)).map((u) => ({
      id: u.id, kind: 'upload', origin: u.status === 'temp' ? 'صادق عليه المدير' : 'مقترح معلم', title: u.title, type: u.type, proposedClass: u.proposedClass, authorName: u.authorName,
      at: u.at, status: STATUS_TAG[u.status], levelId: u.levelId, subjectId: u.subjectId, lessonId: u.lessonId, ...meta(u), payload: normUpload(u).payload
    }))
    const acts = teacherActs().all().filter((a) => ['review', 'temp'].includes(a.status)).map((a) => ({
      id: a.id, kind: 'activity', origin: a.status === 'temp' ? 'صادق عليه المدير' : 'نشاط معلم', title: a.title, type: a.kind === 'quiz' ? 'quiz' : 'homework', proposedClass: 'activity', authorName: a.authorName,
      at: a.at, status: STATUS_TAG[a.status], levelId: a.levelId, subjectId: a.subjectId, lessonId: a.lessonId, ...meta(a), questions: a.questions, instructions: a.instructions
    }))
    const lib = contents.filter((c) => ['pending', 'temp'].includes(c.status)).map((c) => ({
      id: c.id, kind: 'content', origin: 'المكتبة', title: c.title, type: c.type, proposedClass: c.classification, authorName: c.authorName, at: c.createdAt,
      status: 'review', levelId: c.levelId, subjectId: c.subjectId, lessonId: c.lessonId, ...meta(c), payload: c.payload
    }))
    return [...props, ...acts, ...lib].filter(inScope).sort((a, b) => (b.at || '').localeCompare(a.at || ''))
  })
}

/** GET /api/editor/review/out-of-scope → كم عنصراً ينتظر خارج نطاق هذا المحرر (عند محررين آخرين) */
export function outOfScopeCount(scope = {}) {
  return respond(() => {
    const inScope = (x) => (!scope.levels?.length || scope.levels.includes(x.levelId)) && (!scope.subjects?.length || scope.subjects.includes(subjects.find((s) => s.id === x.subjectId)?.name || x.subjectName))
    return [...uploads().all(), ...teacherActs().all()].filter((x) => ['review', 'temp'].includes(x.status) && !inScope(x)).length
  })
}

/**
 * POST /api/editor/review/:id { decision: approved|edit|rejected, note, classification, essential }
 *  edit = طلب تعديل: يعود مسودة عند المعلم مع الملاحظة. الملاحظة إجبارية للرفض ولطلب التعديل.
 */
export function decide(item, decision, { note = '', classification = null, essential = false } = {}) {
  return respond(() => {
    if (['rejected', 'edit'].includes(decision) && !note.trim()) throw new ApiError('required', decision === 'edit' ? 'اكتب ما يجب تعديله' : 'اكتب سبب الرفض ليعرف صاحب المحتوى')
    const status = decision === 'edit' ? 'draft' : decision
    if (item.kind === 'content') {
      const c = contents.find((x) => x.id === item.id)
      c.status = decision === 'edit' ? 'draft' : decision
      if (classification) c.classification = classification
    } else if (item.kind === 'upload') {
      uploads().update(item.id, { status, note, classification: decision === 'approved' ? classification || item.proposedClass : null, essential: decision === 'approved' && essential, decidedAt: new Date().toISOString() })
    } else {
      teacherActs().update(item.id, { status, note, decidedAt: new Date().toISOString() })
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
    ...teacherActs().all().map((a) => ({ id: a.id, title: a.title, type: a.kind === 'quiz' ? 'quiz' : 'homework', levelName: levels.find((l) => l.id === (a.levelId || ''))?.name || '—', subjectName: subjects.find((s) => s.id === a.subjectId)?.name || '—', authorName: a.authorName, count: a.questions?.length || 0, status: a.status === 'published' ? 'approved' : a.status, questions: a.questions || [], at: a.at })),
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
