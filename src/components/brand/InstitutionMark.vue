<template>
  <!-- شعار المؤسسة — المكان الوحيد الذي يُستبدل فيه بالشعار الرسمي لاحقاً -->
  <span class="inst" :class="tone" :style="{ '--s': size + 'px' }" :title="t('app.name')" role="img" :aria-label="t('app.name')">
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2l5.3 5.9 7.9-.6-.6 7.9L38 20l-5.4 4.8.6 7.9-7.9-.6L20 38l-4.7-5.9-7.9.6.6-7.9L2 20l5.9-4.8-.6-7.9 7.9.6z" class="inst__star" />
      <text x="20" y="27" text-anchor="middle" class="inst__txt">ا</text>
    </svg>
  </span>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
defineProps({ size: { type: Number, default: 40 }, tone: { type: String, default: 'solid' } })
const { t } = useI18n()
</script>

<style scoped>
.inst { display: inline-grid; width: var(--s); height: var(--s); flex-shrink: 0; }
.inst svg { width: 100%; height: 100%; }
.inst__star { fill: #233b85; }
.inst__txt { font: 800 19px Cairo, sans-serif; fill: #fff; }
.light .inst__star { fill: #fff; }
.light .inst__txt { fill: #233b85; }
</style>
