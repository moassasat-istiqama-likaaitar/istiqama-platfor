import { collection } from '@/mock/collections'
import { respond, ApiError } from './client'
import { subjects, lessons, contents } from '@/mock/content'
import { levels } from '@/mock/db'
import { uploads, normUpload } from './bank'

const decorate = (c) => {
  const sub = subjects.find((s) => s.id === c.subjectId)
  const lesson = lessons.find((l) => l.id === c.lessonId)
  const level = levels.find((l) => l.id === c.levelId)
  return {
    ...c,
    subject: sub ? { id: sub.id, key: sub.key, name: sub.name, color: sub.color, accent: sub.accent, art: sub.art } : { id: null, name: '—', color: '#3159e8', accent: '#ffc23c', art: 'book' },
    lesson: lesson ? { id: lesson.id, title: lesson.title, order: lesson.order, axis: lesson.axis, axisIndex: lesson.axisIndex } : { id: null, title: 'بلا درس', order: 999, axis: 'بلا درس', axisIndex: 999 },
    subjectOrder: sub?.order ?? 99,
    level: level ? { id: level.id, name: level.name } : { id: null, name: '—' }
  }
}

/**
 * GET /api/library?level=&subject=&type=&classification=&status=&q=&author=
 * المكتبة المركزية: المحتوى التعليمي فقط (الواجبات والتقييمات في «بنك الواجبات والتقييمات»).
 * المعلم يرى المعتمد فقط؛ المحرر والإدارة يرون كل الحالات (curator).
 * الترتيب: المستوى ← المادة ← المحور ← الدرس ← الرئيسي قبل الإثرائي.
 */
/* ما يُدرج في المكتبة لا يحذفه إلا الإشراف العام (حذف منطقي يُسجَّل) */
const removedCol = collection('libraryRemoved', [])
/** DELETE /api/library/{id} — الإدارة العامة وحدها */
export function removeFromLibrary(id, role, by) {
  return respond(() => {
    if (!['super_admin', 'admin'].includes(role)) throw new ApiError('forbidden', 'الحذف من المكتبة من صلاحية الإدارة العامة وحدها')
    removedCol.insert({ id, by, at: new Date().toISOString() })
    return true
  })
}

export function list(filters = {}, { curator = false } = {}) {
  return respond(() => {
    // ما رفعه المعلمون واعتمده المحرر أصبح جزءاً من المكتبة المركزية
    const fromTeachers = uploads().all().filter((u) => u.status === 'approved').map((u) => ({ ...normUpload(u), classification: u.classification || u.proposedClass }))
    const q = (filters.q || '').trim()
    const rank = { main: 0, enrichment: 1, activity: 2 }
    const lvl = (id) => levels.findIndex((l) => l.id === id)
    return [...fromTeachers, ...contents]
      .filter((c) => !removedCol.find(c.id))
      .filter((c) => curator || c.status === 'approved')
      .filter((c) => !filters.level || c.levelId === filters.level)
      .filter((c) => !filters.subjectKey || subjects.find((s) => s.id === c.subjectId)?.name === filters.subjectKey)
      .filter((c) => !filters.type || c.type === filters.type)
      .filter((c) => !filters.classification || c.classification === filters.classification)
      .filter((c) => !filters.status || c.status === filters.status)
      .filter((c) => !filters.authorId || c.authorId === filters.authorId)
      .filter((c) => !q || c.title.includes(q) || c.keywords?.some((k) => k.includes(q)))
      .map(decorate)
      .sort((a, b) => lvl(a.levelId) - lvl(b.levelId) || a.subjectOrder - b.subjectOrder || a.lesson.axisIndex - b.lesson.axisIndex || a.lesson.order - b.lesson.order || (rank[a.classification] ?? 1) - (rank[b.classification] ?? 1))
  }, 200)
}

/** GET /api/library/{id} */
export function get(id) {
  return respond(() => {
    const c = contents.find((x) => x.id === id)
    if (!c) throw new ApiError('not_found', 'المحتوى غير موجود')
    return decorate(c)
  })
}

/** GET /api/library/facets → قيم المرشحات */
export function facets({ curator = false } = {}) {
  return respond(() => ({
    levels: levels.filter((l) => contents.some((c) => c.levelId === l.id)).map((l) => ({ id: l.id, name: l.name })),
    subjects: Array.from(new Set(subjects.map((s) => s.name))),
    stats: {
      total: contents.filter((c) => curator || c.status === 'approved').length + uploads().all().filter((u) => u.status === 'approved').length,
      videos: contents.filter((c) => c.type === 'video' && (curator || c.status === 'approved')).length,
      pending: contents.filter((c) => c.status === 'pending').length
    }
  }), 50)
}
