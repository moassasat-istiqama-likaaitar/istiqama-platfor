<template>
  <div class="empty">
    <span class="empty__icon"><i :class="icon" /></span>
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({ icon: { type: String, default: 'pi pi-inbox' }, title: String, text: String })
</script>

<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding: 2.5rem 1rem; color: var(--p-text-muted-color); }
.empty__icon { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 18px; background: var(--p-primary-50); color: var(--p-primary-600); font-size: 1.6rem; }
.empty__icon i { font-size: 1.6rem; }
.empty h3 { margin: 0.5rem 0 0; color: var(--p-text-color); }
.empty p { margin: 0; max-width: 420px; }
</style>
