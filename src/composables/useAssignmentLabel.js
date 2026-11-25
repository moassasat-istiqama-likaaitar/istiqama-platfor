import { useI18n } from 'vue-i18n'

/** وصف موحّد للصفة: "معلم — مدرسة النور" + سطر تفاصيل */
export function useAssignmentLabel() {
  const { t } = useI18n()

  const title = (a) => (a ? t(`roles.${a.role}`) : '')

  const place = (a) => {
    if (!a) return ''
    if (a.school) return a.school.name
    if (a.role === 'parent') return ''
    return t('assignment.allPlatform')
  }

  const detail = (a) => {
    if (!a) return ''
    const sep = '، '
    if (a.role === 'teacher' && a.classes?.length) return t('assignment.classes', { list: a.classes.map((c) => c.name).join(sep) })
    if (a.role === 'student' && a.class) return t('assignment.class', { name: a.class.name })
    if (a.role === 'parent' && a.children?.length) return t('assignment.children', { list: a.children.map((c) => c.name).join(sep) })
    if (a.role === 'editor' && a.subjects?.length) return t('assignment.subjects', { list: a.subjects.join(sep) })
    return ''
  }

  const full = (a) => [title(a), place(a)].filter(Boolean).join(' — ')

  return { title, place, detail, full }
}
