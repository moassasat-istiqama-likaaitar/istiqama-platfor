/**
 * التأثيرات البصرية — تُضبط من «تخصيص المنصة» لكل ثيم من الثيمات الأربعة:
 * الإدارة والطاقم (staff)، الشباب (teens)، المستكشفون (juniors)، البراعم (kids).
 * تُطبَّق كخصائص data-fx-* على <html>، وتقرؤها src/styles/effects.css.
 */
export const FX_THEMES = [
  { key: 'staff', label: 'الإدارة والطاقم', icon: 'pi pi-briefcase' },
  { key: 'teens', label: 'الشباب', icon: 'pi pi-bolt' },
  { key: 'juniors', label: 'المستكشفون', icon: 'pi pi-compass' },
  { key: 'kids', label: 'البراعم', icon: 'pi pi-star' }
]
export const FX_OPTIONS = {
  glass: { label: 'الزجاج (Glass)', hint: 'بطاقات شفافة ضبابية فوق خلفية ملوّنة', type: 'toggle' },
  background: { label: 'الخلفية', hint: '', options: [{ value: 'plain', label: 'سادة' }, { value: 'gradient', label: 'تدرّج ناعم' }, { value: 'pattern', label: 'زخرفة خفيفة' }] },
  motion: { label: 'الحركة', hint: 'تُلغى تلقائياً لمن فعّل «تقليل الحركة» في جهازه', options: [{ value: 'none', label: 'بلا حركة' }, { value: 'subtle', label: 'هادئة' }, { value: 'lively', label: 'حيوية' }] },
  depth: { label: 'العمق', hint: '', options: [{ value: 'flat', label: 'مسطّح' }, { value: 'soft', label: 'ظلال ناعمة' }] },
  radius: { label: 'الحواف', hint: '', options: [{ value: 'normal', label: 'عادية' }, { value: 'soft', label: 'مستديرة' }] }
}
export const DEFAULT_EFFECTS = {
  staff: { glass: false, background: 'gradient', motion: 'subtle', depth: 'soft', radius: 'normal' },
  teens: { glass: true, background: 'gradient', motion: 'subtle', depth: 'soft', radius: 'normal' },
  juniors: { glass: true, background: 'gradient', motion: 'lively', depth: 'soft', radius: 'soft' },
  kids: { glass: false, background: 'pattern', motion: 'lively', depth: 'soft', radius: 'soft' }
}
/** خصائص data-fx-* لثيم */
export const fxAttrs = (fx) => ({ 'data-fx-glass': fx.glass ? 'on' : 'off', 'data-fx-bg': fx.background, 'data-fx-motion': fx.motion, 'data-fx-depth': fx.depth, 'data-fx-radius': fx.radius })
export function applyEffects(effects, themeKey) {
  const fx = { ...DEFAULT_EFFECTS[themeKey] || DEFAULT_EFFECTS.staff, ...(effects?.[themeKey] || {}) }
  const el = document.documentElement
  Object.entries(fxAttrs(fx)).forEach(([k, v]) => el.setAttribute(k, v))
}
