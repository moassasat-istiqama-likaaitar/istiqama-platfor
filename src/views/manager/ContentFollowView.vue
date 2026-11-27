<template>
  <!-- SM08: متابعة المحتوى — هل يستهلك التلاميذ محتوى كل مادة؟ -->
  <div>
    <PageHeader title="متابعة المحتوى" subtitle="مدى استعمال تلاميذ كل قسم لمحتوى كل مادة: المشاهدات، نسبة الإنجاز، وتقييم التلاميذ." />
    <div class="g">
      <section class="panel"><h3>الإنجاز حسب المادة (متوسط الأقسام)</h3><BarList :rows="bySubject" :max="100" suffix="%" :warn-below="30" /></section>
      <section class="panel"><h3>المشاهدات حسب القسم</h3><BarList :rows="byClass" suffix="" /></section>
    </div>
    <RecordTable :rows="rows" :columns="[
      { field: 'className', label: 'القسم' }, { field: 'subjectName', label: 'المادة' }, { field: 'lessons', label: 'الدروس' }, { field: 'contents', label: 'المحتويات' },
      { field: 'views', label: 'المشاهدات' }, { field: 'completion', label: 'الإنجاز', type: 'progress' }, { field: 'rating', label: 'تقييم التلاميذ' }
    ]" :search-keys="['className', 'subjectName']" :filters="[{ key: 'className', label: 'القسم', options: classOpts }, { key: 'subjectName', label: 'المادة', options: subjOpts }]" unit="سطر" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import BarList from '@/components/ui/BarList.vue'
import { useAuthStore } from '@/stores/auth'
import { contentFollow } from '@/api/school'

const auth = useAuthStore()
const rows = ref([])
onMounted(async () => (rows.value = await contentFollow(auth.active.school.id)))
const uniq = (k) => [...new Set(rows.value.map((r) => r[k]))]
const classOpts = computed(() => uniq('className').map((v) => ({ label: v, value: v })))
const subjOpts = computed(() => uniq('subjectName').map((v) => ({ label: v, value: v })))
const bySubject = computed(() => uniq('subjectName').map((s) => { const xs = rows.value.filter((r) => r.subjectName === s); return { label: s, value: Math.round(xs.reduce((n, r) => n + r.completion, 0) / xs.length) } }))
const byClass = computed(() => uniq('className').map((c) => ({ label: c, value: rows.value.filter((r) => r.className === c).reduce((n, r) => n + r.views, 0) })))
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
@media (max-width: 900px) { .g { grid-template-columns: minmax(0, 1fr); } }
</style>
