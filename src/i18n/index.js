import { createI18n } from 'vue-i18n'
import ar from './locales/ar'
import fr from './locales/fr'
import en from './locales/en'
import { storage } from '@/utils/storage'

export const LOCALES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' }
]

const saved = storage.get('ist.locale', 'ar')

const i18n = createI18n({
  legacy: false,
  locale: LOCALES.some((l) => l.code === saved) ? saved : 'ar',
  fallbackLocale: 'ar',
  messages: { ar, fr, en }
})

export function applyDirection(code) {
  const loc = LOCALES.find((l) => l.code === code) || LOCALES[0]
  document.documentElement.lang = loc.code
  document.documentElement.dir = loc.dir
}

applyDirection(i18n.global.locale.value)

export default i18n
