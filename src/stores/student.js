import { defineStore } from 'pinia'
import * as learning from '@/api/learning'
import { useAuthStore } from './auth'
import { celebrate, chime } from '@/utils/celebrate'

/** حالة التلميذ المشتركة: النقاط والمواظبة + نافذة الاحتفال */
export const useStudentStore = defineStore('student', {
  state: () => ({
    stars: 0,
    streak: 0,
    celebration: null // { gained, badges, title }
  }),
  getters: {
    levelId: () => useAuthStore().active?.level?.id,
    personId: () => useAuthStore().person?.id,
    theme: () => useAuthStore().themeKey
  },
  actions: {
    async refresh() {
      if (!this.levelId) return
      const d = await learning.dashboard(this.personId, this.levelId)
      this.stars = d.stars
      this.streak = d.streak
      return d
    },
    /** يُستدعى بعد أي إنجاز يمنح نقاطاً */
    reward({ gained = 0, stars, badges = [] }, title) {
      if (typeof stars === 'number') this.stars = stars
      if (!gained && !badges.length) return
      celebrate(this.theme)
      chime('success', this.theme)
      this.celebration = { gained, badges, title }
    },
    closeCelebration() {
      this.celebration = null
    }
  }
})
