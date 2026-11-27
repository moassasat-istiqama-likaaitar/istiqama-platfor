/**
 * القوائم الجانبية لكل دور — مأخوذة من شجرات التنقل في دفتر الشروط.
 *  key   : معرّف الشاشة ومسارها (/app/<key>)
 *  codes : رموز الشاشات في جدول "قائمة الشاشات وخطة البناء"
 *  phase : مرحلة البناء
 * الشاشات غير المبنية بعد تفتح صفحة "قيد البناء" تذكر مرحلتها.
 */

const item = (key, icon, codes, phase) => ({ key, icon, codes, phase, to: `/app/${key}` })
const group = (key, icon, children) => ({ key, icon, children })

const feedback = item('feedback', 'pi pi-flag', ['F08'], 1)

const adminMenu = [
  item('home', 'pi pi-home', ['AD01'], 7),
  group('users', 'pi pi-users', [
    item('users-list', 'pi pi-id-card', ['AD02', 'AD03'], 7),
    item('users-import', 'pi pi-file-import', ['AD04'], 7),
    item('users-duplicates', 'pi pi-clone', ['AD05'], 7),
    item('activity-log', 'pi pi-history', ['AD06'], 7)
  ]),
  group('content', 'pi pi-book', [
    item('library-manage', 'pi pi-book', ['ED02'], 5),
    item('library-review', 'pi pi-check-square', ['ED03', 'ED04'], 5),
    item('activities', 'pi pi-database', ['ED05'], 5)
  ]),
  group('reports', 'pi pi-chart-bar', [
    item('reports-general', 'pi pi-chart-line', ['AD17'], 7),
    item('reports-schools', 'pi pi-building', ['AD17'], 7),
    item('reports-files', 'pi pi-file', ['AD17'], 7),
    item('reports-engagement', 'pi pi-heart', ['AD17'], 7)
  ]),
  group('settings', 'pi pi-cog', [
    item('schools', 'pi pi-building', ['AD07'], 7),
    item('levels', 'pi pi-sitemap', ['AD08'], 7),
    item('seasons', 'pi pi-calendar', ['AD09'], 7),
    item('classes-all', 'pi pi-th-large', ['AD10'], 7),
    item('subjects', 'pi pi-list', ['AD11'], 7),
    item('permissions', 'pi pi-lock', ['AD12'], 7),
    item('customization', 'pi pi-palette', ['AD13'], 7),
    item('branding-requests', 'pi pi-verified', ['AD19'], 6),
    item('announcements', 'pi pi-megaphone', ['AD14'], 7),
    item('calendar', 'pi pi-calendar-plus', ['AD15'], 7),
    item('communication', 'pi pi-comments', ['AD16'], 7),
    item('import-export', 'pi pi-sync', ['AD18'], 7)
  ]),
  item('tickets', 'pi pi-ticket', ['SU02'], 8)
]

