<template>
  <!-- SM09: تقارير الأداء — مقارنة الأقسام، المعدلات، التلاميذ المتعثرون -->
  <div v-if="d">
    <PageHeader title="تقارير الأداء" :subtitle="`أداء ${d.school.name} — قابل للتصدير`" />
    <StatTiles :items="[
      { label: 'متوسط التقدّم', value: d.progress + '%', icon: 'pi pi-book' },
      { label: 'المعدل العام', value: d.average, icon: 'pi pi-chart-line', tone: 'green', hint: 'على 20' },
      { label: 'نشطون هذا الأسبوع', value: `${d.activeWeek}/${d.counts.students}`, icon: 'pi pi-bolt', tone: 'amber' },
      { label: 'دقائق تعلّم هذا الأسبوع', value: d.minutes.toLocaleString('ar-DZ'), icon: 'pi pi-stopwatch', tone: 'purple' }
    ]" />
    <div class="g">
      <section class="panel"><h3>معدل الأقسام (/20)</h3><BarList :rows="d.classes.map((c) => ({ label: c.name, value: c.average }))" :max="20" :warn-below="10" /></section>
      <section class="panel"><h3>التلاميذ المتعثرون حسب القسم</h3><BarList :rows="d.classes.map((c) => ({ label: c.name, value: c.atRisk }))" suffix=" تلميذ" /></section>
    </div>
    <RecordTable :rows="d.classes" :columns="[
      { field: 'name', label: 'القسم' }, { field: 'levelName', label: 'المستوى' }, { field: 'students', label: 'التلاميذ' }, { field: 'teachersLabel', label: 'المعلمون' },
      { field: 'progress', label: 'التقدّم', type: 'progress' }, { field: 'average', label: 'المعدل' }, { field: 'late', label: 'واجبات وتقييمات متأخرة' }, { field: 'atRisk', label: 'متعثرون' }
    ]" unit="قسم">
      <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('أداء-الأقسام.csv', d.classes, cols)" /></template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { schoolOverview } from '@/api/school'
import { exportCsv } from '@/utils/exportCsv'

const auth = useAuthStore()
const d = ref(null)
const cols = [{ field: 'name', label: 'القسم' }, { field: 'levelName', label: 'المستوى' }, { field: 'students', label: 'التلاميذ' }, { field: 'progress', label: 'التقدم %' }, { field: 'average', label: 'المعدل' }, { field: 'atRisk', label: 'متعثرون' }]
onMounted(async () => (d.value = await schoolOverview(auth.active.school.id)))
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
@media (max-width: 900px) { .g { grid-template-columns: minmax(0, 1fr); } }
</style>
