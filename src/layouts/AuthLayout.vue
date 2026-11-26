<template>
  <!-- هيكل صفحات الدخول — الخلفية وشعار المؤسسة -->
  <div class="auth">
    <div class="auth__top">
      <LangSwitcher />
    </div>
    <RouterView />
  </div>
</template>

<script setup>
import LangSwitcher from '@/components/LangSwitcher.vue'
</script>

<style scoped>
.auth {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--p-primary-color) 14%, transparent) 0, transparent 45%),
    radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--p-primary-color) 10%, transparent) 0, transparent 40%),
    var(--bg);
  display: flex;
  flex-direction: column;
}
.auth__top { position: absolute; top: 0.75rem; inset-inline-end: 1rem; z-index: 5; background: var(--surface); border-radius: 999px; box-shadow: var(--shadow); }
.auth { position: relative; }
</style>
