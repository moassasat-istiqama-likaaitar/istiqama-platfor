<template>
  <!-- الهيكل العام للطاقم — الشريط الجانبي (القائمة) والشريط العلوي (الدور، الإشعارات، الرسائل، اللغة) -->
  <StudentShell v-if="auth.role === 'student'">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath + auth.activeAssignmentId" />
      </Transition>
    </RouterView>
  </StudentShell>
  <div v-else class="shell">
    <!-- القائمة الجانبية (سطح المكتب) -->
    <aside class="shell__aside">
      <div class="school-ribbon" />
      <div class="brand">
        <BrandPair :school="brand.school" :branding="brand.branding" :size="38" names />
      </div>
      <div class="shell__nav"><SideNav /></div>
      <div class="shell__demo"><i class="pi pi-eye" /> {{ t('layout.demoMode') }}</div>
    </aside>

    <!-- القائمة الجانبية (الهاتف) -->
    <Drawer v-model:visible="drawer" :position="isRtl ? 'right' : 'left'" class="shell__drawer" :header="t('app.short')">
      <SideNav @navigate="drawer = false" />
    </Drawer>

    <div class="shell__main">
      <div class="topwrap">
      <header class="topbar">
        <Button class="topbar__burger" icon="pi pi-bars" text rounded severity="secondary" :aria-label="t('layout.openMenu')" @click="drawer = true" />
        <DateBadge class="topbar__date" />
        <div class="topbar__spacer" />
        <SeasonSwitcher />
        <LangSwitcher compact />
        <RouterLink :to="{ name: 'messages' }" custom v-slot="{ navigate }">
          <OverlayBadge v-if="inbox.unreadMessages" :value="inbox.unreadMessages" severity="danger" size="small">
            <Button icon="pi pi-envelope" text rounded severity="secondary" :aria-label="t('menu.messages')" @click="navigate" />
          </OverlayBadge>
          <Button v-else icon="pi pi-envelope" text rounded severity="secondary" :aria-label="t('menu.messages')" @click="navigate" />
        </RouterLink>
        <NotificationBell />
        <RoleSwitcher />
        <UserMenu />
      </header>
      <SeasonBanner />
      </div>

      <main class="content">
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path + auth.activeAssignmentId" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import BrandPair from '@/components/brand/BrandPair.vue'
import { useBrandStore } from '@/stores/brand'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import OverlayBadge from 'primevue/overlaybadge'
import SideNav from '@/components/SideNav.vue'
import DateBadge from '@/components/DateBadge.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import SeasonSwitcher from '@/components/SeasonSwitcher.vue'
import SeasonBanner from '@/components/SeasonBanner.vue'
import RoleSwitcher from '@/components/RoleSwitcher.vue'
import UserMenu from '@/components/UserMenu.vue'
import StudentShell from '@/layouts/StudentShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'

const { t, locale } = useI18n()
const auth = useAuthStore()
const brand = useBrandStore()
const inbox = useInboxStore()
const drawer = ref(false)
const isRtl = computed(() => locale.value === 'ar')

watch(
  () => auth.person?.id,
  (id) => id && inbox.load(id),
  { immediate: true }
)
</script>

<style scoped>
.shell { display: flex; min-height: 100vh; }

.shell__aside {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 264px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--p-content-background);
  border-inline-end: 1px solid var(--p-content-border-color);
}
.brand { display: flex; align-items: center; gap: 0.75rem; padding: 1.1rem 1.25rem; }
.brand__logo {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 1.4rem;
  font-weight: 700;
}
.brand__text { display: flex; flex-direction: column; line-height: 1.2; }
.brand__text strong { font-size: 1.05rem; }
.brand__text small { color: var(--p-text-muted-color); font-size: 0.75rem; }
.shell__nav { flex: 1; overflow-y: auto; padding: 0.5rem 0.75rem 1rem; }
.shell__demo {
  margin: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: var(--p-content-hover-background);
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.shell__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topwrap { position: sticky; top: 0; z-index: 10; }
.topbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1.25rem;
  background: color-mix(in srgb, var(--p-content-background) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--p-content-border-color);
}
.topbar__spacer { flex: 1; }
.topbar__burger { display: none; }
.content { padding: 1.5rem; width: 100%; max-width: 1280px; margin-inline: auto; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .shell__aside { display: none; }
  .topbar__burger { display: inline-flex; }
}
@media (max-width: 640px) {
  .topbar { padding: 0.5rem 0.6rem; gap: 0.15rem; }
  .topbar__date { display: none; }
  .content { padding: 1rem 0.85rem; }
}
</style>
