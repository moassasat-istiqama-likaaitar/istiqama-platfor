import confetti from 'canvas-confetti'

/** احتفال بصري (قصاصات ملونة) — أكثر حماساً للصغار */
export function celebrate(theme = 'staff') {
  const colors = { kids: ['#ff6b4a', '#ffc93c', '#3ec1f3', '#4cd07d', '#9b6bff'], juniors: ['#0a9bdc', '#8ac926', '#ff8a3d', '#ffc93c'], teens: ['#6550e0', '#2dd4bf', '#ff7a8a'] }[theme] || ['#3159e8', '#ffb020']
  const count = theme === 'kids' ? 160 : theme === 'juniors' ? 110 : 40
  try {
    confetti({ particleCount: count, spread: 80, startVelocity: 38, origin: { y: 0.65 }, colors, disableForReducedMotion: true })
  } catch {
    /* بعض البيئات تمنع canvas */
  }
}

let ctx
/** نغمة قصيرة (للطورين الأولين فقط) — دون ملفات صوتية */
export function chime(kind = 'success', theme = 'staff') {
  if (!['kids', 'juniors'].includes(theme)) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const notes = kind === 'success' ? [523.25, 659.25, 783.99] : kind === 'tap' ? [880] : [330, 262]
    notes.forEach((f, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = f
      const t = ctx.currentTime + i * 0.11
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'tap' ? 0.08 : 0.25))
      o.connect(g).connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.3)
    })
  } catch {
    /* الصوت غير متاح */
  }
}
