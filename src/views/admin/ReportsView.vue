<template>
  <!-- AD17: التقارير — عامة / أداء المدارس / إحصائيات المحتوى / جودة التفاعل -->
  <div v-if="r">
    <PageHeader :title="TITLES[kind]" subtitle="بيانات كل المدارس — قابلة للتصدير." />

    <template v-if="kind === 'general'">
      <StatTiles :items="[
        { label: 'التلاميذ', value: r.totals.students.toLocaleString('ar-DZ'), icon: 'pi pi-users' }, { label: 'المعلمون', value: r.totals.teachers, icon: 'pi pi-graduation-cap', tone: 'purple' },
        { label: 'الأقسام', value: r.totals.classes, icon: 'pi pi-th-large', tone: 'blue' }, { label: 'دقائق التعلم هذا الأسبوع', value: r.totals.minutes.toLocaleString('ar-DZ'), icon: 'pi pi-stopwatch', tone: 'amber' }
      ]" />
      <div class="g">
        <section class="panel"><h3>النشطون أسبوعياً</h3><TrendLine :data="r.weekly" label="النشطون" /></section>
        <section class="panel"><h3>متوسط التقدّم حسب المدرسة (أعلى 10)</h3><BarList :rows="r.schools.slice().sort((a, b) => b.progress - a.progress).slice(0, 10).map((s) => ({ label: s.short, sub: s.name.split(' - ')[1], value: s.progress }))" :max="100" suffix="%" /></section>
      </div>
    </template>

    <template v-else-if="kind === 'schools'">
      <RecordTable :rows="r.schools" :columns="schoolCols" :search-keys="['name']" unit="مدرسة" :page-size="15">
        <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('أداء-المدارس.csv', r.schools, schoolCols)" /></template>
      </RecordTable>
      <div class="g mt">
        <section class="panel"><h3>المعدل العام حسب المدرسة</h3><BarList :rows="r.schools.map((s) => ({ label: s.short, sub: s.name.split(' - ')[1], value: s.average }))" :max="20" :warn-below="10" /></section>
        <section class="panel"><h3>نسبة الدخول الأسبوعي</h3><BarList :rows="r.schools.map((s) => ({ label: s.short, sub: s.name.split(' - ')[1], value: s.active }))" :max="100" suffix="%" :warn-below="50" /></section>
      </div>
    </template>

    <template v-else-if="kind === 'files'">
      <StatTiles :items="[{ label: 'المحتويات', value: r.contents, icon: 'pi pi-book' }, { label: 'الواجبات والتقييمات', value: r.activities, icon: 'pi pi-question-circle', tone: 'purple' }, { label: 'ينتظر المراجعة', value: r.pendingReview, icon: 'pi pi-inbox', tone: 'amber' }]" />
      <div class="g">
        <section class="panel"><h3>المحتوى حسب النوع</h3><BarList :rows="r.byType.map((x) => ({ label: cat.TYPE_LABEL[x.key] || x.key, value: x.value }))" /></section>
        <section class="panel"><h3>المحتوى والمشاهدات حسب المستوى</h3><BarList :rows="r.byLevel.map((x) => ({ label: x.label, sub: `${x.value} محتوى`, value: x.views }))" suffix=" مشاهدة" /></section>
      </div>
    </template>

    <template v-else>
      <StatTiles :items="[{ label: 'التعليقات على الدروس', value: r.engagement.comments, icon: 'pi pi-comments' }, { label: 'تقييمات المحتوى', value: r.engagement.ratings, icon: 'pi pi-star', tone: 'amber' }, { label: 'متوسط التقييم', value: r.engagement.avgRating + ' / 5', icon: 'pi pi-heart', tone: 'red' }]" />
      <div class="g">
        <section class="panel"><h3>الأجهزة المستعملة</h3><BarList :rows="r.engagement.devices" :max="100" suffix="%" /></section>
        <section class="panel"><h3>أوقات التعلّم</h3><BarList :rows="r.engagement.hours" :max="40" suffix="%" /></section>
      </div>
      <p class="muted note"><i class="pi pi-info-circle" /> ذروة التعلّم بين 15:00 و21:00 — مناسبة لبرمجة الواجبات وإشعارات التذكير.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import TrendLine from '@/components/ui/TrendLine.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useCatalog } from '@/composables/useCatalog'
import { globalReport } from '@/api/admin'
import { exportCsv } from '@/utils/exportCsv'

defineProps({ kind: { type: String, default: 'general' } })
const cat = useCatalog()
const TITLES = { general: 'تقارير عامة', schools: 'أداء المدارس', files: 'إحصائيات المحتوى', engagement: 'جودة التفاعل' }
const schoolCols = [{ field: 'name', label: 'المدرسة' }, { field: 'students', label: 'التلاميذ' }, { field: 'teachers', label: 'المعلمون' }, { field: 'classes', label: 'الأقسام' }, { field: 'progress', label: 'التقدّم', type: 'progress' }, { field: 'average', label: 'المعدل' }, { field: 'active', label: 'الدخول %' }, { field: 'atRisk', label: 'متعثرون' }]
const r = ref(null)
onMounted(async () => (r.value = await globalReport()))
</script>

<style scoped>
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; }
.mt { margin-top: 1rem; }
.note { margin-top: 1rem; }
@media (max-width: 900px) { .g { grid-template-columns: 1fr; } }
</style>
