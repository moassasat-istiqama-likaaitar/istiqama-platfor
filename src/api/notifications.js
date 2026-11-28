import { respond } from './client'
import { notifications } from '@/mock/db'
import { markNoticeRead } from './school'

/**
 * الإشعارات (الجرس): آلية فقط (درس، واجب، نتيجة، تسليم...).
 * الإعلانات (يكتبها شخص: المدير أو الإدارة العامة) لها رمز مستقل بجانب الجرس وصفحة «الإعلانات»، ولا تدخل صندوق الرسائل.
 */

/** GET /api/notifications → قائمة إشعارات الشخص (كل أدواره)، الأحدث أولاً */
export function list(personId) {
  return respond(() =>
    notifications.filter((n) => n.personId === personId).sort((a, b) => b.at.localeCompare(a.at))
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
    return { ok: true }
  }, 120)
}
