import { defineStore } from 'pinia'
import { getPlatformSync } from '@/api/admin'

/** إعدادات المنصة العامة (الاسم، الشعار…) — يعدّلها المدير العام من «تخصيص المنصة» */
export const usePlatformStore = defineStore('platform', {
  state: () => ({ ...getPlatformSync() }),
  actions: {
    set(p) {
      Object.assign(this, p)
    }
  }
})
