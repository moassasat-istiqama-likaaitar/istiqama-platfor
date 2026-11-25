<template>
  <!-- المستكشفون: رأس بتبويبات + بطاقة المستوى (نقاط الخبرة) دائماً ظاهرة -->
  <div class="j-shell">
    <header class="j-top">
      <div class="j-top__row">
        <RouterLink :to="{ name: 'home' }" class="j-logo"><BrandPair :school="brand.school" :branding="brand.branding" :size="36" tone="light" names /></RouterLink>
        <div class="j-level" v-tooltip.bottom="`${student.stars} XP`">
          <span class="j-level__badge">{{ level }}</span>
          <div class="j-level__info">
            <small>مستوى المستكشف</small>
            <div class="j-level__bar"><span :style="{ width: (student.stars % 100) + '%' }" /></div>
          </div>
        </div>
        <span class="j-streak"><i class="pi pi-bolt" /> {{ student.streak }}</span>
        <div class="j-top__end">
          <RouterLink :to="{ name: 'messages' }" class="j-icon" :aria-label="t('menu.messages')"><i class="pi pi-envelope" /><b v-if="inbox.unreadMessages">{{ inbox.unreadMessages }}</b></RouterLink>
          <RouterLink :to="{ name: 'notifications' }" class="j-icon" :aria-label="t('menu.notifications')"><i class="pi pi-bell" /><b v-if="inbox.unreadNotifications">{{ inbox.unreadNotifications }}</b></RouterLink>
          <LangSwitcher compact class="hide-sm" />
          <RoleSwitcher v-if="auth.hasManyAssignments" />
          <UserMenu />
        </div>
      </div>
      <nav class="j-tabs">
        <RouterLink v-for="n in nav" :key="n.key" :to="n.to" class="j-tab" :class="{ on: isActive(n) }" @click="tap">
          <i :class="n.icon" /><span>{{ n.label }}</span>
        </RouterLink>
      </nav>
      <div class="school-ribbon" />
    </header>
    <main class="j-main"><slot /></main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LangSwitcher from '@/components/LangSwitcher.vue'
import RoleSwitcher from '@/components/RoleSwitcher.vue'
import BrandPair from '@/components/brand/BrandPair.vue'
import { useBrandStore } from '@/stores/brand'
import UserMenu from '@/components/UserMenu.vue'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'
import { useStudentStore } from '@/stores/student'
import { chime } from '@/utils/celebrate'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const brand = useBrandStore()
const inbox = useInboxStore()
const student = useStudentStore()
const level = computed(() => Math.floor(student.stars / 100) + 1)

const nav = [
  { key: 'home', to: '/app/home', icon: 'pi pi-map', label: 'لوحة المهام', match: ['/app/home'] },
  { key: 'lessons', to: '/app/my-lessons', icon: 'pi pi-compass', label: 'المواد', match: ['/app/my-lessons', '/app/subject', '/app/lesson'] },
  { key: 'tasks', to: '/app/my-assignments', icon: 'pi pi-list-check', label: 'سجل المهام', match: ['/app/my-assignments', '/app/activity'] },
  { key: 'progress', to: '/app/my-progress', icon: 'pi pi-trophy', label: 'إنجازاتي', match: ['/app/my-progress'] }
]
const isActive = (n) => n.match.some((m) => route.path.startsWith(m))
const tap = () => chime('tap', 'juniors')
</script>

<style scoped>
.j-shell { min-height: 100vh; background: var(--bg); }
.j-top { position: sticky; top: 0; z-index: 20; background: linear-gradient(120deg, #0a7fc0, #0a9bdc 60%, #22b4c8); color: #fff; box-shadow: 0 6px 20px rgba(10, 155, 220, 0.25); }
.j-top__row { display: flex; align-items: center; gap: 1rem; padding: 0.65rem clamp(0.75rem, 3vw, 2rem); max-width: 1240px; margin: 0 auto; }
.j-logo { display: flex; align-items: center; gap: 0.5rem; color: #fff; text-decoration: none; font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; }
.j-logo__mark { width: 38px; height: 38px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: grid; place-items: center; }
.j-level { display: flex; align-items: center; gap: 0.55rem; background: rgba(255, 255, 255, 0.15); padding: 0.3rem 0.8rem 0.3rem 0.35rem; border-radius: 999px; margin-inline-start: auto; }
[dir='rtl'] .j-level { padding: 0.3rem 0.35rem 0.3rem 0.8rem; }
.j-level__badge { width: 34px; height: 34px; border-radius: 50%; background: #8ac926; display: grid; place-items: center; font-weight: 800; box-shadow: 0 3px 0 #5f9a12; }
.j-level__info small { font-size: 0.7rem; opacity: 0.9; display: block; }
.j-level__bar { width: 110px; height: 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.25); overflow: hidden; }
.j-level__bar span { display: block; height: 100%; background: #c6f36b; border-radius: inherit; }
.j-streak { display: flex; gap: 0.3rem; align-items: center; font-weight: 800; background: rgba(255, 255, 255, 0.15); padding: 0.35rem 0.75rem; border-radius: 999px; }
.j-streak i { color: #ffd166; }
.j-top__end { display: flex; align-items: center; gap: 0.3rem; }
.j-top__end :deep(.p-button) { color: #fff !important; }
.j-icon { position: relative; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; color: #fff; text-decoration: none; }
.j-icon:hover { background: rgba(255, 255, 255, 0.15); }
.j-icon b { position: absolute; top: 0; inset-inline-end: 0; min-width: 17px; height: 17px; border-radius: 999px; background: #ff5a5f; font-size: 0.66rem; display: grid; place-items: center; }
.j-tabs { display: flex; gap: 0.25rem; padding: 0 clamp(0.75rem, 3vw, 2rem); max-width: 1240px; margin: 0 auto; overflow-x: auto; }
.j-tab { display: flex; align-items: center; gap: 0.45rem; padding: 0.65rem 1rem; color: rgba(255, 255, 255, 0.85); text-decoration: none; font-weight: 700; border-radius: 14px 14px 0 0; white-space: nowrap; }
.j-tab.on { background: var(--bg); color: var(--brand); }
.j-main { max-width: 1240px; margin: 0 auto; padding: 1.25rem clamp(0.75rem, 3vw, 2rem) 2.5rem; }
@media (max-width: 760px) {
  .j-level__bar, .j-level__info, .hide-sm { display: none; }
  .j-logo { font-size: 1rem; }
  .j-logo :deep(.pair__names) { display: none; }
  .j-top__row { gap: 0.5rem; }
  .j-tab span { font-size: 0.82rem; }
}
</style>
