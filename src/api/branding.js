import { respond, ApiError, newId } from './client'
import { schools, schoolBranding, persons } from '@/mock/db'
import { storage } from '@/utils/storage'

/**
 * هوية المدارس (الشعار، اللونان، الغلاف، رسالة الترحيب).
 *
 * دورة العمل:
 *  1) مدير المدرسة يعدّل ويرسل طلباً  → الحالة pending (الهوية المعتمدة لا تتغير بعد)
 *  2) المدير العام (super_admin) يعتمد → تصبح الهوية الجديدة ظاهرة للجميع
 *     أو يرفض مع ملاحظة                → يرى المدير الملاحظة ويعدّل
 *  المشرف العام (admin) يطّلع على الطلبات دون صلاحية الاعتماد.
 */

const KEY = 'ist.branding.v1'

const SEED_REQUESTS = [
  {
    id: 'br-seed1',
    schoolId: 's2',
    status: 'pending',
    submittedAt: new Date(Date.now() - 864e5 * 2).toISOString(),
    submittedBy: 'مدير مدرسة الفتح',
    note: '',
    data: { logo: null, primary: '#6d2c91', secondary: '#f7b538', cover: 'pattern:dunes', welcome: 'مرحباً بكم في مدرسة الفتح… خطوة نحو التميّز.' }
  }
]

function db() {
  const saved = storage.get(KEY)
  if (saved) return saved
  const fresh = { approved: JSON.parse(JSON.stringify(schoolBranding)), requests: SEED_REQUESTS }
  storage.set(KEY, fresh)
  return fresh
}
const save = (d) => storage.set(KEY, d)

const schoolInfo = (s) => ({ id: s.id, slug: s.slug, name: s.name, commune: s.commune, wilaya: s.wilaya })

function view(d, schoolId) {
  const s = schools.find((x) => x.id === schoolId)
  if (!s) throw new ApiError('not_found', 'المدرسة غير موجودة')
  const request = d.requests.filter((r) => r.schoolId === schoolId && r.status !== 'approved').sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] || null
  return { school: schoolInfo(s), branding: d.approved[schoolId], request }
}

/** GET /api/schools/:id/branding → { school, branding, request } */
export function getBranding(schoolId) {
  return respond(() => view(db(), schoolId), 60)
}

/** GET /api/public/schools/:slug → { school, branding } (عام، لصفحة دخول المدرسة) */
export function getBySlug(slug) {
  return respond(() => {
    const s = schools.find((x) => x.slug === slug)
    if (!s) throw new ApiError('not_found', 'رابط المدرسة غير صحيح')
    return { school: schoolInfo(s), branding: db().approved[s.id] }
  }, 80)
}

/** GET /api/public/schools → [{ school, branding }] */
export function listSchools() {
  return respond(() => {
    const d = db()
    return schools.map((s) => ({ school: schoolInfo(s), branding: d.approved[s.id] }))
  }, 60)
}

/** POST /api/schools/:id/branding-requests { data } → الطلب الجديد (يلغي أي طلب معلّق سابق) */
export function submitRequest(schoolId, data, personId) {
  return respond(() => {
    const d = db()
    d.requests = d.requests.filter((r) => !(r.schoolId === schoolId && r.status !== 'approved'))
    const p = persons.find((x) => x.id === personId)
    const req = {
      id: newId('br'),
      schoolId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: p ? `${p.firstName} ${p.lastName}` : '—',
      note: '',
      data
    }
    d.requests.push(req)
    save(d)
    return view(d, schoolId)
  }, 400)
}

/** DELETE /api/branding-requests/:id (سحب الطلب من طرف المدير) */
export function cancelRequest(id) {
  return respond(() => {
    const d = db()
    const r = d.requests.find((x) => x.id === id)
    if (!r) throw new ApiError('not_found', 'الطلب غير موجود')
    d.requests = d.requests.filter((x) => x.id !== id)
    save(d)
    return view(d, r.schoolId)
  })
}

/** GET /api/branding-requests?status= → قائمة الطلبات مع الهوية الحالية للمقارنة */
export function listRequests() {
  return respond(() => {
    const d = db()
    return d.requests
      .slice()
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map((r) => ({ ...r, school: schoolInfo(schools.find((s) => s.id === r.schoolId)), current: d.approved[r.schoolId] }))
  })
}

/** POST /api/branding-requests/:id/approve (المدير العام فقط) */
export function approveRequest(id, role) {
  return respond(() => {
    if (role !== 'super_admin') throw new ApiError('forbidden', 'الاعتماد من صلاحية المدير العام')
    const d = db()
    const r = d.requests.find((x) => x.id === id)
    if (!r) throw new ApiError('not_found', 'الطلب غير موجود')
    d.approved[r.schoolId] = { ...r.data }
    r.status = 'approved'
    r.decidedAt = new Date().toISOString()
    save(d)
    return true
  }, 400)
}

/** POST /api/branding-requests/:id/reject { note } (المدير العام فقط) */
export function rejectRequest(id, note, role) {
  return respond(() => {
    if (role !== 'super_admin') throw new ApiError('forbidden', 'الرفض من صلاحية المدير العام')
    if (!String(note || '').trim()) throw new ApiError('required', 'اكتب سبب الرفض ليعرف المدير ما يعدّله')
    const d = db()
    const r = d.requests.find((x) => x.id === id)
    if (!r) throw new ApiError('not_found', 'الطلب غير موجود')
    r.status = 'rejected'
    r.note = note.trim()
    r.decidedAt = new Date().toISOString()
    save(d)
    return true
  }, 400)
}
