<template>
  <!-- AD08: الأطوار والمستويات — وكل مستوى بقالبه (البراعم / المستكشفون / الشباب) -->
  <div>
    <PageHeader title="الأطوار والمستويات" subtitle="المستويات الدراسية وقالب الواجهة الذي يراه تلاميذ كل مستوى." />
    <div class="themes">
      <div v-for="th in THEMES" :key="th.name" class="panel th" :style="{ '--c': th.color }"><i :class="th.icon" /><div><b>{{ th.name }}</b><small class="muted">{{ th.levels }}</small><p>{{ th.desc }}</p></div></div>
    </div>
    <RecordTable :rows="rows" :columns="[{ field: 'order', label: '#', width: '50px' }, { field: 'name', label: 'المستوى' }, { field: 'phaseLabel', label: 'الطور' }, { field: 'theme', label: 'قالب الواجهة' }, { field: 'subjects', label: 'المواد' }, { field: 'lessons', label: 'الدروس' }, { field: 'classes', label: 'الأقسام' }]" unit="مستوى" :page-size="12">
      <template #cell-theme="{ row }"><span class="tag" :style="{ '--c': THEMES.find((x) => x.name === row.theme).color }">{{ row.theme }}</span></template>
      <template #actions="{ row }"><Button icon="pi pi-pencil" text rounded size="small" @click="cur = { ...row }" /></template>
    </RecordTable>
    <FormDialog :visible="!!cur" title="تعديل المستوى" :fields="[{ key: 'name', label: 'الاسم', required: true }]" :value="cur || {}" @update:visible="cur = null" @save="save" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { listLevels, saveLevel } from '@/api/admin'

const THEMES = [
  { name: 'البراعم', levels: 'الأولى إلى الثالثة ابتدائي', color: '#ff6b4a', icon: 'pi pi-sun', desc: 'أزرار كبيرة، خطوات، شخصية مرافقة، تصحيح فوري.' },
  { name: 'المستكشفون', levels: 'الرابعة والخامسة ابتدائي، الأولى متوسط', color: '#0a9bdc', icon: 'pi pi-compass', desc: 'مهام ومستويات خبرة، فصول، شارات.' },
  { name: 'الشباب', levels: 'من الثانية متوسط', color: '#6550e0', icon: 'pi pi-chart-line', desc: 'مخطط أسبوعي، جداول، تحليلات، ملاحظات شخصية.' }
]
const rows = ref([])
const cur = ref(null)
const load = async () => (rows.value = await listLevels())
onMounted(load)
async function save(v) {
  await saveLevel({ ...cur.value, ...v })
  cur.value = null
  load()
}
</script>

<style scoped>
.themes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-bottom: 1rem; }
.th { display: flex; gap: 0.75rem; border-top: 4px solid var(--c); }
.th > i { font-size: 1.4rem; color: var(--c); }
.th small { display: block; font-size: 0.78rem; }
.th p { margin: 0.35rem 0 0; font-size: 0.84rem; }
.tag { font-size: 0.78rem; font-weight: 700; padding: 0.1rem 0.6rem; border-radius: 999px; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); }
@media (max-width: 900px) { .themes { grid-template-columns: 1fr; } }
</style>
