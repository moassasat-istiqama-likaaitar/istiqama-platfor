import { respond, newId, ApiError } from './client'
import { reports } from '@/mock/db'

/** GET /api/reports/mine → بلاغات ومقترحات الشخص */
export function listMine(personId) {
  return respond(() => reports.filter((r) => r.personId === personId).sort((a, b) => b.at.localeCompare(a.at)))
}

/** POST /api/reports  { type, title, description, assignmentId } → report */
export function create(personId, assignmentId, { type, title, description }) {
  return respond(() => {
    if (!type || !title?.trim() || !description?.trim()) throw new ApiError('required', 'املأ كل الحقول المطلوبة')
    const r = { id: newId('r'), personId, assignmentId, type, title: title.trim(), description: description.trim(), status: 'new', at: new Date().toISOString() }
    reports.push(r)
    return r
  }, 400)
}
