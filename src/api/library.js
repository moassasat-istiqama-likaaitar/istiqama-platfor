import { respond, ApiError } from './client'
import { subjects, lessons, contents, activities } from '@/mock/content'
import { levels } from '@/mock/db'

const decorate = (c) => {
  const sub = subjects.find((s) => s.id === c.subjectId)
  const lesson = lessons.find((l) => l.id === c.lessonId)
  const level = levels.find((l) => l.id === c.levelId)
  return {
    ...c,
    subject: { id: sub.id, key: sub.key, name: sub.name, color: sub.color, accent: sub.accent, art: sub.art },
    lesson: { id: lesson.id, title: lesson.title },
    level: { id: level.id, name: level.name }
  }
}

/**
 * GET /api/library?level=&subject=&type=&classification=&status=&q=&author=
 * المكتبة المركزية: محتوى + أنشطة (Quiz وواجبات)
 */
export function list(filters = {}) {
  return respond(() => {
    const acts = activities.map((a) => ({
      id: a.id, lessonId: a.lessonId, subjectId: a.subjectId, levelId: a.levelId,
      type: a.type, classification: 'activity', status: a.status, title: a.title,
      keywords: [a.title], authorId: a.authorId, authorName: a.authorName,
      createdAt: contents.find((c) => c.lessonId === a.lessonId)?.createdAt || a.due, rating: 4.2, views: 0, payload: { questions: a.questions, instructions: a.instructions }
    }))
    const q = (filters.q || '').trim()
    return [...contents, ...acts]
      .filter((c) => !filters.level || c.levelId === filters.level)
      .filter((c) => !filters.subjectKey || subjects.find((s) => s.id === c.subjectId)?.name === filters.subjectKey)
      .filter((c) => !filters.type || c.type === filters.type)
      .filter((c) => !filters.classification || c.classification === filters.classification)
      .filter((c) => !filters.status || c.status === filters.status)
      .filter((c) => !filters.authorId || c.authorId === filters.authorId)
      .filter((c) => !q || c.title.includes(q) || c.keywords.some((k) => k.includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(decorate)
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
export function facets() {
  return respond(() => ({
    levels: levels.filter((l) => contents.some((c) => c.levelId === l.id)).map((l) => ({ id: l.id, name: l.name })),
    subjects: Array.from(new Set(subjects.map((s) => s.name))),
    stats: {
      total: contents.length + activities.length,
      videos: contents.filter((c) => c.type === 'video').length,
      pending: contents.filter((c) => c.status === 'pending').length
    }
  }), 50)
}
