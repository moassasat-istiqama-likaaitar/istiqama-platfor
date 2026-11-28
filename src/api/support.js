import { respond, ApiError, newId } from './client'
import { reports, persons, assignments, schools } from '@/mock/db'
import { collection } from '@/mock/collections'
import { fullName, personOf } from './people'

/**
 * الدعم الفني: البلاغات (تذاكر بمحادثة)، الحوادث العامة، فريق الدعم.
 * البلاغات التي يرسلها المستخدمون من «البلاغات والمقترحات» (F08) تصل هنا.
 */
const PRIORITY = { technical: 'high', content: 'normal', suggestion: 'low', account: 'high' }
const tickets = collection('tickets', () => {
  const base = reports.map((r, i) => ({
    id: 'T-' + (1040 + i), personId: r.personId, title: r.title, description: r.description, type: r.type, status: r.status === 'done' ? 'resolved' : r.status === 'new' ? 'open' : r.status,
    priority: PRIORITY[r.type] || 'normal', assignee: i % 2 ? 'سليمان أولاد سعيد' : null, at: r.at,
    thread: [{ from: 'user', name: fullName(personOf(r.personId)), body: r.description, at: r.at }]
  }))
  const more = [
    ['لا أستطيع الدخول بحساب ابني', 'account', 'open', 'high'], ['الصوت غير واضح في فيديو التجويد', 'content', 'in_progress', 'normal'], ['اقتراح: تحميل الدروس للمشاهدة دون إنترنت', 'suggestion', 'open', 'low'],
    ['خطأ في علامة تقييم الفقه', 'content', 'waiting', 'normal'], ['التطبيق بطيء مساءً', 'technical', 'in_progress', 'high'], ['تغيير رقم هاتف الولي', 'account', 'resolved', 'low']
  ].map(([title, type, status, priority], i) => {
    const p = persons.filter((x) => x.generated)[i * 17 + 3]
    const at = new Date(Date.now() - (i + 1) * 5 * 36e5).toISOString()
    return { id: 'T-' + (1050 + i), personId: p.id, title, description: title + ' — يرجى المساعدة.', type, status, priority, assignee: status === 'open' ? null : 'سليمان أولاد سعيد', at, thread: [{ from: 'user', name: fullName(p), body: title + ' — يرجى المساعدة.', at }] }
  })
  return [...more, ...base]
})
const incidents = collection('incidents', () => [
  { id: 'INC-12', title: 'بطء في تشغيل الفيديوهات', severity: 'major', status: 'monitoring', affected: 'كل المدارس', started: new Date(Date.now() - 20 * 36e5).toISOString(), updates: [{ at: new Date(Date.now() - 20 * 36e5).toISOString(), text: 'رُصد بطء في خادم الفيديو.' }, { at: new Date(Date.now() - 16 * 36e5).toISOString(), text: 'تم تحويل الحمل إلى خادم احتياطي؛ المراقبة مستمرة.' }] },
  { id: 'INC-11', title: 'تعذّر إرسال رسائل SMS', severity: 'minor', status: 'resolved', affected: 'إشعارات الأولياء', started: new Date(Date.now() - 6 * 864e5).toISOString(), updates: [{ at: new Date(Date.now() - 6 * 864e5).toISOString(), text: 'مزوّد الرسائل متوقف.' }, { at: new Date(Date.now() - 5.8 * 864e5).toISOString(), text: 'عادت الخدمة.' }] }
])
const team = collection('supportTeam', () => [
  { id: 'st1', name: 'سليمان أولاد سعيد', role: 'مسؤول الدعم', scope: 'كل المدارس', phone: '0550 00 00 12', status: 'online', open: 4, resolved: 38 },
  { id: 'st2', name: 'حمزة قاسمي', role: 'دعم تقني', scope: 'مدارس الجزائر العاصمة', phone: '0550 00 00 21', status: 'online', open: 2, resolved: 24 },
  { id: 'st3', name: 'سمية شريفي', role: 'دعم المحتوى', scope: 'المكتبة المركزية', phone: '0550 00 00 22', status: 'away', open: 1, resolved: 19 },
  { id: 'st4', name: 'بلال بوزيد', role: 'دعم الحسابات', scope: 'التفعيل وكلمات المرور', phone: '0550 00 00 23', status: 'offline', open: 0, resolved: 31 }
])

const view = (t) => {
  const p = personOf(t.personId)
  const a = assignments.find((x) => x.personId === t.personId)
  return { ...t, person: fullName(p), role: a?.role, school: schools.find((s) => s.id === a?.schoolId)?.short || '—', replies: t.thread.length - 1 }
}
/**
 * من يرى أي بلاغ:
 *  الدعم الفني ← الملاحظات التقنية ومشاكل الحسابات فقط · المحرر ← بلاغات المحتوى
 *  الإدارة العامة ← الكل، ومنها المقترحات (لا يراها غيرها).
 */
export const TICKET_SCOPE = { support: ['technical', 'account'], editor: ['content'] }
export function listTickets(role = null) {
  return respond(() => tickets.all().filter((t) => !role || ['super_admin', 'admin'].includes(role) || (TICKET_SCOPE[role] || []).includes(t.type)).map(view))
}
export function getTicket(id) {
  return respond(() => view(tickets.find(id)))
}
export function replyTicket(id, author, body, status) {
  return respond(() => {
    const t = tickets.find(id)
    if (!t) throw new ApiError('not_found', 'البلاغ غير موجود')
    if (body?.trim()) t.thread.push({ from: 'support', name: fullName(author), body: body.trim(), at: new Date().toISOString() })
    if (status) t.status = status
    if (!t.assignee) t.assignee = fullName(author)
    tickets.save()
    return view(t)
  }, 300)
}
export function updateTicket(id, patch) {
  return respond(() => view(tickets.update(id, patch)))
}
export function listIncidents() {
  return respond(() => incidents.all())
}
export function saveIncident(data) {
  return respond(() => {
    if (data.id && incidents.find(data.id)) return incidents.update(data.id, data)
    return incidents.insert({ id: 'INC-' + (13 + incidents.all().length), started: new Date().toISOString(), updates: [{ at: new Date().toISOString(), text: data.note || 'فُتح الحادث.' }], ...data })
  })
}
export function addIncidentUpdate(id, text, status) {
  return respond(() => {
    const i = incidents.find(id)
    i.updates.push({ at: new Date().toISOString(), text })
    if (status) i.status = status
    incidents.save()
    return i
  })
}
export function listTeam() {
  return respond(() => team.all())
}
export function saveMember(data) {
  return respond(() => (data.id && team.find(data.id) ? team.update(data.id, data) : team.insert({ ...data, id: newId('st'), open: 0, resolved: 0, status: 'offline' })))
}
