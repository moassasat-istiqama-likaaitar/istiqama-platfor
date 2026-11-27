<template>
  <!-- مبدّل الموسم: يظهر فقط لمن له حق التعديل في موسم مفتوح مؤقتاً -->
  <Select v-if="season.editable.length" :model-value="season.seasonId" :options="opts" option-label="label" option-value="value" class="ssw" :class="{ on: season.current }" aria-label="الموسم" @update:model-value="season.enter" />
</template>

<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import { useSeasonStore } from '@/stores/season'

const season = useSeasonStore()
const opts = computed(() => [
  { label: `${season.active?.name || ''} (النشط)`, value: season.active?.id },
  ...season.editable.map((s) => ({ label: `${s.name} (تصحيح)`, value: s.id }))
])
</script>

<style scoped>
.ssw { min-width: 0; max-width: 240px; }
.ssw.on { border-color: #e08a00; background: #fff5e6; }
@media (max-width: 600px) { .ssw { max-width: 120px; } }
</style>
