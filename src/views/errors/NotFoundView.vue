<template>
  <!-- خطأ 404: الصفحة غير موجودة -->
  <div class="err">
    <div class="err__code">404</div>
    <h1>{{ t('errors.notFound') }}</h1>
    <p>{{ t('errors.notFoundHint') }}</p>
    <RouterLink to="/app/home"><Button :label="t('errors.goHome')" icon="pi pi-home" /></RouterLink>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<style scoped>
.err { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.5rem; padding: 1rem; }
.err__code { font-size: 5rem; font-weight: 700; color: var(--p-primary-color); line-height: 1; }
h1 { margin: 0.5rem 0 0; }
p { color: var(--p-text-muted-color); margin: 0 0 1rem; }
</style>
