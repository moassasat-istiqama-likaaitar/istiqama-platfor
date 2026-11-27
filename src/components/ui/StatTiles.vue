<template>
  <div class="tiles-s">
    <component :is="s.to ? 'RouterLink' : 'div'" v-for="s in items" :key="s.label" :to="s.to" class="ts" :class="'ts--' + (s.tone || 'brand')">
      <span class="ts__icon"><i :class="s.icon" /></span>
      <span class="ts__body">
        <small>{{ s.label }}</small>
        <strong><bdi>{{ s.value }}</bdi></strong>
        <em v-if="s.hint">{{ s.hint }}</em>
      </span>
    </component>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } })
</script>

<style scoped>
.tiles-s { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 0.85rem; margin-bottom: 1.25rem; }
.ts { display: flex; align-items: center; gap: 0.85rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 1rem; text-decoration: none; color: inherit; transition: border-color 0.15s; }
a.ts:hover { border-color: var(--brand); }
.ts__icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 1.15rem; flex-shrink: 0; }
.ts__body { display: flex; flex-direction: column; min-width: 0; }
.ts__body small { color: var(--p-text-muted-color); font-size: 0.82rem; }
.ts__body strong { font-size: 1.5rem; line-height: 1.2; }
.ts__body em { font-style: normal; font-size: 0.76rem; color: var(--p-text-muted-color); }
.ts--brand .ts__icon { background: color-mix(in srgb, var(--brand) 12%, #fff); color: var(--brand); }
.ts--green .ts__icon { background: #e6f6ec; color: #17733f; }
.ts--amber .ts__icon { background: #fff3d6; color: #a15c00; }
.ts--red .ts__icon { background: #fde8e8; color: #b42318; }
.ts--purple .ts__icon { background: #f0eafd; color: #6b3fc4; }
</style>
