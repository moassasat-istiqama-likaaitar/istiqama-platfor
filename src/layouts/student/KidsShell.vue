<template>
  <!-- البراعم: شريط علوي بسيط + لوحة أزرار سفلية كبيرة (مثل تطبيقات اللوحات) -->
  <div class="k-shell">
    <div class="school-ribbon" />
    <header class="k-top">
      <RouterLink :to="{ name: 'profile' }" class="k-me">
        <span class="k-me__av">{{ auth.initials }}</span>
        <span class="k-me__name">{{ auth.person.firstName }}</span>
      </RouterLink>
      <BrandPair v-if="brand.school" :school="brand.school" :branding="brand.branding" :size="34" class="k-brand" />
      <div class="k-top__mid">
        <span class="k-pill k-pill--star"><i class="pi pi-star-fill" /> {{ student.stars }}</span>
        <span class="k-pill k-pill--fire"><i class="pi pi-bolt" /> {{ student.streak }}</span>
      </div>
      <div class="k-top__end">
        <RouterLink :to="{ name: 'notifications' }" class="k-round" :aria-label="t('menu.notifications')">
          <i class="pi pi-bell" /><b v-if="inbox.unreadNotifications">{{ inbox.unreadNotifications }}</b>
        </RouterLink>
        <RouterLink :to="{ name: 'messages' }" class="k-round" :aria-label="t('menu.messages')">
          <i class="pi pi-envelope" /><b v-if="inbox.unreadMessages">{{ inbox.unreadMessages }}</b>
        </RouterLink>
        <RoleSwitcher v-if="auth.hasManyAssignments" />
        <UserMenu />
      </div>
    </header>

    <main class="k-main"><slot /></main>

    <nav class="k-dock">
      <RouterLink v-for="n in nav" :key="n.key" :to="n.to" class="k-dock__btn" :class="[`k-dock__btn--${n.key}`, { on: isActive(n) }]" @click="tap">
        <span class="k-dock__icon"><i :class="n.icon" /></span>
        <span class="k-dock__label">{{ n.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
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

const nav = [
  { key: 'home', to: '/app/home', icon: 'pi pi-home', label: 'بيتي', match: ['/app/home'] },
  { key: 'lessons', to: '/app/my-lessons', icon: 'pi pi-book', label: 'دروسي', match: ['/app/my-lessons', '/app/subject', '/app/lesson'] },
  { key: 'tasks', to: '/app/my-assignments', icon: 'pi pi-flag', label: 'تحدياتي', match: ['/app/my-assignments', '/app/activity'] },
  { key: 'stars', to: '/app/my-progress', icon: 'pi pi-star', label: 'نجومي', match: ['/app/my-progress'] }
]
const isActive = (n) => n.match.some((m) => route.path.startsWith(m))
const tap = () => chime('tap', 'kids')
</script>

<style scoped>
.k-shell { min-height: 100vh; padding-bottom: 130px; background: var(--bg); background-image: radial-gradient(color-mix(in srgb, var(--brand) 10%, transparent) 2px, transparent 2.5px); background-size: 30px 30px; }
.k-top { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem clamp(0.75rem, 3vw, 2rem); background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); }
.k-me { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; background: var(--surface); padding: 0.25rem 0.9rem 0.25rem 0.25rem; border-radius: 999px; box-shadow: var(--shadow); }
[dir='rtl'] .k-me { padding: 0.25rem 0.25rem 0.25rem 0.9rem; }
.k-me__av { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: var(--brand); color: #fff; font-weight: 800; font-size: 1.2rem; }
.k-me__name { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; color: var(--ink); }
.k-top__mid { display: flex; gap: 0.5rem; margin-inline: auto; }
.k-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 800; font-size: 1.15rem; background: var(--surface); box-shadow: var(--shadow); }
.k-pill--star i { color: #f5a400; font-size: 1.2rem; }
.k-pill--fire i { color: #ff6b2c; font-size: 1.2rem; }
.k-top__end { display: flex; align-items: center; gap: 0.4rem; }
.k-round { position: relative; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: var(--surface); color: var(--ink); text-decoration: none; box-shadow: var(--shadow); }
.k-round i { font-size: 1.2rem; }
.k-round b { position: absolute; top: -3px; inset-inline-end: -3px; min-width: 20px; height: 20px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.72rem; display: grid; place-items: center; }
.k-main { max-width: 1100px; margin: 0 auto; padding: 0.75rem clamp(0.75rem, 3vw, 2rem); }

.k-dock { position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 30; display: flex; gap: clamp(0.4rem, 2vw, 1rem); padding: 0.6rem clamp(0.6rem, 2vw, 1rem); background: var(--surface); border-radius: 32px; box-shadow: 0 14px 40px rgba(43, 35, 64, 0.18); }
.k-dock__btn { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; text-decoration: none; color: var(--muted); font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; min-width: 72px; }
.k-dock__icon { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 22px; background: var(--btn-soft); color: var(--btn); transition: transform 0.15s; box-shadow: 0 5px 0 color-mix(in srgb, var(--btn) 25%, transparent); }
.k-dock__icon i { font-size: 1.6rem; }
.k-dock__btn:active .k-dock__icon { transform: translateY(4px); box-shadow: none; }
.k-dock__btn.on .k-dock__icon { background: var(--btn); color: #fff; box-shadow: 0 5px 0 color-mix(in srgb, var(--btn) 60%, #000); transform: translateY(-4px); }
.k-dock__btn.on { color: var(--ink); }
.k-dock__btn--home { --btn: #ff6b4a; --btn-soft: #ffe6df; }
.k-dock__btn--lessons { --btn: #3ec1f3; --btn-soft: #ddf4fd; }
.k-dock__btn--tasks { --btn: #9b6bff; --btn-soft: #eee6ff; }
.k-dock__btn--stars { --btn: #f5a400; --btn-soft: #fff3cc; }
@media (max-width: 560px) {
  .k-me { display: none; }
  .k-pill { padding: 0.3rem 0.65rem; font-size: 1rem; }
  .k-round { width: 40px; height: 40px; }
  .k-dock__btn { min-width: 60px; font-size: 0.8rem; }
  .k-dock__icon { width: 54px; height: 54px; }
}
.k-brand { background: #fff; padding: 4px 10px; border-radius: 999px; box-shadow: 0 3px 0 rgba(0,0,0,.06); color: #1a1f36; }
@media (max-width: 640px) { .k-brand { display: none; } }
</style>
