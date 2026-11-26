/**
 * مصفوفة المراسلة — «الكل يستطيع مراسلة الكل» لكن بتفعيل من الإدارة العامة.
 * لكل (مرسل ← مستقبل) نطاق: off مغلق | class نفس القسم | school نفس المدرسة | all الكل.
 * الافتراضي = القواعد المعتمدة (الولي يراسل المدير فقط، المعلم يراسل تلاميذه وأولياءهم...).
 */
export const MSG_ROLES = [
  { key: 'student', label: 'التلميذ' },
  { key: 'parent', label: 'الولي' },
  { key: 'teacher', label: 'المعلم' },
  { key: 'school_manager', label: 'مدير المدرسة' },
  { key: 'editor', label: 'المحرر' },
  { key: 'top', label: 'الإدارة العامة' },
  { key: 'support', label: 'الدعم' }
]
export const SCOPES = [
  { value: 'off', label: 'مغلق' },
  { value: 'class', label: 'نفس القسم' },
  { value: 'school', label: 'نفس المدرسة' },
  { value: 'all', label: 'الكل' }
]
const off = () => Object.fromEntries(MSG_ROLES.map((r) => [r.key, 'off']))
export const DEFAULT_MATRIX = {
  student: { ...off(), teacher: 'class' },
  parent: { ...off(), school_manager: 'school' },
  teacher: { ...off(), student: 'class', parent: 'class', school_manager: 'school' },
  school_manager: { ...off(), teacher: 'school', parent: 'school' },
  editor: { ...off(), teacher: 'class', editor: 'all', top: 'all' },
  top: { ...off(), teacher: 'all', school_manager: 'all', editor: 'all', top: 'all', support: 'all' },
  support: { ...off(), teacher: 'all', school_manager: 'all', editor: 'all', top: 'all', support: 'all' }
}
/** خانة حساسة: تلميذ مع راشد ليس معلمه، أو تلميذ مع تلميذ */
export const sensitive = (from, to) => (from === 'student' || to === 'student') && !((from === 'student' && to === 'teacher') || (from === 'teacher' && to === 'student'))
export const msgRoleOf = (role) => (['super_admin', 'admin'].includes(role) ? 'top' : role)
