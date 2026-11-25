<template>
  <StudentHome v-if="auth.role === 'student'" />
  <div v-else>
    <section class="hero">
      <div>
        <h1>{{ t('home.greeting', { name: auth.person.firstName }) }}</h1>
        <p>
          <i :class="ROLE_ICONS[auth.role]" />
          {{ t('home.as', { role: label.full(auth.active) }) }}
        </p>
        <p v-if="label.detail(auth.active)" class="hero__detail">{{ label.detail(auth.active) }}</p>
      </div>
      <div class="hero__stats">
        <RouterLink :to="{ name: 'notifications' }" class="stat">
          <strong>{{ inbox.unreadNotifications }}</strong>
          <span>{{ t('menu.notifications') }}</span>
        </RouterLink>
        <RouterLink :to="{ name: 'messages' }" class="stat">
          <strong>{{ inbox.unreadMessages }}</strong>
          <span>{{ t('menu.messages') }}</span>
        </RouterLink>
      </div>
    </section>

    <Message severity="info" class="note" :closable="false">
      <i class="pi pi-wrench" /> {{ t('home.phaseNote', { phase: homePhase }) }}
    </Message>

    <h2 class="section-title">{{ t('home.quickAccess') }}</h2>
    <div class="tiles">
      <RouterLink v-for="i in tiles" :key="i.key" :to="i.to" class="tile">
        <span class="tile__icon"><i :class="i.icon" /></span>
        <span class="tile__label">{{ t(`menu.${i.key}`) }}</span>
        <span class="tile__codes">{{ i.codes.join(' · ') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Message from 'primevue/message'
import StudentHome from '@/views/student/StudentHome.vue'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'
import { flatItems, findItem, ROLE_ICONS } from '@/config/menus'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const { t } = useI18n()
const auth = useAuthStore()
const inbox = useInboxStore()
const label = useAssignmentLabel()

const tiles = computed(() => flatItems(auth.role).filter((i) => i.key !== 'home'))
const homePhase = computed(() => {
  const p = findItem(auth.role, 'home')?.phase
  return p ? `${p} (${t(`placeholder.phases.${p}`)})` : ''
})
</script>

<style scoped>
.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1.75rem;
  border-radius: 20px;
  color: var(--p-primary-contrast-color);
  background: linear-gradient(135deg, var(--p-primary-600), var(--p-primary-800));
  box-shadow: 0 16px 40px color-mix(in srgb, var(--p-primary-color) 25%, transparent);
}
.hero h1 { margin: 0 0 0.4rem; font-size: 1.6rem; }
.hero p { margin: 0; opacity: 0.92; display: flex; gap: 0.5rem; align-items: center; }
.hero__detail { font-size: 0.85rem; opacity: 0.8 !important; margin-top: 0.25rem !important; }
.hero__stats { display: flex; gap: 0.75rem; }
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 96px;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  color: inherit;
  text-decoration: none;
}
.stat strong { font-size: 1.6rem; line-height: 1.1; }
.stat span { font-size: 0.78rem; opacity: 0.9; }
.note { margin: 1.25rem 0; }
.section-title { font-size: 1.05rem; margin: 1.5rem 0 0.75rem; }
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.85rem; }
.tile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem;
  border-radius: 16px;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, border-color 0.15s;
}
.tile:hover { transform: translateY(-2px); border-color: var(--p-primary-color); }
.tile__icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: var(--p-primary-50); color: var(--p-primary-600); }
.tile__label { font-weight: 700; }
.tile__codes { font-size: 0.7rem; color: var(--p-text-muted-color); direction: ltr; text-align: end; }
[dir='rtl'] .tile__codes { text-align: start; }
</style>
