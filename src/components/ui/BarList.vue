<template>
  <!-- قائمة أشرطة أفقية (مقارنة قيم): لون واحد، القيمة مكتوبة بجانب كل شريط -->
  <ul class="bl">
    <li v-for="r in rows" :key="r.label" :title="`${r.label}: ${r.value}${suffix}`">
      <span class="bl__label">{{ r.label }}<small v-if="r.sub" class="muted"> · {{ r.sub }}</small></span>
      <span class="bl__track"><i :style="{ width: pct(r.value) + '%' }" :class="{ warn: warnBelow !== null && r.value < warnBelow }" /></span>
      <span class="bl__val"><bdi dir="ltr">{{ r.value }}{{ suffix }}</bdi></span>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({ rows: { type: Array, default: () => [] }, max: { type: Number, default: null }, suffix: { type: String, default: '' }, warnBelow: { type: Number, default: null } })
const pct = (v) => Math.max(2, Math.min(100, (v / (props.max || Math.max(...props.rows.map((r) => r.value), 1))) * 100))
</script>

<style scoped>
.bl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
.bl li { display: grid; grid-template-columns: minmax(110px, 1.2fr) 2fr auto; align-items: center; gap: 0.75rem; font-size: 0.88rem; }
.bl__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bl__track { height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; }
.bl__track i { display: block; height: 100%; background: var(--brand); border-radius: 4px; }
.bl__track i.warn { background: #e5484d; }
.bl__val { font-weight: 700; min-width: 3.2rem; text-align: end; }
</style>
