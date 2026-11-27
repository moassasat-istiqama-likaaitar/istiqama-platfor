<template>
  <OverlayBadge v-if="inbox.unreadNotifications" :value="inbox.unreadNotifications" severity="danger" size="small">
    <Button icon="pi pi-bell" text rounded severity="secondary" :aria-label="t('notifications.title')" @click="pop.toggle($event)" />
  </OverlayBadge>
  <Button v-else icon="pi pi-bell" text rounded severity="secondary" :aria-label="t('notifications.title')" @click="pop.toggle($event)" />

  <Popover ref="pop">
    <div class="bell">
      <div class="bell__head">
        <strong>{{ t('notifications.title') }}</strong>
        <Button
          v-if="inbox.unreadNotifications"
          :label="t('notifications.markAll')"
          text
          size="small"
          @click="inbox.markAllRead(auth.person.id)"
        />
      </div>
      <div v-if="latest.length" class="bell__list">
        <NotificationItem v-for="n in latest" :key="n.id" :item="n" compact @open="open" />
      </div>
      <p v-else class="bell__empty">{{ t('layout.noNotifications') }}</p>
      <div class="bell__foot">
        <Button :label="t('layout.viewAll')" text class="bell__all" @click="goAll" />
        <Button :label="t('layout.allNotices')" icon="pi pi-megaphone" text class="bell__all" @click="goNotices" />
      </div>
    </div>
  </Popover>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import OverlayBadge from 'primevue/overlaybadge'
import NotificationItem from './NotificationItem.vue'
import { useInboxStore } from '@/stores/inbox'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const inbox = useInboxStore()
const auth = useAuthStore()
const router = useRouter()
const pop = ref()

const latest = computed(() => inbox.notifications.slice(0, 5))

function open(n) {
  inbox.markRead(n.id)
  // إشعار إعلان: يفتح الإعلان في صفحة الإعلانات
  if (n.link) { pop.value.hide(); router.push(n.link) }
}
function goNotices() {
  pop.value.hide()
  router.push({ name: 'notices' })
}
function goAll() {
  pop.value.hide()
  router.push({ name: 'notifications' })
}
</script>

<style scoped>
.bell { width: min(360px, 86vw); display: flex; flex-direction: column; gap: 0.25rem; }
.bell__head { display: flex; align-items: center; justify-content: space-between; padding: 0 0.25rem 0.25rem; }
.bell__list { display: flex; flex-direction: column; gap: 2px; max-height: 360px; overflow: auto; }
.bell__foot { display: flex; justify-content: space-between; flex-wrap: wrap; }
.bell__empty { text-align: center; color: var(--p-text-muted-color); padding: 1rem; margin: 0; }
.bell__all { width: 100%; }
</style>
