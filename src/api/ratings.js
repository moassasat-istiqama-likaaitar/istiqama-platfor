import { respond } from './client'
import { collection } from '@/mock/collections'
import { contents, activities, subjects } from '@/mock/content'
import { assignments } from '@/mock/db'
import { uploads } from './bank'

/**
 * التقدير بالنجوم (1–5): التلميذ يقدّر استفادته من المحتوى، والمعلم يقدّر تصميم المحتوى أو الواجب/التقييم.
 * صف واحد لكل (عنصر، شخص). تُبنى منه تقارير التقديرات للمحرر والإدارة العامة.
 */
const seed = () => {
  const out = []
  const studs = assignments.filter((a) => a.role === 'student').slice(0, 400)
  const teachers = assignments.filter((a) => a.role === 'teacher')
  const items = [...contents.map((c) => ['content', c.id]), ...activities.map((a) => ['activity', a.id])]
  items.forEach(([kind, id], i) => {
    const n = kind === 'content' ? 4 + (i % 9) : 0
    for (let k = 0; k < n; k++) {
      const s = studs[(i * 13 + k * 7) % studs.length]
      out.push({ id: `${id}:${s.personId}`, itemId: id, kind, personId: s.personId, role: 'student', stars: 2 + ((i + k * 3) % 4), at: new Date(Date.now() - (k + 1) * 36e5 * 7).toISOString() })
    }
    for (let k = 0; k < 1 + (i % 3); k++) {
      const t = teachers[(i * 5 + k) % teachers.length]
      out.push({ id: `${id}:${t.personId}`, itemId: id, kind, personId: t.personId, role: 'teacher', stars: 3 + ((i + k) % 3), at: new Date(Date.now() - (k + 2) * 864e5).toISOString() })
    }
  })
  return out
}
const ratings = collection('ratings', seed)

export const myRating = (itemId, personId) => ratings.find(`${itemId}:${personId}`)?.stars || 0
/** POST /api/ratings { itemId, kind, stars } */
export function setRatingSync(itemId, kind, personId, role, stars) {
  const id = `${itemId}:${personId}`
  const row = { id, itemId, kind, personId, role, stars, at: new Date().toISOString() }
  return ratings.find(id) ? ratings.update(id, row) : ratings.insert(row)
}
export function rate(itemId, kind, personId, role, stars) {
  return respond(() => setRatingSync(itemId, kind, personId, role, stars), 100)
}

const itemMeta = (kind, id) => {
  if (kind === 'content') {
    const c = contents.find((x) => x.id === id) || uploads().find(id)
    return c && { title: c.title, subject: subjects.find((s) => s.id === c.subjectId)?.name, levelId: c.levelId, authorId: c.authorId, authorName: c.authorName }
  }
  const a = activities.find((x) => x.id === id)
  return a && { title: a.title, subject: subjects.find((s) => s.id === a.subjectId)?.name, levelId: a.levelId, authorId: a.authorId, authorName: a.authorName }
}
const avg = (xs) => (xs.length ? Math.round((xs.reduce((n, r) => n + r.stars, 0) / xs.length) * 10) / 10 : null)

/** GET /api/reports/ratings?levels= — تقرير التقديرات (المحرر: مستوياته · الإدارة العامة: الكل) */
export function ratingsReport({ levelIds = null } = {}) {
  return respond(() => {
    const by = {}
    ratings.all().forEach((r) => ((by[`${r.kind}|${r.itemId}`] ||= []).push(r)))
    const rows = Object.entries(by).map(([k, rs]) => {
      const [kind, id] = k.split('|')
      const m = itemMeta(kind, id)
      if (!m || (levelIds && !levelIds.includes(m.levelId))) return null
      const st = rs.filter((r) => r.role === 'student'), te = rs.filter((r) => r.role === 'teacher')
      return { id, kind, kindLabel: kind === 'content' ? 'محتوى' : 'واجب / تقييم', ...m, students: avg(st), studentsCount: st.length, teachers: avg(te), teachersCount: te.length, overall: avg(rs) }
    }).filter(Boolean)
    const all = ratings.all().filter((r) => rows.some((x) => x.id === r.itemId))
    return {
      totals: { items: rows.length, ratings: all.length, students: avg(all.filter((r) => r.role === 'student')), teachers: avg(all.filter((r) => r.role === 'teacher')) },
      rows: rows.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)),
      low: rows.filter((r) => r.overall !== null && r.overall < 3).sort((a, b) => a.overall - b.overall).slice(0, 10)
    }
  })
}
