import Aura from '@primeuix/themes/aura'
import { definePreset, updatePrimaryPalette, palette } from '@primeuix/themes'

/**
 * أربعة ثيمات:
 *  kids    — البراعم: من الأولى إلى الثالثة ابتدائي (مرح، ألوان مشمسة، خط مستدير)
 *  juniors — المستكشفون: الرابعة والخامسة ابتدائي والأولى متوسط (حيوي، مغامرة)
 *  teens   — الشباب: من الثانية متوسط إلى الثالثة ثانوي (عصري وهادئ، غير جاف)
 *  staff   — الطاقم: الإدارة والمعلمون والأولياء
 */
export const THEMES = {
  staff: { color: '#3159e8', labelKey: 'themes.staff' },
  kids: { color: '#ff6b4a', labelKey: 'themes.kids' },
  juniors: { color: '#0a9bdc', labelKey: 'themes.juniors' },
  teens: { color: '#6550e0', labelKey: 'themes.teens' }
}

/** الثيم حسب ترتيب المستوى (1 = الأولى ابتدائي ... 12 = الثالثة ثانوي) */
export function themeForLevelOrder(order) {
  if (!order) return 'staff'
  if (order <= 3) return 'kids'
  if (order <= 6) return 'juniors'
  return 'teens'
}

export const IstiqamaPreset = definePreset(Aura, {
  semantic: { primary: palette(THEMES.staff.color) }
})

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.staff
  updatePrimaryPalette(palette(theme.color))
  document.documentElement.dataset.theme = themeKey in THEMES ? themeKey : 'staff'
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme.color)
}
