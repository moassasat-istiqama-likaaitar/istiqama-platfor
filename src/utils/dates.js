/**
 * التاريخ الهجري والميلادي (متطلب في دفتر الشروط).
 * الأرقام لاتينية (1، 2، 3) كما هو معتاد في الجزائر، وأسماء الأشهر الميلادية جزائرية (جانفي، فيفري...).
 */

const intlLocale = (code) => ({ ar: 'ar-DZ', fr: 'fr-DZ', en: 'en-GB' })[code] || 'ar-DZ'

export function gregorian(date = new Date(), code = 'ar', opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(`${intlLocale(code)}-u-nu-latn`, opts).format(new Date(date))
}

export function hijri(date = new Date(), code = 'ar') {
  const base = code === 'ar' ? 'ar' : code === 'fr' ? 'fr' : 'en'
  try {
    return new Intl.DateTimeFormat(`${base}-u-ca-islamic-umalqura-nu-latn`, {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(date))
  } catch {
    return ''
  }
}

export function weekday(date = new Date(), code = 'ar') {
  return new Intl.DateTimeFormat(`${intlLocale(code)}-u-nu-latn`, { weekday: 'long' }).format(new Date(date))
}

export function timeOf(date, code = 'ar') {
  return new Intl.DateTimeFormat(`${intlLocale(code)}-u-nu-latn`, { hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

/** "منذ 5 د" — يحتاج دالة الترجمة t */
export function timeAgo(date, t) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return t('time.now')
  if (min < 60) return t('time.minutes', { n: min })
  const h = Math.floor(min / 60)
  if (h < 24) return t('time.hours', { n: h })
  return t('time.days', { n: Math.floor(h / 24) })
}
