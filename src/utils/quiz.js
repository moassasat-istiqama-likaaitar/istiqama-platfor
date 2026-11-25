/**
 * محرّك الأسئلة: ثمانية أنواع، والتصحيح الآلي أو اليدوي.
 *
 *  mcq    اختيار واحد        { options[], answer }
 *  tf     صح / خطأ           { options:['صح','خطأ'], answer }
 *  multi  اختيار متعدد       { options[], answers[] }          — العلامة كاملة إن طابقت كل الاختيارات
 *  match  ربط بين عمودين     { pairs:[{left,right}] }           — جزئية: لكل زوج صحيح حصته
 *  order  ترتيب              { items[] (بالترتيب الصحيح) }      — كاملة إن طابق الترتيب
 *  fill   ملء الفراغ         { q بـ «___» ، blanks:[[صيغ مقبولة]] } — جزئية: لكل فراغ حصته
 *  short  إجابة قصيرة        { keywords[] }                     — آلي إن وُجدت كلمات مفتاحية، وإلا يدوي
 *  essay  سؤال مقالي         {}                                 — يدوي دائماً
 * لكل سؤال points (افتراضياً 1).
 */

export const QTYPES = {
  mcq: { label: 'اختيار واحد', icon: 'pi pi-circle', auto: true },
  tf: { label: 'صح / خطأ', icon: 'pi pi-check-square', auto: true },
  multi: { label: 'اختيار متعدد', icon: 'pi pi-list-check', auto: true },
  match: { label: 'ربط', icon: 'pi pi-arrows-h', auto: true },
  order: { label: 'ترتيب', icon: 'pi pi-sort-amount-down', auto: true },
  fill: { label: 'ملء الفراغ', icon: 'pi pi-minus', auto: true },
  short: { label: 'إجابة قصيرة', icon: 'pi pi-pencil', auto: 'keywords' },
  essay: { label: 'سؤال مقالي', icon: 'pi pi-align-right', auto: false }
}

export const qtype = (q) => q.type || (q.options?.length === 2 ? 'tf' : 'mcq')
export const qpoints = (q) => Number(q.points) || 1
export const isManual = (q) => qtype(q) === 'essay' || (qtype(q) === 'short' && !(q.keywords || []).filter(Boolean).length)

const norm = (s) => String(s ?? '').trim().replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').toLowerCase()

/** عدد فراغات سؤال ملء الفراغ */
export const blanksCount = (q) => (String(q.q || '').match(/_{3,}/g) || []).length

/** تصحيح سؤال واحد → { score, max, manual, correct } */
export function gradeQuestion(q, ans) {
  const max = qpoints(q)
  const t = qtype(q)
  const out = (ratio) => ({ score: Math.round(max * ratio * 100) / 100, max, manual: false, correct: ratio === 1 })
  if (ans === undefined || ans === null) return isManual(q) ? { score: 0, max, manual: true, correct: false } : out(0)
  switch (t) {
    case 'mcq':
    case 'tf':
      return out(ans === q.answer ? 1 : 0)
    case 'multi': {
      const a = [...(ans || [])].sort().join(',')
      return out(a === [...(q.answers || [])].sort().join(',') ? 1 : 0)
    }
    case 'match': {
      const n = q.pairs.length
      const ok = q.pairs.filter((_, i) => ans[i] === i).length
      return out(n ? ok / n : 0)
    }
    case 'order':
      return out((ans || []).every((v, i) => v === i) && ans.length === q.items.length ? 1 : 0)
    case 'fill': {
      const n = q.blanks.length
      const ok = q.blanks.filter((accepted, i) => accepted.some((acc) => norm(acc) === norm(ans[i]))).length
      return out(n ? ok / n : 0)
    }
    case 'short': {
      const keys = (q.keywords || []).filter(Boolean)
      if (!keys.length) return { score: 0, max, manual: true, correct: false }
      const hit = keys.filter((k) => norm(ans).includes(norm(k))).length
      return out(hit / keys.length)
    }
    default:
      return { score: 0, max, manual: true, correct: false }
  }
}

/** تصحيح اختبار كامل → { perQuestion[], auto, manualMax, total, needsManual } */
export function gradeQuiz(questions, answers) {
  const perQuestion = questions.map((q, i) => gradeQuestion(q, answers[i]))
  const auto = perQuestion.filter((r) => !r.manual).reduce((n, r) => n + r.score, 0)
  return {
    perQuestion,
    auto: Math.round(auto * 100) / 100,
    max: perQuestion.reduce((n, r) => n + r.max, 0),
    needsManual: perQuestion.some((r) => r.manual)
  }
}

