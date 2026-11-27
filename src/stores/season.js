import { defineStore } from 'pinia'
import { activeSeason, editableSeasons, logSeasonEdit } from '@/api/admin'
import { fullName } from '@/api/people'
import { useAuthStore } from './auth'

/**
 * سياق الموسم المعروض. الافتراضي دائماً الموسم النشط؛ ولا يتغير إلا لمن له حق التعديل في موسم مفتوح مؤقتاً
 * (الإدارة العامة، أو المدير/المعلمون المحدَّدون في إعادة الفتح). يعود تلقائياً للنشط عند انتهاء مدة الفتح.
 * في النموذج تبقى الشاشات نفسها؛ الشركة تصفّي بياناتها بمعرّف الموسم (seasonId) المرسل مع كل طلب.
 */
export const useSeasonStore = defineStore('season', {
  state: () => ({ viewId: null, tick: 0 }),
  getters: {
    active: () => activeSeason(),
    editable() {
      void this.tick
      return editableSeasons(useAuthStore().active)
    },
    current() {
      return (this.viewId && this.editable.find((s) => s.id === this.viewId)) || null
    },
    // معرّف الموسم الذي تُرسله الشاشات إلى الخادم
    seasonId() {
      return this.current?.id || this.active?.id
    }
  },
  actions: {
    enter(id) {
      if (!id || id === this.active?.id) return this.leave()
      const s = this.editable.find((x) => x.id === id)
      if (!s) return
      this.viewId = id
      const auth = useAuthStore()
      logSeasonEdit(id, { by: fullName(auth.person), role: auth.active?.role, action: 'دخول للتصحيح' })
    },
    leave() {
      this.viewId = null
    },
    // يُستدعى دورياً: إن انتهى الفتح أو سُحبت الصلاحية يعود المستخدم للموسم النشط
    check() {
      this.tick++
      if (this.viewId && !this.current) {
        this.viewId = null
        return true
      }
      return false
    }
  }
})
