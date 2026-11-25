/**
 * توسيع البيانات التجريبية: معلمون وأقسام وتلاميذ وأولياء مولَّدون (دون حسابات دخول)
 * حتى تظهر شاشات المعلم والمدير والإدارة ممتلئة كما في الواقع.
 * التوليد حتمي (نفس النتيجة في كل تحميل).
 */
import { schools, classes, persons, assignments, levels } from './db'

const BOYS = ['محمد', 'أحمد', 'عبد الله', 'يوسف', 'إبراهيم', 'عمر', 'بلال', 'حمزة', 'زكرياء', 'عبد الرحمن', 'صهيب', 'أيوب', 'إلياس', 'نوح', 'سليمان', 'مصعب', 'أسامة', 'عثمان', 'خالد', 'معاذ']
const GIRLS = ['فاطمة', 'عائشة', 'آمنة', 'خديجة', 'زينب', 'سارة', 'هاجر', 'أسماء', 'رقية', 'صفية', 'مريم', 'نسيبة', 'حفصة', 'جويرية', 'سمية', 'رحمة', 'إيمان', 'هبة', 'آية', 'نور']
const LAST = ['بن يوسف', 'حمو', 'بالحاج', 'أولاد علي', 'بوعمرة', 'شريفي', 'قاسمي', 'بن عمر', 'حاج عيسى', 'دحمان', 'بكوش', 'زروقي', 'بن سالم', 'مرابط', 'سعدي', 'بوزيد', 'خليفة', 'ميلودي', 'عيسات', 'نعيمي']
const SUBJ = ['التربية الإيمانية', 'اللغة العربية', 'الفقه', 'التاريخ', 'أحكام التجويد']

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

// أقسام إضافية في المدارس الثلاث التجريبية + قسمان في كل مدرسة أخرى
const EXTRA = [
  ['s1', 'P1', 'mixed', 'أ'], ['s1', 'P5', 'mixed', 'أ'], ['s1', 'M1', 'male', 'ذكور'], ['s1', 'M4', 'female', 'إناث'],
  ['s2', 'P3', 'mixed', 'ب'], ['s2', 'M4', 'male', 'ذكور'], ['s2', 'S2', 'female', 'إناث'],
  ['s3', 'P1', 'mixed', 'أ'], ['s3', 'P3', 'mixed', 'أ'], ['s3', 'M1', 'mixed', 'أ']
]
let ci = 100
EXTRA.forEach(([schoolId, levelId, gender, suffix]) => {
  const lvl = levels.find((l) => l.id === levelId)
  classes.push({ id: 'c' + ci++, name: `${lvl.name} ${gender === 'mixed' ? suffix : '- ' + suffix}`, levelId, schoolId, gender, seasonId: 'y2026' })
})
schools.slice(3).forEach((s) => {
  const pair = s.gender === 'female' ? [['P4', 'female', 'إناث'], ['M2', 'female', 'إناث']] : s.gender === 'male' ? [['P4', 'male', 'ذكور'], ['M2', 'male', 'ذكور']] : [['P2', 'mixed', 'أ'], ['M1', 'mixed', 'أ']]
  pair.forEach(([levelId, gender, suffix]) => {
    const lvl = levels.find((l) => l.id === levelId)
    classes.push({ id: 'c' + ci++, name: `${lvl.name} ${gender === 'mixed' ? suffix : '- ' + suffix}`, levelId, schoolId: s.id, gender, seasonId: 'y2026' })
  })
})

// معلمون مولَّدون: كل قسم بلا معلم يأخذ معلماً من مدرسته
let pi = 1000
let ai = 1000
const newPerson = (gender, extra = {}) => {
  const p = { id: 'g' + pi++, username: '', email: '', password: '', firstName: pick(gender === 'female' ? GIRLS : BOYS), lastName: pick(LAST), gender, status: 'active', generated: true, ...extra }
  persons.push(p)
  return p
}
const taught = new Set(assignments.filter((a) => a.role === 'teacher').flatMap((a) => a.classIds))
schools.forEach((s) => {
  const free = classes.filter((c) => c.schoolId === s.id && !taught.has(c.id))
  for (let i = 0; i < free.length; i += 2) {
    const group = free.slice(i, i + 2)
    const g = group[0].gender === 'female' ? 'female' : 'male'
    const t = newPerson(g, { phone: `0${5 + (pi % 3)}${String(10000000 + pi * 7919).slice(-8)}` })
    assignments.push({ id: 'ga' + ai++, personId: t.id, role: 'teacher', schoolId: s.id, classIds: group.map((c) => c.id), subjects: [pick(SUBJ), pick(SUBJ)].filter((v, k, a) => a.indexOf(v) === k) })
  }
  // مدير لكل مدرسة ليس لها مدير
  if (!assignments.some((a) => a.role === 'school_manager' && a.schoolId === s.id)) {
    const m = newPerson(s.gender === 'female' ? 'female' : 'male')
    assignments.push({ id: 'ga' + ai++, personId: m.id, role: 'school_manager', schoolId: s.id })
  }
})

// تلاميذ مولَّدون لكل قسم (14–22) + ولي لكل أخوين تقريباً
classes.forEach((c) => {
  const lvl = levels.find((l) => l.id === c.levelId)
  const count = 14 + Math.floor(rnd() * 9)
  const already = assignments.filter((a) => a.role === 'student' && a.classId === c.id).length
  for (let i = already; i < count; i++) {
    const g = c.gender === 'mixed' ? (rnd() > 0.5 ? 'male' : 'female') : c.gender
    const y = 2026 - 5 - (lvl?.order || 1)
    const st = newPerson(g, { birthDate: `${y}-0${1 + Math.floor(rnd() * 9)}-1${Math.floor(rnd() * 9)}`, status: rnd() > 0.95 ? 'pending' : 'active' })
    assignments.push({ id: 'ga' + ai++, personId: st.id, role: 'student', schoolId: c.schoolId, classId: c.id })
    if (i % 2 === 0) {
      const par = newPerson(rnd() > 0.5 ? 'male' : 'female', { lastName: st.lastName, phone: `06${String(20000000 + pi * 104729).slice(-8)}`, status: rnd() > 0.93 ? 'pending' : 'active' })
      assignments.push({ id: 'ga' + ai++, personId: par.id, role: 'parent', schoolId: null, childIds: [st.id] })
    }
  }
})

/** مؤشرات ثابتة لكل تلميذ مولَّد (تقدّم، معدل، متأخرات، آخر دخول) */
export function hashStats(personId) {
  let h = 0
  for (const ch of personId) h = (h * 31 + ch.charCodeAt(0)) % 100003
  const r = (k) => ((h * (k + 3) * 2654435761) % 1000) / 1000
  const progress = Math.round(15 + r(1) * 75)
  return {
    progress,
    average: Math.round((8 + r(2) * 11.5) * 10) / 10,
    late: Math.floor(r(3) * (progress < 35 ? 5 : 2.5)),
    done: Math.round(progress / 4),
    lastSeenDays: Math.floor(r(4) * (progress < 30 ? 14 : 4)),
    minutesWeek: Math.round(20 + r(5) * 200)
  }
}
