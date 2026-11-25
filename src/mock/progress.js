/**
 * تقدّم التلاميذ (تجريبي): الدروس المنجزة، النقاط، أيام المواظبة، التسليمات، التقييمات، التعليقات.
 * يُحفظ في متصفح المستخدم حتى يبقى أثر تجربته بعد إعادة التحميل.
 */
import { lessons, activities, subjects } from './content'
import { storage } from '@/utils/storage'

const KEY = 'ist.progress.v2'

export const BADGES = {
  'first-lesson': { icon: 'pi pi-flag', title: 'الخطوة الأولى', hint: 'أكملت أول درس' },
  'streak-3': { icon: 'pi pi-bolt', title: 'مواظب', hint: '3 أيام متتالية' },
  'streak-7': { icon: 'pi pi-sun', title: 'أسبوع كامل', hint: '7 أيام متتالية' },
  'quiz-ace': { icon: 'pi pi-star', title: 'نجم الاختبارات', hint: 'علامة كاملة في اختبار' },
  'curious': { icon: 'pi pi-eye', title: 'فضولي', hint: 'شاهدت 10 محتويات' },
  'helper': { icon: 'pi pi-comments', title: 'مشارك', hint: 'كتبت تعليقاً مفيداً' },
  'subject-master': { icon: 'pi pi-trophy', title: 'بطل المادة', hint: 'أكملت كل دروس مادة' }
}

// [عدد الدروس المنجزة لكل مادة بالترتيب]، النقاط، المواظبة
const SEEDS = {
  p7: { level: 'P3', done: [2, 2, 1, 2, 1], stars: 140, streak: 4, badges: ['first-lesson', 'streak-3', 'quiz-ace'] },
  p10: { level: 'P1', done: [1, 1, 1, 0], stars: 60, streak: 2, badges: ['first-lesson'] },
  p13: { level: 'M1', done: [2, 1, 2, 1, 1], stars: 210, streak: 7, badges: ['first-lesson', 'streak-3', 'streak-7', 'curious'] },
  p8: { level: 'M4', done: [2, 2, 3, 1, 1], stars: 320, streak: 12, badges: ['first-lesson', 'streak-3', 'streak-7', 'quiz-ace', 'helper'] },
  p9: { level: 'S2', done: [1, 2, 1, 2], stars: 280, streak: 3, badges: ['first-lesson', 'streak-3', 'curious'] }
}

const iso = (daysAgo, h = 18) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, 15, 0, 0)
  return d.toISOString()
}

function seedFor(personId) {
  const s = SEEDS[personId]
  if (!s) return { done: [], viewed: [], stars: 0, streak: 0, badges: [], submissions: {}, ratings: {}, comments: {} }
  const levelSubjects = subjects.filter((x) => x.levelId === s.level)
  const done = []
  levelSubjects.forEach((sub, i) => {
    lessons.filter((l) => l.subjectId === sub.id).slice(0, s.done[i] || 0).forEach((l) => done.push(l.id))
  })
  // التسليمات: أنشطة الدروس المنجزة تُعتبر مُنجزة؛ بعضها مصحّح وبعضها بانتظار التصحيح
  const submissions = {}
  activities
    .filter((a) => a.levelId === s.level && done.includes(a.lessonId))
    .forEach((a, i) => {
      if (a.type === 'quiz') {
        const answers = a.questions.map((q, qi) => (qi === 1 && i % 3 === 1 ? (q.answer + 1) % q.options.length : q.answer))
        const correct = answers.filter((ans, qi) => ans === a.questions[qi].answer).length
        submissions[a.id] = { status: 'graded', answers, score: Math.round((correct / a.questions.length) * a.maxScore), at: iso(i + 1) }
      } else if (i % 2 === 0) {
        submissions[a.id] = { status: 'graded', text: 'أنجزت التمارين في الكراس.', files: ['كراس-الصفحة-12.jpg'], score: 16 + (i % 4), note: 'عمل جيد، انتبه إلى ترتيب الخطوات.', at: iso(i + 2) }
      } else {
        submissions[a.id] = { status: 'submitted', text: 'تم الحل، الصورة مرفقة.', files: ['واجب.jpg'], at: iso(i) }
      }
    })
  return { done, viewed: [...done], stars: s.stars, streak: s.streak, badges: [...s.badges], submissions, ratings: {}, comments: {} }
}

let db = storage.get(KEY, {})

export function progressOf(personId) {
  if (!db[personId]) {
    db[personId] = seedFor(personId)
    save()
  }
  return db[personId]
}

export function save() {
  storage.set(KEY, db)
}

export function resetProgress() {
  db = {}
  storage.remove(KEY)
}
