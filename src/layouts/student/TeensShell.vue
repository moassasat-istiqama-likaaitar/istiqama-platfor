<template>
  <!-- الشباب: مساحة دراسة بشريط جانبي (التنقل + المواد) وبحث دائم في الأعلى -->
  <div class="t-shell">
    <aside class="t-side" :class="{ open: drawer }">
      <RouterLink :to="{ name: 'home' }" class="t-logo"><span class="t-logo__mark">ا</span>{{ t('app.short') }}</RouterLink>
      <nav class="t-nav">
        <RouterLink v-for="n in nav" :key="n.key" :to="n.to" class="t-nav__a" :class="{ on: isActive(n) }" @click="drawer = false">
          <i :class="n.icon" /> {{ n.label }}
          <span v-if="n.key === 'tasks' && todo" class="t-count">{{ todo }}</span>
        </RouterLink>
      </nav>
      <div class="t-side__title">موادي</div>
      <nav class="t-subjects">
        <RouterLink v-for="s in subjects" :key="s.id" :to="`/app/subject/${s.id}`" class="t-subj" :class="{ on: route.params.id === s.id }" @click="drawer = false">
          <span class="t-subj__dot" :style="{ background: s.color }" />
          <span class="t-subj__name">{{ s.name }}</span>
          <span class="t-subj__pct">{{ s.progress }}%</span>
        </RouterLink>
      </nav>
      <div class="t-side__foot"><i class="pi pi-bolt" /> {{ student.streak }} {{ t('student.streak') }}</div>
    </aside>
    <div v-if="drawer" class="t-scrim" @click="drawer = false" />

    <div class="t-main">
      <header class="t-top">
        <button type="button" class="t-burger" @click="drawer = true"><i class="pi pi-bars" /></button>
        <form class="t-search" @submit.prevent="search">
          <i class="pi pi-search" />
          <input v-model="q" :placeholder="t('student.searchPlaceholder')" />
        </form>
        <div class="t-top__end">
          <RouterLink :to="{ name: 'messages' }" class="t-icon"><i class="pi pi-envelope" /><b v-if="inbox.unreadMessages" /></RouterLink>
          <RouterLink :to="{ name: 'notifications' }" class="t-icon"><i class="pi pi-bell" /><b v-if="inbox.unreadNotifications" /></RouterLink>
          <LangSwitcher compact />
          <RoleSwitcher v-if="auth.hasManyAssignments" />
          <UserMenu />
        </div>
      </header>
      <main class="t-content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LangSwitcher from '@/components/LangSwitcher.vue'
import RoleSwitcher from '@/components/RoleSwitcher.vue'
import UserMenu from '@/components/UserMenu.vue'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'
import { useStudentStore } from '@/stores/student'
import * as learning from '@/api/learning'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const inbox = useInboxStore()
const student = useStudentStore()
const drawer = ref(false)
const q = ref('')
const dash = ref(null)
const subjects = computed(() => dash.value?.subjects || [])
const todo = computed(() => dash.value?.todoCount || 0)

const nav = [
  { key: 'home', to: '/app/home', icon: 'pi pi-calendar', label: 'أسبوعي', match: ['/app/home'] },
  { key: 'lessons', to: '/app/my-lessons', icon: 'pi pi-book', label: 'المقررات', match: ['/app/my-lessons'] },
  { key: 'tasks', to: '/app/my-assignments', icon: 'pi pi-check-square', label: 'الأعمال', match: ['/app/my-assignments', '/app/activity'] },
  { key: 'progress', to: '/app/my-progress', icon: 'pi pi-chart-bar', label: 'التحليلات', match: ['/app/my-progress'] }
]
const isActive = (n) => n.match.some((m) => route.path.startsWith(m))
function search() {
  router.push({ name: 'my-lessons', query: { q: q.value } })
}
onMounted(async () => {
  dash.value = await learning.dashboard(auth.person.id, auth.active.level.id)
})
</script>

<style scoped>
.t-shell { display: flex; min-height: 100vh; background: var(--bg); }
.t-side { position: sticky; top: 0; height: 100vh; width: 270px; flex-shrink: 0; display: flex; flex-direction: column; background: #17152b; color: #d8d6ea; padding: 1rem 0.8rem; overflow-y: auto; }
.t-logo { display: flex; align-items: center; gap: 0.6rem; color: #fff; text-decoration: none; font-weight: 700; font-size: 1.15rem; padding: 0.25rem 0.5rem 1rem; }
.t-logo__mark { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg, var(--brand), #2dd4bf); color: #fff; font-weight: 800; }
.t-nav { display: flex; flex-direction: column; gap: 2px; }
.t-nav__a { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.75rem; border-radius: 10px; color: #c9c6e0; text-decoration: none; font-weight: 600; font-size: 0.92rem; }
.t-nav__a:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.t-nav__a.on { background: rgba(255, 255, 255, 0.1); color: #fff; }
.t-nav__a i { width: 1.1rem; }
.t-count { margin-inline-start: auto; background: var(--brand); color: #fff; font-size: 0.72rem; padding: 0 0.5rem; border-radius: 999px; }
.t-side__title { margin: 1.4rem 0.75rem 0.5rem; font-size: 0.72rem; letter-spacing: 0.02em; color: #8a87a8; font-weight: 700; }
.t-subjects { display: flex; flex-direction: column; gap: 1px; }
.t-subj { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 10px; color: #c9c6e0; text-decoration: none; font-size: 0.88rem; }
.t-subj:hover, .t-subj.on { background: rgba(255, 255, 255, 0.07); color: #fff; }
.t-subj__dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
.t-subj__name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t-subj__pct { font-size: 0.75rem; color: #8a87a8; font-variant-numeric: tabular-nums; }
.t-side__foot { margin-top: auto; padding: 0.75rem; font-size: 0.82rem; color: #a5a2c2; display: flex; gap: 0.4rem; align-items: center; }
.t-side__foot i { color: #ffb020; }

.t-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.t-top { position: sticky; top: 0; z-index: 15; display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1.5rem; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.t-burger { display: none; border: 0; background: none; font-size: 1.2rem; color: var(--ink); cursor: pointer; }
.t-search { flex: 1; max-width: 520px; position: relative; }
.t-search i { position: absolute; top: 50%; transform: translateY(-50%); inset-inline-start: 0.85rem; color: var(--muted); }
.t-search input { width: 100%; padding: 0.6rem 0.9rem; padding-inline-start: 2.4rem; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font: inherit; font-size: 0.9rem; color: var(--ink); outline: none; }
.t-search input:focus { border-color: var(--brand); }
.t-top__end { display: flex; align-items: center; gap: 0.25rem; margin-inline-start: auto; }
.t-icon { position: relative; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; color: var(--muted); text-decoration: none; }
.t-icon:hover { background: var(--surface); color: var(--ink); }
.t-icon b { position: absolute; top: 8px; inset-inline-end: 8px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
.t-content { padding: 1.5rem; max-width: 1200px; width: 100%; margin: 0 auto; }
.t-scrim { display: none; }
@media (max-width: 980px) {
  .t-side { position: fixed; inset-block: 0; inset-inline-start: 0; z-index: 40; transform: translateX(100%); transition: transform 0.25s; }
  [dir='ltr'] .t-side { transform: translateX(-100%); }
  .t-side.open { transform: none !important; }
  .t-scrim { display: block; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 35; }
  .t-burger { display: block; }
  .t-content { padding: 1rem; }
  .t-top { padding: 0.6rem 0.9rem; }
}
</style>
