import { levels, classes, schools } from '@/mock/db'
import { subjects, lessons } from '@/mock/content'
import { editorState } from '@/api/teaching'
import { useAuthStore } from '@/stores/auth'

/** قوائم الاختيار الموحّدة (المستويات، المواد، الدروس، الأقسام) */
export function useCatalog() {
  const levelOptions = levels.map((l) => ({ label: l.name, value: l.id }))
  const subjectOptions = (levelId) => subjects.filter((s) => !levelId || s.levelId === levelId).map((s) => ({ label: levelId ? s.name : `${s.name} — ${levels.find((l) => l.id === s.levelId)?.name}`, value: s.id }))
  const subjectNames = [...new Set(subjects.map((s) => s.name))].map((n) => ({ label: n, value: n }))
  const lessonOptions = (subjectId) => lessons.filter((l) => l.subjectId === subjectId).map((l) => ({ label: `${l.label ? l.label + ': ' : ''}${l.title}`, value: l.id }))
  const classOptions = (ids) => {
    const list = classes.filter((c) => !ids || ids.includes(c.id))
    const multi = new Set(list.map((c) => c.schoolId)).size > 1
    return list.map((c) => ({ label: multi ? `${c.name} — ${schools.find((s) => s.id === c.schoolId)?.short}` : c.name, value: c.id }))
  }
  const schoolOptions = schools.map((s) => ({ label: s.name, value: s.id }))
  const levelOfClass = (id) => classes.find((c) => c.id === id)?.levelId
  const TYPE_OPTIONS = [
    { label: 'فيديو', value: 'video' }, { label: 'عرض شرائح', value: 'slides' }, { label: 'ملف PDF', value: 'pdf' },
    { label: 'صورة', value: 'image' }, { label: 'تسجيل صوتي', value: 'audio' }, { label: 'رابط خارجي', value: 'link' }
  ]
  const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]))
  // دروس يمكن الإدراج فيها: المعلم لا يدرج إلا فيما فتحه المحرر (أو جدوله)؛ المحرر في كل الدروس
  const linkLessonOptions = (subjectId) => {
    const isEditor = useAuthStore().role === 'editor'
    return lessons.filter((l) => l.subjectId === subjectId).map((l) => {
      const st = editorState(l)
      return { label: `${l.label ? l.label + ': ' : ''}${l.title}${st === 'scheduled' ? ' (مجدول)' : st === 'closed' ? ' — لم يفتحه المحرر' : ''}`, value: l.id, disabled: !isEditor && st === 'closed' }
    })
  }
  return { levelOptions, subjectOptions, subjectNames, lessonOptions, linkLessonOptions, classOptions, schoolOptions, levelOfClass, TYPE_OPTIONS, TYPE_LABEL, levels, subjects, lessons, classes, schools }
}
