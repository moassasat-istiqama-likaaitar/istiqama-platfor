<template>
  <!-- شعار المدرسة: الصورة المرفوعة، أو شارة بالحرف الأول وبلوني المدرسة إلى أن يُرفع الشعار -->
  <span class="slogo" :style="{ '--s': size + 'px', '--p': branding?.primary || '#64748b', '--q': branding?.secondary || '#cbd5e1' }" role="img" :aria-label="school?.name">
    <img v-if="branding?.logo" :src="branding.logo" :alt="school?.name" />
    <svg v-else viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 35 8v11c0 9.5-6.4 16.4-15 19C11.4 35.4 5 28.5 5 19V8z" fill="var(--p)" />
      <path d="M20 5.5 32 10.3V19c0 7.6-5 13.2-12 15.6C13 32.2 8 26.6 8 19v-8.7z" fill="none" stroke="var(--q)" stroke-width="1.6" />
      <text x="20" y="25.5" text-anchor="middle" :fill="ink">{{ letter }}</text>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { inkOn } from '@/utils/color'

const props = defineProps({ school: Object, branding: Object, size: { type: Number, default: 40 } })
const letter = computed(() => (props.school?.name || '؟').replace(/^مدرسة\s+(ال)?/, '').charAt(0))
const ink = computed(() => inkOn(props.branding?.primary || '#64748b'))
</script>

<style scoped>
.slogo { display: inline-grid; place-items: center; width: var(--s); height: var(--s); flex-shrink: 0; }
.slogo svg { width: 100%; height: 100%; }
.slogo text { font: 800 15px Cairo, sans-serif; }
.slogo img { width: 100%; height: 100%; object-fit: contain; background: #fff; border-radius: 22%; padding: 8%; box-sizing: border-box; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12); }
</style>
