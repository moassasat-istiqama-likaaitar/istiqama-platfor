<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :viewBox="`0 0 ${size} ${size}`">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="track" :stroke-width="stroke" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="color" :stroke-width="stroke" stroke-linecap="round"
        :stroke-dasharray="c" :stroke-dashoffset="c - (c * Math.min(100, value)) / 100"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`" class="ring__val"
      />
    </svg>
    <div class="ring__label"><slot>{{ value }}%</slot></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 96 },
  stroke: { type: Number, default: 10 },
  color: { type: String, default: 'var(--brand)' },
  track: { type: String, default: 'rgba(0,0,0,0.07)' }
})
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
</script>

<style scoped>
.ring { position: relative; flex-shrink: 0; }
.ring svg { width: 100%; height: 100%; }
.ring__val { transition: stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ring__label { position: absolute; inset: 0; display: grid; place-items: center; font-weight: 800; font-family: var(--font-display); }
</style>
