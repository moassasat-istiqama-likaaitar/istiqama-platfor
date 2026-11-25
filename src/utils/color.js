// أدوات الألوان: التباين (معيار WCAG) واختيار لون نص مقروء فوق لون المدرسة

function rgb(hex) {
  const h = String(hex || '').replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0')
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0)
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** نسبة التباين بين لونين (1 إلى 21). 4.5 فما فوق = نص مقروء */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return Math.round(((x + 0.05) / (y + 0.05)) * 10) / 10
}

/** لون النص المناسب فوق خلفية معيّنة */
export function inkOn(bg) {
  return contrast(bg, '#ffffff') >= 3 ? '#ffffff' : '#1a1f36'
}

export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''))
