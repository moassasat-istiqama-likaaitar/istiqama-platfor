import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { findItem, COMMON_SCREENS } from '@/config/menus'

/**
 * التوجيه بالـ hash (#/app/...) ليعمل النموذج على أي استضافة ثابتة دون إعدادات خادم.
 */
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
      // صفحة دخول خاصة بكل مدرسة: #/s/nour
      { path: 's/:slug', name: 'school-login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
      { path: 'forgot-password', name: 'forgot', component: () => import('@/views/auth/ForgotPasswordView.vue'), meta: { guest: true } },
      { path: 'choose-role', name: 'choose-role', component: () => import('@/views/auth/ChooseRoleView.vue'), meta: { auth: true, noRole: true } }
    ]
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', redirect: '/app/home' },
      { path: 'home', name: 'home', component: () => import('@/views/common/HomeView.vue') },
      { path: 'profile', name: 'profile', component: () => import('@/views/common/ProfileView.vue') },
      { path: 'notifications', name: 'notifications', component: () => import('@/views/common/NotificationsView.vue') },
      { path: 'messages/:id?', name: 'messages', component: () => import('@/views/common/MessagesView.vue') },
      { path: 'feedback', name: 'feedback', component: () => import('@/views/common/FeedbackView.vue') },
      // ——— فضاء التلميذ ———
      { path: 'my-lessons', name: 'my-lessons', component: () => import('@/views/student/StudentLessons.vue'), meta: { roles: ['student'] } },
      { path: 'subject/:id', name: 'subject', component: () => import('@/views/student/StudentSubject.vue'), meta: { roles: ['student'] } },
      { path: 'lesson/:id', name: 'lesson', component: () => import('@/views/student/LessonView.vue'), meta: { roles: ['student'] } },
      { path: 'my-assignments', name: 'my-assignments', component: () => import('@/views/student/StudentAssignments.vue'), meta: { roles: ['student'] } },
      { path: 'activity/:id', name: 'activity', component: () => import('@/views/student/ActivityView.vue'), meta: { roles: ['student'] } },
      { path: 'my-progress', name: 'my-progress', component: () => import('@/views/student/StudentProgress.vue'), meta: { roles: ['student'] } },
      { path: 'my-library', name: 'my-library', component: () => import('@/views/student/StudentLibrary.vue'), meta: { roles: ['student'] } },
      // ——— فضاء الولي ———
      { path: 'children', name: 'children', component: () => import('@/views/parent/ChildrenView.vue'), meta: { roles: ['parent'] } },
      { path: 'child-report', name: 'child-report', component: () => import('@/views/parent/ChildReportView.vue'), meta: { roles: ['parent'] } },
      // ——— فضاء المعلم ———
      { path: 'my-classes', name: 'my-classes', component: () => import('@/views/teacher/MyClassesView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'class-library', name: 'class-library', component: () => import('@/views/teacher/ClassLibraryView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'submissions', name: 'submissions', component: () => import('@/views/teacher/SubmissionsView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'upload-content', name: 'upload-content', component: () => import('@/views/teacher/UploadContentView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'new-homework', name: 'new-homework', component: () => import('@/views/teacher/NewHomeworkView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'quiz-builder', name: 'quiz-builder', component: () => import('@/views/teacher/QuizBuilderView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'my-files', name: 'my-files', component: () => import('@/views/teacher/MyFilesView.vue'), meta: { roles: ['teacher', 'editor'] } },
      { path: 'offline-tests', name: 'offline-tests', component: () => import('@/views/teacher/OfflineTestsView.vue'), meta: { roles: ['teacher', 'editor'] } },
      // ——— التحرير ———
      { path: 'lesson-opening', name: 'lesson-opening', component: () => import('@/views/editor/LessonOpeningView.vue'), meta: { roles: ['editor'] } },
      { path: 'activities-review', name: 'activities-review', component: () => import('@/views/editor/ReviewView.vue'), meta: { roles: ['editor', 'admin', 'super_admin'] } },
      { path: 'library-review', name: 'library-review', component: () => import('@/views/editor/ReviewView.vue'), meta: { roles: ['editor', 'admin', 'super_admin'] } },
      { path: 'activities', name: 'activities', component: () => import('@/views/library/ActivitiesBankView.vue'), meta: { roles: ['teacher', 'editor', 'admin', 'super_admin'] } },
      { path: 'editor-reports', name: 'editor-reports', component: () => import('@/views/editor/EditorReports.vue'), meta: { roles: ['editor'] } },
      // ——— مدير المدرسة ———
      { path: 'teachers', name: 'teachers', component: () => import('@/views/users/UsersView.vue'), props: { role: 'teacher', title: 'المعلمون', subtitle: 'معلمو المدرسة وأقسامهم وموادهم.' }, meta: { roles: ['school_manager'] } },
      { path: 'students', name: 'students', component: () => import('@/views/users/UsersView.vue'), props: { role: 'student', title: 'التلاميذ', subtitle: 'تلاميذ المدرسة وتقدّمهم ومعدلاتهم.' }, meta: { roles: ['school_manager'] } },
      { path: 'parents', name: 'parents', component: () => import('@/views/users/UsersView.vue'), props: { role: 'parent', title: 'الأولياء', subtitle: 'أولياء تلاميذ المدرسة وأبناؤهم.' }, meta: { roles: ['school_manager'] } },
      { path: 'activation', name: 'activation', component: () => import('@/views/manager/ActivationView.vue'), meta: { roles: ['school_manager'] } },
      { path: 'school-classes', name: 'school-classes', component: () => import('@/views/manager/SchoolClassesView.vue'), meta: { roles: ['school_manager'] } },
      { path: 'teacher-files-review', name: 'teacher-files-review', component: () => import('@/views/manager/TeacherFilesReview.vue'), meta: { roles: ['school_manager'] } },
      { path: 'content-follow', name: 'content-follow', component: () => import('@/views/manager/ContentFollowView.vue'), meta: { roles: ['school_manager'] } },
      { path: 'performance', name: 'performance', component: () => import('@/views/manager/PerformanceView.vue'), meta: { roles: ['school_manager'] } },
      { path: 'school-notice', name: 'school-notice', component: () => import('@/views/manager/SchoolNoticeView.vue'), meta: { roles: ['school_manager'] } },
      // ——— الإدارة العامة ———
      { path: 'users-list', name: 'users-list', component: () => import('@/views/users/UsersView.vue'), props: { scope: 'all', title: 'قائمة المستخدمين', subtitle: 'كل الأشخاص في المنصة وأدوارهم. شخص واحد = حساب واحد بأدوار متعددة.' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'users-import', name: 'users-import', component: () => import('@/views/admin/ImportView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'users-duplicates', name: 'users-duplicates', component: () => import('@/views/admin/DuplicatesView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'activity-log', name: 'activity-log', component: () => import('@/views/admin/ActivityLogView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'reports-general', name: 'reports-general', component: () => import('@/views/admin/ReportsView.vue'), props: { kind: 'general' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'reports-schools', name: 'reports-schools', component: () => import('@/views/admin/ReportsView.vue'), props: { kind: 'schools' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'reports-files', name: 'reports-files', component: () => import('@/views/admin/ReportsView.vue'), props: { kind: 'files' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'reports-engagement', name: 'reports-engagement', component: () => import('@/views/admin/ReportsView.vue'), props: { kind: 'engagement' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'schools', name: 'schools', component: () => import('@/views/admin/SchoolsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'levels', name: 'levels', component: () => import('@/views/admin/LevelsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'seasons', name: 'seasons', component: () => import('@/views/admin/SeasonsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'classes-all', name: 'classes-all', component: () => import('@/views/manager/SchoolClassesView.vue'), props: { scope: 'all' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'subjects', name: 'subjects', component: () => import('@/views/admin/SubjectsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'permissions', name: 'permissions', component: () => import('@/views/admin/PermissionsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'customization', name: 'customization', component: () => import('@/views/admin/CustomizationView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'announcements', name: 'announcements', component: () => import('@/views/manager/SchoolNoticeView.vue'), props: { scope: 'all' }, meta: { roles: ['admin', 'super_admin'] } },
      { path: 'calendar', name: 'calendar', component: () => import('@/views/admin/CalendarView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'communication', name: 'communication', component: () => import('@/views/admin/CommunicationView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'import-export', name: 'import-export', component: () => import('@/views/admin/ImportExportView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      // ——— الدعم الفني ———
      { path: 'tickets', name: 'tickets', component: () => import('@/views/support/TicketsView.vue'), meta: { roles: ['support', 'admin', 'super_admin'] } },
      { path: 'incidents', name: 'incidents', component: () => import('@/views/support/IncidentsView.vue'), meta: { roles: ['support'] } },
      { path: 'support-team', name: 'support-team', component: () => import('@/views/support/SupportTeamView.vue'), meta: { roles: ['support'] } },
      // ——— المكتبة المركزية ———
      { path: 'central-library', name: 'central-library', component: () => import('@/views/library/LibraryView.vue'), meta: { roles: ['teacher', 'editor', 'admin', 'super_admin'] } },
      { path: 'library-manage', name: 'library-manage', component: () => import('@/views/library/LibraryView.vue'), meta: { roles: ['editor', 'admin', 'super_admin'] } },
      // ——— هوية المدارس ———
      { path: 'school-identity', name: 'school-identity', component: () => import('@/views/branding/SchoolIdentityView.vue'), meta: { roles: ['school_manager'] } },
      { path: 'branding-requests', name: 'branding-requests', component: () => import('@/views/branding/BrandingRequestsView.vue'), meta: { roles: ['admin', 'super_admin'] } },
      { path: 'forbidden', name: 'forbidden', component: () => import('@/views/errors/ForbiddenView.vue') },
      // كل شاشة لم تُبنَ بعد تفتح صفحة "قيد البناء" إن كانت موجودة في قائمة الدور
      { path: ':key', name: 'screen', component: () => import('@/views/common/PlaceholderView.vue') }
    ]
  },
  // صفحات الطباعة (خارج القالب)
  { path: '/print/offline-test/:id', name: 'offline-print', component: () => import('@/views/print/OfflineTestPrint.vue'), meta: { auth: true, roles: ['teacher', 'editor'] } },
  { path: '/print/report-card', name: 'report-card', component: () => import('@/views/print/ReportCardView.vue'), meta: { auth: true, roles: ['student', 'parent'] } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/errors/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  const needsAuth = to.matched.some((r) => r.meta.auth)
  if (needsAuth && !auth.isAuthenticated) return { name: 'login', query: { next: to.fullPath } }
  if (to.meta.guest && auth.isAuthenticated) return auth.active ? { name: 'home' } : { name: 'choose-role' }
  if (needsAuth && !to.meta.noRole && !auth.active) return { name: 'choose-role' }

  // صلاحية الشاشة حسب الدور الحالي
  const roles = to.matched.flatMap((r) => r.meta.roles || [])
  if (roles.length && !roles.includes(auth.role)) return { name: 'forbidden' }
  if (to.name === 'screen') {
    const key = to.params.key
    if (!COMMON_SCREENS.includes(key) && !findItem(auth.role, key)) return { name: 'forbidden' }
  }
  return true
})

export default router
