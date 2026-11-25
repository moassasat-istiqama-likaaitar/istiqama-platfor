<template>
  <!-- الشعاران معاً: المؤسسة أولاً ثم المدرسة -->
  <div class="pair" :class="[tone, { 'with-names': names }]">
    <InstitutionMark :size="size" :tone="tone === 'light' ? 'light' : 'solid'" />
    <template v-if="school">
      <span class="pair__sep" />
      <SchoolLogo :school="school" :branding="branding" :size="size" />
    </template>
    <div v-if="names" class="pair__names">
      <small>{{ platform.name }}</small>
      <strong :title="school?.name">{{ school?.short || school?.name || t('app.short') }}</strong>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import InstitutionMark from './InstitutionMark.vue'
import SchoolLogo from './SchoolLogo.vue'
import { usePlatformStore } from '@/stores/platform'

defineProps({ school: Object, branding: Object, size: { type: Number, default: 36 }, names: Boolean, tone: { type: String, default: 'dark' } })
const { t } = useI18n()
const platform = usePlatformStore()
</script>

<style scoped>
.pair { display: flex; align-items: center; gap: 0.55rem; min-width: 0; }
.pair__sep { width: 1px; align-self: stretch; margin: 4px 0; background: currentColor; opacity: 0.25; }
.pair__names { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; margin-inline-start: 0.2rem; }
.pair__names small { font-size: 0.7rem; opacity: 0.75; white-space: nowrap; }
.pair__names strong { font-size: 0.98rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.light { color: #fff; }
</style>
