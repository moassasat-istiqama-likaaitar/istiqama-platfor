/**
 * أغلفة جاهزة تُرسم بلوني المدرسة (بديل عن رفع صورة).
 * كل نمط دالة تُرجع SVG كاملاً (1200×360) يُستعمل خلفيةً بـ background-size: cover.
 */

const star8 = (cx, cy, r) => {
  const pts = []
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i
    const rr = i % 2 ? r * 0.55 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return `<polygon points="${pts.join(' ')}"/>`
}

export const COVER_PATTERNS = {
  arches: { label: 'أقواس', draw: (p, s) => {
    let g = ''
    for (let i = -1; i < 14; i++) {
      const x = i * 100
      g += `<path d="M${x} 360 V190 a50 50 0 0 1 100 0 V360" fill="none" stroke="${s}" stroke-opacity=".35" stroke-width="3"/>`
      g += `<path d="M${x + 22} 360 V205 a28 28 0 0 1 56 0 V360" fill="#fff" fill-opacity=".05"/>`
    }
    return `<rect width="1200" height="360" fill="${p}"/><circle cx="980" cy="70" r="160" fill="${s}" fill-opacity=".18"/>${g}`
  } },
  waves: { label: 'أمواج', draw: (p, s) => {
    let g = ''
    for (let i = 0; i < 6; i++) {
      const y = 120 + i * 45
      g += `<path d="M0 ${y} C200 ${y - 50} 400 ${y + 50} 600 ${y} S1000 ${y - 50} 1200 ${y} V360 H0Z" fill="${i % 2 ? s : '#fff'}" fill-opacity="${0.05 + i * 0.025}"/>`
    }
    return `<rect width="1200" height="360" fill="${p}"/>${g}`
  } },
  stars: { label: 'نجوم', draw: (p, s) => {
    let g = ''
    for (let y = 0; y < 5; y++) for (let x = 0; x < 14; x++) {
      const cx = x * 92 + (y % 2) * 46
      g += star8(cx, y * 80 + 20, 26)
    }
    return `<rect width="1200" height="360" fill="${p}"/><g fill="none" stroke="${s}" stroke-opacity=".3" stroke-width="2">${g}</g><rect width="1200" height="360" fill="url(#f)"/><defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="${p}" stop-opacity="0"/><stop offset="1" stop-color="${p}" stop-opacity=".7"/></linearGradient></defs>`
  } },
  dunes: { label: 'كثبان', draw: (p, s) => {
    return `<rect width="1200" height="360" fill="${p}"/><circle cx="260" cy="110" r="70" fill="${s}" fill-opacity=".55"/>`
      + `<path d="M0 250 Q300 170 600 240 T1200 220 V360 H0Z" fill="#fff" fill-opacity=".08"/>`
      + `<path d="M0 290 Q350 220 700 290 T1200 270 V360 H0Z" fill="${s}" fill-opacity=".22"/>`
      + `<path d="M0 330 Q400 280 800 330 T1200 320 V360 H0Z" fill="#000" fill-opacity=".12"/>`
  } }
}

/** يحوّل قيمة الغلاف إلى قيمة CSS background-image */
export function coverCss(branding) {
  const c = branding?.cover
  if (!c) return 'none'
  if (c.startsWith('pattern:')) {
    const pat = COVER_PATTERNS[c.slice(8)] || COVER_PATTERNS.arches
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice">${pat.draw(branding.primary, branding.secondary)}</svg>`
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
  }
  return `url("${c}")`
}
