<template>
  <!-- التقدير بالنجوم (1–5) -->
  <div class="sr" role="radiogroup" :aria-label="label">
    <span v-if="label" class="sr__l">{{ label }}</span>
    <button v-for="n in 5" :key="n" type="button" :class="{ on: n <= (hover || modelValue) }" :aria-label="`${n} من 5`" :disabled="readonly"
      @mouseenter="hover = n" @mouseleave="hover = 0" @click="$emit('update:modelValue', n)"><i :class="n <= (hover || modelValue) ? 'pi pi-star-fill' : 'pi pi-star'" /></button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: { type: Number, default: 0 }, label: String, readonly: Boolean })
defineEmits(['update:modelValue'])
const hover = ref(0)
</script>

<style scoped>
.sr { display: inline-flex; align-items: center; gap: 0.15rem; flex-wrap: wrap; }
.sr__l { font-size: 0.85rem; margin-inline-end: 0.4rem; color: var(--p-text-muted-color); }
.sr button { border: 0; background: none; padding: 0.15rem; cursor: pointer; color: #cbd5e1; font-size: 1.1rem; }
.sr button.on { color: #f5a400; }
</style>
