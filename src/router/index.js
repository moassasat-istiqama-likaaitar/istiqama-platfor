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
  if (to.name === 'screen') {
    const key = to.params.key
    if (!COMMON_SCREENS.includes(key) && !findItem(auth.role, key)) return { name: 'forbidden' }
  }
  return true
})

export default router