/** نسخة السؤال التي تُرسل للتلميذ قبل التسليم (بلا إجابات) — مع خلط الأعمدة/العناصر */
export function publicQuestion(q, seed = 1) {
  const t = qtype(q)
  const base = { type: t, q: q.q, points: qpoints(q) }
  const shuffle = (n) => {
    const idx = [...Array(n).keys()]
    let s = seed + n * 7
    for (let i = n - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280
      const j = s % (i + 1)
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    if (n > 1 && idx.every((v, i) => v === i)) idx.reverse()
    return idx
  }
  if (t === 'mcq' || t === 'tf' || t === 'multi') return { ...base, options: q.options }
  if (t === 'match') return { ...base, lefts: q.pairs.map((p) => p.left), rights: q.pairs.map((p) => p.right), rightOrder: shuffle(q.pairs.length) }
  if (t === 'order') return { ...base, items: q.items, startOrder: shuffle(q.items.length) }
  if (t === 'fill') return { ...base, blanks: q.blanks.length }
  return base
}

/** نص الإجابة الصحيحة (للمراجعة بعد التصحيح) */
export function correctText(q) {
  const t = qtype(q)
  if (t === 'mcq' || t === 'tf') return q.options[q.answer]
  if (t === 'multi') return (q.answers || []).map((i) => q.options[i]).join('، ')
  if (t === 'match') return q.pairs.map((p) => `${p.left} ← ${p.right}`).join(' · ')
  if (t === 'order') return q.items.join(' ← ')
  if (t === 'fill') return q.blanks.map((b) => b[0]).join(' / ')
  if (t === 'short') return (q.keywords || []).length ? `كلمات مفتاحية: ${q.keywords.join('، ')}` : 'يصحّحها المعلم'
  return q.model || 'يصحّحها المعلم'
}

/** نص إجابة التلميذ */
export function answerText(q, ans) {
  if (ans === undefined || ans === null || ans === '') return '—'
  const t = qtype(q)
  if (t === 'mcq' || t === 'tf') return q.options[ans]
  if (t === 'multi') return ans.map((i) => q.options[i]).join('، ')
  if (t === 'match') return q.pairs.map((p, i) => `${p.left} ← ${q.pairs[ans[i]]?.right ?? '—'}`).join(' · ')
  if (t === 'order') return ans.map((i) => q.items[i]).join(' ← ')
  if (t === 'fill') return ans.join(' / ')
  return String(ans)
}

/** قالب سؤال جديد حسب النوع (لمنشئ الاختبارات) */
export function blankQuestion(type) {
  const b = { type, q: '', points: 1, explain: '' }
  if (type === 'mcq') return { ...b, options: ['', '', ''], answer: 0 }
  if (type === 'tf') return { ...b, options: ['صح', 'خطأ'], answer: 0 }
  if (type === 'multi') return { ...b, options: ['', '', '', ''], answers: [] }
  if (type === 'match') return { ...b, pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] }
  if (type === 'order') return { ...b, items: ['', '', ''] }
  if (type === 'fill') return { ...b, q: '', blanks: [] }
  if (type === 'short') return { ...b, keywords: [], points: 2 }
  return { ...b, points: 4, model: '' }
}

/** مشكلات سؤال قبل الحفظ (فارغ إن كان سليماً) */
export function questionProblem(q, i) {
  const n = `السؤال ${i + 1}`
  const t = qtype(q)
  if (!String(q.q || '').trim()) return `${n} بلا نص`
  if ((t === 'mcq' || t === 'multi') && q.options.some((o) => !String(o).trim())) return `${n}: خيار فارغ`
  if (t === 'multi' && !(q.answers || []).length) return `${n}: حدّد إجابة صحيحة واحدة على الأقل`
  if (t === 'match' && q.pairs.some((p) => !p.left.trim() || !p.right.trim())) return `${n}: زوج غير مكتمل`
  if (t === 'order' && q.items.some((x) => !String(x).trim())) return `${n}: عنصر فارغ`
  if (t === 'fill') {
    if (!blanksCount(q)) return `${n}: ضع «___» مكان كل فراغ في نص السؤال`
    if (q.blanks.length !== blanksCount(q) || q.blanks.some((b) => !b.length || !String(b[0]).trim())) return `${n}: اكتب الإجابة الصحيحة لكل فراغ`
  }
  return ''
}
