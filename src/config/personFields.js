/**
 * البيانات الشخصية (موحّدة بين نماذج الإضافة والملف ونماذج الاستيراد الجماعي):
 *  مشتركة لكل المستخدمين: الاسم، اللقب، اسم الأب، اسم الجد، تاريخ الميلاد، الجنس، القصر، العشيرة.
 *  المعلم والمحرر ومدير المدرسة والمدير العام والمشرف العام: + المستوى الدراسي.
 *  الولي: + صلة القرابة بالأبناء (أب، أم، خال...).
 */
export const EDU_LEVELS = ['متوسط', 'ثانوي', 'تكوين مهني', 'ليسانس', 'ماستر', 'دكتوراه', 'تعليم قرآني / شرعي']
export const RELATIONS = ['أب', 'أم', 'جد', 'جدة', 'أخ', 'أخت', 'عم', 'عمة', 'خال', 'خالة', 'وصيّ']
export const EDU_ROLES = ['teacher', 'editor', 'school_manager', 'super_admin', 'admin']
export const GENDERS = [{ label: 'ذكر', value: 'male' }, { label: 'أنثى', value: 'female' }]
const opts = (xs) => xs.map((x) => ({ label: x, value: x }))

/** حقول FormDialog المشتركة */
export const commonFields = () => [
  { key: 'firstName', label: 'الاسم', required: true }, { key: 'lastName', label: 'اللقب', required: true },
  { key: 'fatherName', label: 'اسم الأب', required: true }, { key: 'grandfatherName', label: 'اسم الجد' },
  { key: 'birthDate', label: 'تاريخ الميلاد', type: 'date', required: true }, { key: 'gender', label: 'الجنس', type: 'select', options: GENDERS, required: true },
  { key: 'ksar', label: 'القصر' }, { key: 'clan', label: 'العشيرة' }
]
export const eduField = () => ({ key: 'educationLevel', label: 'المستوى الدراسي', type: 'select', options: opts(EDU_LEVELS) })
export const relationField = () => ({ key: 'relation', label: 'صلة القرابة بالأبناء', type: 'select', options: opts(RELATIONS), required: true })
/** مفاتيح البيانات الشخصية التي تُحفظ في سجل الشخص */
export const PERSON_KEYS = ['firstName', 'lastName', 'fatherName', 'grandfatherName', 'birthDate', 'gender', 'ksar', 'clan', 'educationLevel', 'relation', 'email', 'phone', 'status']
