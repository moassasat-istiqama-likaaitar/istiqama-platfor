import { respond } from './client'
import { notifications } from '@/mock/db'

/** GET /api/notifications → قائمة إشعارات الشخص (كل أدواره)، الأحدث أولاً */
export function list(personId) {
  return respond(() =>
    notifications.filter((n) => n.personId === personId).sort((a, b) => b.at.localeCompare(a.at))
  )
}

/** POST /api/notifications/{id}/read */
export function markRead(id) {
  return respond(() => {
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
