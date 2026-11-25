import Aura from '@primeuix/themes/aura'
import { definePreset, updatePrimaryPalette, palette } from '@primeuix/themes'

/**
 * الثيمات الأربعة حسب دفتر الشروط:
 *  - primary   : الطور الابتدائي (ألوان دافئة ومرحة)
 *  - middle    : الطور المتوسط
 *  - secondary : الطور الثانوي
 *  - staff     : الطاقم التربوي والإداري والأولياء
 * الألوان مبدئية وتُضبط نهائياً في مرحلة الهوية البصرية.
 */
export const THEMES = {
  staff: { color: '#0f766e', labelKey: 'themes.staff' },
  primary: { color: '#f97316', labelKey: 'themes.primary' },
  middle: { color: '#2563eb', labelKey: 'themes.middle' },
  secondary: { color: '#7c3aed', labelKey: 'themes.secondary' }
}

export const IstiqamaPreset = definePreset(Aura, {
  semantic: {
    primary: palette(THEMES.staff.color)
  }
})

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.staff
  updatePrimaryPalette(palette(theme.color))
  document.documentElement.dataset.theme = themeKey
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme.color)
}
