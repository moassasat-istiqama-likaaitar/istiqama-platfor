<template>
  <!-- منحنى بسيط لسلسلة واحدة مع نقاط قابلة للتمرير (تلميح بالقيمة) -->
  <div class="tl">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" role="img" :aria-label="label">
      <line v-for="g in 4" :key="g" :x1="P" :x2="W - P" :y1="P + ((H - 2 * P) / 4) * g" :y2="P + ((H - 2 * P) / 4) * g" class="tl__grid" />
      <path :d="area" class="tl__area" />
      <path :d="line" class="tl__line" />
      <g v-for="(p, i) in pts" :key="i" @mouseenter="hover = i" @mouseleave="hover = null">
        <rect :x="p.x - step / 2" :y="0" :width="step" :height="H" fill="transparent" />
        <circle :cx="p.x" :cy="p.y" :r="hover === i ? 5 : 3.5" class="tl__dot" />
      </g>
    </svg>
    <div class="tl__x"><span v-for="(d, i) in data" :key="i">{{ d.label }}</span></div>
    <div v-if="hover !== null" class="tl__tip" :style="{ insetInlineStart: (pts[hover].x / W) * 100 + '%' }"><b>{{ data[hover].value }}{{ suffix }}</b> <small>{{ data[hover].label }}</small></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] }, max: { type: Number, default: null }, suffix: { type: String, default: '' }, label: { type: String, default: '' } })
const W = 600, H = 160, P = 12
const hover = ref(null)
const step = computed(() => (W - 2 * P) / Math.max(1, props.data.length - 1))
const top = computed(() => props.max || Math.max(...props.data.map((d) => d.value), 1))
// RTL: الأحدث على اليسار
const pts = computed(() => props.data.map((d, i) => ({ x: W - P - i * step.value, y: H - P - (d.value / top.value) * (H - 2 * P) })))
const line = computed(() => pts.value.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '))
const area = computed(() => (pts.value.length ? `${line.value} L${pts.value.at(-1).x},${H - P} L${pts.value[0].x},${H - P} Z` : ''))
</script>

<style scoped>
.tl { position: relative; }
.tl svg { width: 100%; height: 160px; display: block; }
.tl__grid { stroke: var(--line); stroke-width: 1; }
.tl__line { fill: none; stroke: var(--brand); stroke-width: 2; vector-effect: non-scaling-stroke; }
.tl__area { fill: color-mix(in srgb, var(--brand) 10%, transparent); }
.tl__dot { fill: var(--surface); stroke: var(--brand); stroke-width: 2; vector-effect: non-scaling-stroke; }
.tl__x { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--p-text-muted-color); padding: 0 4px; }
.tl__tip { position: absolute; top: 0; transform: translateX(50%); background: var(--ink); color: #fff; padding: 0.25rem 0.55rem; border-radius: 6px; font-size: 0.78rem; white-space: nowrap; pointer-events: none; }
</style>
