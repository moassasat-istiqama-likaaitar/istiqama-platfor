<template>
  <!-- الإعلانات: رمز مستقل بجانب الجرس — الإعلانات يكتبها شخص (المدير أو الإدارة العامة)، والجرس للإشعارات الآلية -->
  <OverlayBadge v-if="unread" :value="unread" severity="warn" size="small">
    <Button icon="pi pi-megaphone" text rounded severity="secondary" aria-label="الإعلانات" title="الإعلانات" @click="go" />
  </OverlayBadge>
  <Button v-else icon="pi pi-megaphone" text rounded severity="secondary" aria-label="الإعلانات" title="الإعلانات" @click="go" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import OverlayBadge from 'primevue/overlaybadge'
import { useNoticesUnread } from '@/composables/useNoticesUnread'

const router = useRouter()
const unread = useNoticesUnread()
const go = () => router.push({ name: 'notices' })
</script>
