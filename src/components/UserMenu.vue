<template>
  <button type="button" class="user-btn" :aria-label="auth.fullName" @click="menu.toggle($event)">
    <Avatar :label="auth.initials" shape="circle" class="user-btn__avatar" />
  </button>
  <Menu ref="menu" :model="items" popup>
    <template #start>
      <div class="user-head">
        <strong>{{ auth.fullName }}</strong>
        <small>{{ auth.person?.email || auth.person?.username }}</small>
      </div>
    </template>
  </Menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'

const { t } = useI18n()
const auth = useAuthStore()
const inbox = useInboxStore()
const router = useRouter()
const menu = ref()

const items = computed(() => [
  { label: t('layout.profile'), icon: 'pi pi-user', command: () => router.push({ name: 'profile' }) },
  { label: t('menu.feedback'), icon: 'pi pi-flag', command: () => router.push({ name: 'feedback' }) },
  { separator: true },
  {
    label: t('layout.logout'),
    icon: 'pi pi-sign-out',
    command: () => {
      auth.logout()
      inbox.reset()
      router.push({ name: 'login' })
    }
  }
])
</script>

<style scoped>
.user-btn { border: 0; background: transparent; padding: 0; cursor: pointer; border-radius: 50%; }
.user-btn__avatar { background: var(--p-primary-color); color: var(--p-primary-contrast-color); font-weight: 700; }
.user-head { display: flex; flex-direction: column; padding: 0.6rem 0.9rem 0.4rem; }
.user-head small { color: var(--p-text-muted-color); }
</style>
