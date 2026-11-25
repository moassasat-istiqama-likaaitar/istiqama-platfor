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
      // ——— المكتبة المركزية ———
      { path: 'central-library', name: 'central-library', component: () => import('@/views/library/LibraryView.vue'), meta: { roles: ['teacher', 'editor', 'admin', 'super_admin'] } },
      { path: 'library-manage', name: 'library-manage', component: () => import('@/views/library/LibraryView.vue'), meta: { roles: ['editor', 'admin', 'super_admin'] } },
      { path: 'forbidden', name: 'forbidden', component: () => import('@/views/errors/ForbiddenView.vue') },
      // كل شاشة لم تُبنَ بعد تفتح صفحة "قيد البناء" إن كانت موجودة في قائمة الدور
      { path: ':key', name: 'screen', component: () => import('@/views/common/PlaceholderView.vue') }
    ]
  },
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

  // صلاحية الشاشة حسب الصفة الحالية
  const roles = to.matched.flatMap((r) => r.meta.roles || [])
  if (roles.length && !roles.includes(auth.role)) return { name: 'forbidden' }
  if (to.name === 'screen') {
    const key = to.params.key
    if (!COMMON_SCREENS.includes(key) && !findItem(auth.role, key)) return { name: 'forbidden' }
  }
  return true
})

export default router
