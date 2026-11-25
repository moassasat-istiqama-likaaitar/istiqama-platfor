import { levels, classes, schools } from '@/mock/db'
import { subjects, lessons } from '@/mock/content'

/** قوائم الاختيار الموحّدة (المستويات، المواد، الدروس، الأقسام) */
export function useCatalog() {
  const levelOptions = levels.map((l) => ({ label: l.name, value: l.id }))
  const subjectOptions = (levelId) => subjects.filter((s) => !levelId || s.levelId === levelId).map((s) => ({ label: levelId ? s.name : `${s.name} — ${levels.find((l) => l.id === s.levelId)?.name}`, value: s.id }))
  const subjectNames = [...new Set(subjects.map((s) => s.name))].map((n) => ({ label: n, value: n }))
  const lessonOptions = (subjectId) => lessons.filter((l) => l.subjectId === subjectId).map((l) => ({ label: `${l.label ? l.label + ': ' : ''}${l.title}`, value: l.id }))
  const classOptions = (ids) => classes.filter((c) => !ids || ids.includes(c.id)).map((c) => ({ label: c.name, value: c.id }))
  const schoolOptions = schools.map((s) => ({ label: s.name, value: s.id }))
  const levelOfClass = (id) => classes.find((c) => c.id === id)?.levelId
  const TYPE_OPTIONS = [
    { label: 'فيديو', value: 'video' }, { label: 'عرض شرائح', value: 'slides' }, { label: 'ملف PDF', value: 'pdf' },
    { label: 'صورة', value: 'image' }, { label: 'تسجيل صوتي', value: 'audio' }, { label: 'رابط خارجي', value: 'link' }
  ]
  const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]))
  return { levelOptions, subjectOptions, subjectNames, lessonOptions, classOptions, schoolOptions, levelOfClass, TYPE_OPTIONS, TYPE_LABEL, levels, subjects, lessons, classes, schools }
}
