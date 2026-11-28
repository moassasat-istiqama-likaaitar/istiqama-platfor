<template>
  <!-- SM01: لوحة مدير المدرسة -->
  <div v-if="d">
    <PageHeader :title="`السلام عليكم، ${auth.person.firstName}`" :subtitle="`لوحة ${d.school.name}`" />
    <SchoolBanner :school="brand.school" :branding="brand.branding" variant="teens" class="mb" />
    <StatTiles :items="[
      { label: 'التلاميذ', value: d.counts.students, icon: 'pi pi-users', to: '/app/students' },
      { label: 'المعلمون', value: d.counts.teachers, icon: 'pi pi-user', tone: 'purple', to: '/app/teachers' },
      { label: 'الأقسام', value: d.counts.classes, icon: 'pi pi-th-large', tone: 'blue', to: '/app/school-classes' },
      { label: 'أوراق دخول لم تُطبع', value: toPrint, icon: 'pi pi-id-card', tone: toPrint ? 'amber' : 'green', to: '/app/login-sheets' },
      { label: 'ملفات للمصادقة', value: d.uploadsPending, icon: 'pi pi-check-square', tone: d.uploadsPending ? 'amber' : 'green', to: '/app/teacher-files-review' }
    ]" />
    <div class="g">
      <section class="panel">
        <h3>تقدّم المدرسة أسبوعاً بأسبوع</h3>
        <TrendLine :data="d.weekly" :max="100" suffix="%" label="تقدم المدرسة" />
        <p class="muted small">متوسط التقدّم الحالي <b>{{ d.progress }}%</b> · المعدل العام <b>{{ d.average }}/20</b> · نشطون هذا الأسبوع <b>{{ d.activeWeek }}</b> تلميذاً</p>
      </section>
      <section class="panel">
        <h3>تقدّم الأقسام</h3>
        <BarList :rows="d.classes.map((c) => ({ label: c.name, value: c.progress }))" :max="100" suffix="%" :warn-below="30" />
      </section>
      <section class="panel span">
        <header class="hd"><h3><i class="pi pi-exclamation-triangle" /> تلاميذ يحتاجون متابعة</h3><RouterLink to="/app/performance" class="lnk">تقارير الأداء</RouterLink></header>
        <RecordTable :rows="d.atRisk" :columns="[{ field: 'name', label: 'التلميذ', type: 'person', sub: 'className' }, { field: 'progress', label: 'التقدّم', type: 'progress' }, { field: 'late', label: 'واجبات وتقييمات متأخرة' }]" :page-size="8" unit="تلميذ" empty-text="لا أحد — ممتاز" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import TrendLine from '@/components/ui/TrendLine.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import { schoolOverview } from '@/api/school'
import { sheetsSummary } from '@/api/credentials'
// حسابات أُنشئت ولم تُطبع ورقة دخولها بعد (كل حساب يُنشأ مفعّلاً، ويصل صاحبَه بورقة الدخول)
const toPrint = ref(0)

const auth = useAuthStore()
const brand = useBrandStore()
const d = ref(null)
onMounted(async () => {
  const sid = auth.active.school.id
  d.value = await schoolOverview(sid)
  const sums = await Promise.all(['students', 'parents', 'teachers'].map((c) => sheetsSummary(c, sid)))
  toPrint.value = sums.reduce((n, x) => n + x.toPrint, 0)
})
</script>

<style scoped>
.mb { margin-bottom: 1.1rem; }
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.g h3 { margin: 0 0 0.85rem; font-size: 1rem; display: flex; gap: 0.5rem; align-items: center; }
.span { grid-column: 1 / -1; }
.small { font-size: 0.85rem; margin: 0.75rem 0 0; }
.hd { display: flex; justify-content: space-between; align-items: center; }
.lnk { font-size: 0.85rem; color: var(--brand); font-weight: 700; text-decoration: none; }
@media (max-width: 900px) { .g { grid-template-columns: minmax(0, 1fr); } }
</style>
