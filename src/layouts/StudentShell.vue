<template>
  <div class="st-shell" :class="`st-shell--${auth.themeKey}`">
    <div class="st-bg" aria-hidden="true">
      <span class="blob b1" /><span class="blob b2" /><span class="blob b3" />
    </div>

    <header class="st-top">
      <RouterLink :to="{ name: 'home' }" class="st-logo">
        <span class="st-logo__mark"><Mascot :color="'#ffc93c'" :accent="'#fff'" /></span>
        <span class="st-logo__text">{{ t('app.short') }}</span>
      </RouterLink>

      <nav class="st-nav">
        <RouterLink v-for="n in nav" :key="n.key" :to="n.to" class="st-nav__link" :class="{ 'is-active': isActive(n) }" @click="tap">
          <i :class="n.icon" /><span>{{ t(`student.nav.${n.key}`) }}</span>
        </RouterLink>
      </nav>

      <div class="st-top__end">
        <span class="st-stat st-stat--streak" v-tooltip.bottom="`${student.streak} ${t('student.streak')}`">
          <i class="pi pi-bolt" /> {{ student.streak }}
        </span>
        <span class="st-stat st-stat--stars" v-tooltip.bottom="`${student.stars} ${t('student.stars')}`">
          <i class="pi pi-star-fill" /> {{ student.stars }}
        </span>
        <RouterLink :to="{ name: 'messages' }" class="st-icon" :aria-label="t('menu.messages')">
          <i class="pi pi-envelope" /><span v-if="inbox.unreadMessages" class="st-dot">{{ inbox.unreadMessages }}</span>
        </RouterLink>
        <RouterLink :to="{ name: 'notifications' }" class="st-icon" :aria-label="t('menu.notifications')">
          <i class="pi pi-bell" /><span v-if="inbox.unreadNotifications" class="st-dot">{{ inbox.unreadNotifications }}</span>
        </RouterLink>
        <LangSwitcher compact class="hide-sm" />
        <RoleSwitcher v-if="auth.hasManyAssignments" />
        <UserMenu />
      </div>
    </header>

    <main class="st-main">
      <slot />
    </main>

    <!-- شريط سفلي للهاتف -->
    <nav class="st-tabbar">
      <RouterLink v-for="n in nav" :key="n.key" :to="n.to" class="st-tab" :class="{ 'is-active': isActive(n) }" @click="tap">
        <span class="st-tab__icon"><i :class="n.icon" /></span>
        <span>{{ t(`student.nav.${n.key}`) }}</span>
      </RouterLink>
    </nav>

    <CelebrationDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Mascot from '@/components/art/Mascot.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import RoleSwitcher from '@/components/RoleSwitcher.vue'
import UserMenu from '@/components/UserMenu.vue'
import CelebrationDialog from '@/components/student/CelebrationDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'
import { useStudentStore } from '@/stores/student'
import { chime } from '@/utils/celebrate'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const inbox = useInboxStore()
const student = useStudentStore()

const nav = [
  { key: 'home', to: '/app/home', icon: 'pi pi-home', match: ['/app/home'] },
  { key: 'lessons', to: '/app/my-lessons', icon: 'pi pi-book', match: ['/app/my-lessons', '/app/subject', '/app/lesson'] },
  { key: 'assignments', to: '/app/my-assignments', icon: 'pi pi-pencil', match: ['/app/my-assignments', '/app/activity'] },
  { key: 'progress', to: '/app/my-progress', icon: 'pi pi-chart-line', match: ['/app/my-progress'] }
]
const isActive = (n) => n.match.some((m) => route.path.startsWith(m))
const tap = () => chime('tap', auth.themeKey)

onMounted(() => student.refresh())
</script>

<style scoped>
.st-shell { min-height: 100vh; position: relative; isolation: isolate; padding-bottom: 2rem; }

/* خلفية حيّة لكل ثيم */
.st-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(2px); opacity: 0.55; }
.b1 { width: 420px; height: 420px; top: -140px; inset-inline-end: -120px; background: color-mix(in srgb, var(--brand) 22%, transparent); }
.b2 { width: 300px; height: 300px; bottom: -80px; inset-inline-start: -80px; background: color-mix(in srgb, var(--accent) 35%, transparent); }
.b3 { width: 180px; height: 180px; top: 40%; inset-inline-start: 45%; background: color-mix(in srgb, var(--accent-2) 22%, transparent); }
.st-shell--kids .st-bg {
  background-image: radial-gradient(color-mix(in srgb, var(--brand) 12%, transparent) 2px, transparent 2.5px);
  background-size: 34px 34px;
}
.st-shell--teens .blob { opacity: 0.35; filter: blur(30px); }

/* الرأس */
.st-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem clamp(0.75rem, 3vw, 2rem);
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(14px);
}
.st-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.st-logo__mark { width: 44px; height: 44px; border-radius: 14px; background: var(--brand); display: grid; place-items: center; padding: 4px; box-shadow: 0 4px 0 color-mix(in srgb, var(--brand) 60%, #000); }
.st-logo__text { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; color: var(--ink); }

.st-nav { display: flex; gap: 0.35rem; margin-inline: auto; background: var(--surface); padding: 0.35rem; border-radius: 999px; box-shadow: var(--shadow); }
.st-nav__link {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.2s;
}
.st-nav__link:hover { color: var(--ink); }
.st-nav__link.is-active { background: var(--brand); color: #fff; box-shadow: 0 3px 0 color-mix(in srgb, var(--brand) 55%, #000); }

.st-top__end { display: flex; align-items: center; gap: 0.4rem; }
.st-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.95rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.st-stat--stars i { color: #f5a400; }
.st-stat--streak i { color: #ff6b2c; }
.st-icon { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; color: var(--muted); text-decoration: none; }
.st-icon:hover { background: var(--surface); color: var(--ink); }
.st-icon i { font-size: 1.1rem; }
.st-dot { position: absolute; top: 2px; inset-inline-end: 0; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 800; display: grid; place-items: center; }

.st-main { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0.75rem clamp(0.75rem, 3vw, 2rem) 2rem; }

.st-tabbar { display: none; }

@media (max-width: 900px) {
  .st-nav { display: none; }
  .st-top { gap: 0.4rem; }
  .st-top__end { margin-inline-start: auto; }
  .st-shell { padding-bottom: 90px; }
  .st-tabbar {
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 10px;
    z-index: 30;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: var(--surface);
    border-radius: calc(var(--radius) + 6px);
    box-shadow: var(--shadow-lg);
    padding: 0.4rem;
  }
  .st-tab { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.35rem 0; text-decoration: none; color: var(--muted); font-weight: 700; font-size: 0.72rem; }
  .st-tab__icon { display: grid; place-items: center; width: 44px; height: 32px; border-radius: 999px; transition: all 0.2s; }
  .st-tab__icon i { font-size: 1.15rem; }
  .st-tab.is-active { color: var(--brand); }
  .st-tab.is-active .st-tab__icon { background: var(--brand); color: #fff; }
}
@media (max-width: 560px) {
  .st-logo__text, .hide-sm { display: none; }
  .st-stat { padding: 0.3rem 0.55rem; font-size: 0.85rem; }
  .st-icon { width: 34px; }
}
</style>
