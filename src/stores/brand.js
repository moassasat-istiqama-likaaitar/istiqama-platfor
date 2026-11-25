import { defineStore } from 'pinia'
import { getBranding } from '@/api/branding'
import { inkOn } from '@/utils/color'

/**
 * هوية المدرسة الحالية (الشعار + اللونان + الغلاف).
 * تُحدَّد المدرسة من الصفة النشطة:
 *  - التلميذ / المعلم / مدير المدرسة: مدرسة الصفة (المعلم في مدرستين ← المدرسة التي يعمل فيها لحظتها)
 *  - الولي: مدرسة الابن المعروض (childId)
 *  - الإدارة العامة: هوية المؤسسة فقط
 * الألوان تُطبَّق كمتغيرات --school-* تستعملها مساحات محددة فقط، فلا تمس ثيم الطور.
 */
export const useBrandStore = defineStore('brand', {
  state: () => ({ schoolId: null, school: null, branding: null, request: null, childId: null }),
  actions: {
    contextSchoolId(active) {
      if (!active) return null
      if (active.role === 'parent') {
        const kids = active.children || []
        const kid = kids.find((c) => c.id === this.childId) || kids[0]
        return kid?.schoolId || null
      }
      return active.school?.id || null
    },
    async sync(active) {
      const id = this.contextSchoolId(active)
      if (id === this.schoolId && this.branding) return
      this.schoolId = id
      if (!id) return this.clear()
      const res = await getBranding(id)
      if (this.schoolId !== id) return
      this.school = res.school
      this.branding = res.branding
      this.request = res.request
      this.apply()
    },
    async reload() {
      const id = this.schoolId
      this.schoolId = null
      this.branding = null
      if (id) {
        this.schoolId = id
        const res = await getBranding(id)
        Object.assign(this, { school: res.school, branding: res.branding, request: res.request })
        this.apply()
      }
    },
    setChild(childId, active) {
      this.childId = childId
      return this.sync(active)
    },
    apply(b = this.branding) {
      const root = document.documentElement.style
      if (!b) {
        ;['--school-1', '--school-2', '--school-1-ink', '--school-2-ink'].forEach((v) => root.removeProperty(v))
        return
      }
      root.setProperty('--school-1', b.primary)
      root.setProperty('--school-2', b.secondary)
      root.setProperty('--school-1-ink', inkOn(b.primary))
      root.setProperty('--school-2-ink', inkOn(b.secondary))
    },
    clear() {
      this.school = null
      this.branding = null
      this.request = null
      this.apply(null)
    }
  }
})
