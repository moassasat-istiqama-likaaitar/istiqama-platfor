import { respond } from './client'
import { notifications } from '@/mock/db'
import { myNoticesSync, markNoticeRead } from './school'

/**
 * الإشعارات (الجرس). الإعلان يصل إشعاراً هنا وفي صفحة «الإعلانات»، ولا يدخل صندوق الرسائل (لا رد عليه).
 * إشعار الإعلان معرّفه nt:<معرّف الإعلان>، ويفتح الإعلان في صفحة الإعلانات.
 */
const noticeItems = (personId) => myNoticesSync(personId).map((n) => ({
  id: `nt:${n.id}`, personId, assignmentId: null, type: 'announcement', title: `إعلان: ${n.title}`, body: `${n.from} · ${n.body.slice(0, 90)}`, read: n.read, at: n.at, link: { name: 'notices', query: { id: n.id } }
}))

/** GET /api/notifications → قائمة إشعارات الشخص (كل أدواره)، الأحدث أولاً */
export function list(personId) {
  return respond(() =>
    [...notifications.filter((n) => n.personId === personId), ...noticeItems(personId)].sort((a, b) => b.at.localeCompare(a.at))
  )
}

/** POST /api/notifications/{id}/read */
export function markRead(id, personId) {
  return respond(() => {
    if (String(id).startsWith('nt:')) markNoticeRead(id.slice(3), personId)
    const n = notifications.find((x) => x.id === id)
    if (n) n.read = true
    return { ok: true }
  }, 80)
}

/** POST /api/notifications/read-all */
export function markAllRead(personId) {
  return respond(() => {
    notifications.filter((n) => n.personId === personId).forEach((n) => (n.read = true))
    myNoticesSync(personId).forEach((n) => markNoticeRead(n.id, personId))
    return { ok: true }
  }, 120)
}
