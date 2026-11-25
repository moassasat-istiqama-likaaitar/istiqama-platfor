<template>
  <div>
    <PageHeader :title="title" />
    <div class="panel">
      <EmptyState icon="pi pi-wrench" :title="t('placeholder.title')" :text="t('placeholder.body', { phase: phaseText })">
        <p v-if="item" class="codes">{{ t('placeholder.codes', { codes: item.codes.join('، ') }) }}</p>
        <RouterLink :to="{ name: 'home' }"><Button :label="t('errors.goHome')" icon="pi pi-home" text /></RouterLink>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { findItem } from '@/config/menus'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const item = computed(() => findItem(auth.role, route.params.key))
const title = computed(() => t(`menu.${route.params.key}`))
const phaseText = computed(() => (item.value ? `${item.value.phase} (${t(`placeholder.phases.${item.value.phase}`)})` : ''))
</script>

<style scoped>
.codes { font-size: 0.8rem; direction: ltr; }
</style>
