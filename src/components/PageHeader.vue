<template>
  <header class="page-header">
    <div>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions"><slot name="actions" /></div>
  </header>
</template>

<script setup>
defineProps({ title: { type: String, required: true }, subtitle: { type: String, default: '' } })
</script>

<style scoped>
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.page-header__title { margin: 0; font-size: 1.45rem; font-weight: 700; }
.page-header__subtitle { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
.page-header__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
</style>
