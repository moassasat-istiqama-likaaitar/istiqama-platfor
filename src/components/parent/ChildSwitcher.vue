<template>
  <!-- اختيار الابن: كل ابن ببطاقته ومدرسته -->
  <div class="cs" role="tablist">
    <button v-for="c in children" :key="c.id" type="button" role="tab" class="cs__b" :class="{ on: c.id === modelValue }" :aria-selected="c.id === modelValue" @click="$emit('update:modelValue', c.id)">
      <span class="cs__av" :class="c.gender">{{ c.firstName?.charAt(0) || c.name.charAt(0) }}</span>
      <span class="cs__t"><b>{{ c.firstName || c.name }}</b><small>{{ c.className }}</small></span>
      <small class="cs__school">{{ c.schoolName?.split(' - ')[0] }}</small>
    </button>
  </div>
</template>

<script setup>
defineProps({ children: { type: Array, default: () => [] }, modelValue: String })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.cs { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
.cs__b { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.9rem 0.55rem 1.1rem; border-radius: 14px; border: 1.5px solid var(--line); background: var(--surface); cursor: pointer; font: inherit; color: inherit; text-align: start; position: relative; }
.cs__b.on { border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent); }
.cs__av { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: #fff; background: #0a9bdc; }
.cs__av.female { background: #d6458b; }
.cs__t b { display: block; }
.cs__t small, .cs__school { display: block; font-size: 0.76rem; color: var(--p-text-muted-color); }
.cs__school { margin-inline-start: 0.4rem; padding-inline-start: 0.6rem; border-inline-start: 1px solid var(--line); }
@media (max-width: 640px) { .cs__school { display: none; } }
</style>