export const MENUS = {
  super_admin: adminMenu,
  admin: adminMenu,

  editor: [
    item('home', 'pi pi-home', ['ED01'], 5),
    item('library-manage', 'pi pi-book', ['ED02'], 5),
    group('review', 'pi pi-check-square', [
      item('library-review', 'pi pi-book', ['ED03', 'ED04'], 5),
      item('activities-review', 'pi pi-question-circle', ['ED03'], 5)
    ]),
    group('banks', 'pi pi-database', [
      item('activities', 'pi pi-database', ['ED05'], 5),
      item('offline-tests', 'pi pi-print', ['TE17'], 4)
    ]),
    group('production', 'pi pi-pencil', [
      item('upload-content', 'pi pi-upload', ['TE13'], 4),
      item('new-homework', 'pi pi-file-edit', ['TE14'], 4),
      item('quiz-builder', 'pi pi-question-circle', ['TE15'], 4)
    ]),
    // المحرر يأخذ دور المعلم في أقسام مستوياته (والمستوى كقسم واحد)
    group('teaching', 'pi pi-th-large', [
      item('lesson-opening', 'pi pi-calendar', ['ED07'], 5),
      item('my-classes', 'pi pi-th-large', ['TE02', 'TE03'], 4),
      item('class-library', 'pi pi-bookmark', ['TE04', 'TE05'], 4),
      item('submissions', 'pi pi-inbox', ['TE09', 'TE10'], 4)
    ]),
    item('editor-reports', 'pi pi-chart-bar', ['ED06'], 5),
    feedback
  ],

  school_manager: [
    item('home', 'pi pi-home', ['SM01'], 6),
    group('users', 'pi pi-users', [
      item('teachers', 'pi pi-user', ['SM02'], 6),
      item('students', 'pi pi-users', ['SM03'], 6),
      item('parents', 'pi pi-user-plus', ['SM04'], 6),
      item('activation', 'pi pi-check-circle', ['SM05'], 6),
      item('login-sheets', 'pi pi-id-card', ['SM12'], 6)
    ]),
    item('school-classes', 'pi pi-th-large', ['SM06'], 6),
    group('content', 'pi pi-book', [
      item('teacher-files-review', 'pi pi-check-square', ['SM07'], 6),
      item('content-follow', 'pi pi-eye', ['SM08'], 6)
    ]),
    item('performance', 'pi pi-chart-bar', ['SM09'], 6),
    item('school-notice', 'pi pi-megaphone', ['SM10'], 6),
    item('school-identity', 'pi pi-palette', ['SM11'], 6),
    feedback
  ],

  teacher: [
    item('home', 'pi pi-home', ['TE01'], 4),
    item('my-classes', 'pi pi-th-large', ['TE02', 'TE03', 'TE06', 'TE07'], 4),
    item('login-sheets', 'pi pi-id-card', ['TE18'], 4),
    item('class-library', 'pi pi-bookmark', ['TE04', 'TE05'], 4),
    item('submissions', 'pi pi-inbox', ['TE09', 'TE10'], 4),
    item('central-library', 'pi pi-book', ['TE11', 'TE12'], 4),
    group('banks', 'pi pi-database', [
      item('activities', 'pi pi-database', ['ED05'], 4),
      item('offline-tests', 'pi pi-print', ['TE17'], 4)
    ]),
    group('production', 'pi pi-pencil', [
      item('upload-content', 'pi pi-upload', ['TE13'], 4),
      item('new-homework', 'pi pi-file-edit', ['TE14'], 4),
      item('quiz-builder', 'pi pi-question-circle', ['TE15'], 4),
      item('my-files', 'pi pi-folder', ['TE16'], 4)
    ]),
    feedback
  ],

  student: [
    item('home', 'pi pi-home', ['ST01'], 2),
    item('my-lessons', 'pi pi-book', ['ST02', 'ST03', 'ST04', 'ST05'], 2),
    item('my-library', 'pi pi-bookmark', ['ST05'], 2),
    item('my-assignments', 'pi pi-pencil', ['ST06', 'ST07', 'ST08', 'ST09'], 2),
    item('my-progress', 'pi pi-chart-line', ['ST10'], 2),
    feedback
  ],

  parent: [
    item('home', 'pi pi-home', ['PA01'], 3),
    item('children', 'pi pi-users', ['PA02', 'PA03', 'PA04'], 3),
    item('child-report', 'pi pi-chart-line', ['PA05'], 3),
    feedback
  ],

  support: [
    item('home', 'pi pi-home', ['SU01'], 8),
    item('tickets', 'pi pi-ticket', ['SU02'], 8),
    item('incidents', 'pi pi-exclamation-triangle', ['SU03'], 8),
    item('support-team', 'pi pi-users', ['SU04'], 8)
  ]
}

/** كل العناصر مسطّحة (للبحث عن عنوان شاشة ومرحلتها) */
export function flatItems(role) {
  const out = []
  const walk = (list) => list.forEach((i) => (i.children ? walk(i.children) : out.push(i)))
  walk(MENUS[role] || [])
  return out
}

export function findItem(role, key) {
  return flatItems(role).find((i) => i.key === key) || null
}

/** الشاشات المشتركة المتاحة لكل الأدوار (من رأس الصفحة) */
export const COMMON_SCREENS = ['profile', 'notifications', 'messages', 'feedback']

export const ROLE_ICONS = {
  super_admin: 'pi pi-crown',
  admin: 'pi pi-shield',
  editor: 'pi pi-pen-to-square',
  school_manager: 'pi pi-building',
  teacher: 'pi pi-graduation-cap',
  student: 'pi pi-book',
  parent: 'pi pi-heart',
  support: 'pi pi-wrench'
}
