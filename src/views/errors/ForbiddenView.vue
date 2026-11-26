<template>
  <!-- خطأ 403: لا صلاحية -->
  <div class="panel">
    <EmptyState icon="pi pi-lock" :title="t('errors.forbidden')" :text="t('errors.forbiddenHint')">
      <RouterLink :to="{ name: 'home' }"><Button :label="t('errors.goHome')" icon="pi pi-home" text /></RouterLink>
    </EmptyState>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import EmptyState from '@/components/EmptyState.vue'
const { t } = useI18n()
</script>
