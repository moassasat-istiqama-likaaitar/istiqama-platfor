/**
 * مجموعات بيانات تجريبية محفوظة في المتصفح (للكيانات الجديدة: إعلانات، بلاغات دعم، طلبات مراجعة...).
 * كل مجموعة = جدول في قاعدة البيانات لاحقاً.
 */
import { storage } from '@/utils/storage'

const cache = {}

export function collection(name, seed = []) {
  if (!cache[name]) {
    const key = `ist.col.${name}.v1`
    let rows = storage.get(key)
    if (!rows) {
      rows = typeof seed === 'function' ? seed() : seed
      storage.set(key, rows)
    }
    cache[name] = { key, rows }
  }
  const c = cache[name]
  const save = () => storage.set(c.key, c.rows)
  return {
    all: () => c.rows,
    find: (id) => c.rows.find((r) => r.id === id),
    insert(row) {
      c.rows.unshift(row)
      save()
      return row
    },
    update(id, patch) {
      const r = c.rows.find((x) => x.id === id)
      if (r) Object.assign(r, patch)
      save()
      return r
    },
    remove(id) {
      const i = c.rows.findIndex((x) => x.id === id)
      if (i >= 0) c.rows.splice(i, 1)
      save()
    },
    replace(rows) {
      c.rows.splice(0, c.rows.length, ...rows)
      save()
    },
    save
  }
}
