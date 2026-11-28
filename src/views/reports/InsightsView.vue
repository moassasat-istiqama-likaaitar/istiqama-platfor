<template>
  <!-- RP01–RP04: المساهمون في المكتبة · نشاط التلاميذ · نشاط المعلمين · تقديرات المحتوى -->
  <div v-if="r">
    <PageHeader :title="TITLES[kind]" :subtitle="subtitle" />

    <!-- المساهمون في المكتبة -->
    <template v-if="kind === 'contributors'">
      <StatTiles :items="[
        { label: 'المعلمون المساهمون', value: r.totals.contributors, icon: 'pi pi-users' },
        { label: 'ما أُرسل للمكتبة', value: r.totals.sent, icon: 'pi pi-send', tone: 'purple' },
        { label: 'ما اعتُمد منه', value: r.totals.approved, icon: 'pi pi-check', tone: 'green' }
      ]" />
      <RecordTable :rows="r.schools" :columns="[{ field: 'school', label: 'المدرسة' }, { field: 'contributors', label: 'المساهمون' }, { field: 'teachers', label: 'معلمو المدرسة' }, { field: 'share', label: 'نسبة المساهمين %' }, { field: 'sent', label: 'المُرسَل' }, { field: 'approved', label: 'المعتمد' }]" :search-keys="['school']" unit="مدرسة" class="mb">
        <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('المساهمون-حسب-المدارس.csv', r.schools, schoolContribCols)" /></template>
      </RecordTable>
      <RecordTable :rows="r.teachers" :columns="teacherContribCols" :search-keys="['name', 'school']" :filters="[{ key: 'school', label: 'المدرسة', options: opts(r.teachers, 'school') }]" unit="معلم">
        <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('المساهمون-حسب-المعلمين.csv', r.teachers, teacherContribCols)" /></template>
      </RecordTable>
    </template>

    <!-- نشاط التلاميذ -->
    <template v-else-if="kind === 'activity'">
      <StatTiles :items="[
        { label: 'التلاميذ', value: r.totals.students, icon: 'pi pi-users' },
        { label: 'نشطون (آخر 7 أيام)', value: r.totals.active, icon: 'pi pi-bolt', tone: 'green' },
        { label: 'نسبة النشاط', value: r.totals.rate + '%', icon: 'pi pi-percentage', tone: r.totals.rate < 50 ? 'red' : 'purple' },
        { label: 'متوسط الدقائق أسبوعياً', value: r.totals.minutes, icon: 'pi pi-stopwatch', tone: 'amber' }
      ]" />
      <template v-if="r.schools">
        <section class="panel mb"><h3>نسبة النشاط حسب المدرسة</h3><BarList :rows="r.schools.map((s) => ({ label: s.school, sub: `${s.active}/${s.students}`, value: s.rate }))" :max="100" suffix="%" :warn-below="50" /></section>
        <RecordTable :rows="r.schools" :columns="schoolActCols" :search-keys="['school']" unit="مدرسة">
          <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('نشاط-التلاميذ.csv', r.schools, schoolActCols)" /></template>
        </RecordTable>
      </template>
      <template v-else>
        <section v-if="r.byClass.length > 1" class="panel mb"><h3>نسبة النشاط حسب القسم</h3><BarList :rows="r.byClass" :max="100" suffix="%" :warn-below="50" /></section>
        <RecordTable :rows="r.students" :columns="studentActCols" :search-keys="['name']" :filters="[{ key: 'className', label: 'القسم', options: opts(r.students, 'className') }, { key: 'activeLabel', label: 'الحالة', options: [{ label: 'نشط', value: 'نشط' }, { label: 'غير نشط', value: 'غير نشط' }] }]" unit="تلميذ" :row-class="(x) => (x.active ? '' : 'row-risk')" />
      </template>
      <p class="muted note"><i class="pi pi-info-circle" /> التلميذ النشط: دخل المنصة خلال آخر 7 أيام.</p>
    </template>

    <!-- نشاط المعلمين -->
    <template v-else-if="kind === 'teachers'">
      <StatTiles :items="[
        { label: 'المعلمون', value: r.totals.teachers, icon: 'pi pi-graduation-cap' },
        { label: 'نشطون (آخر 7 أيام)', value: r.totals.active, icon: 'pi pi-bolt', tone: 'green' },
        { label: 'نسبة النشاط', value: r.totals.rate + '%', icon: 'pi pi-percentage', tone: r.totals.rate < 60 ? 'red' : 'purple' }
      ]" />
      <section class="panel mb"><h3>نسبة المعلمين النشطين حسب المدرسة</h3><BarList :rows="r.schools.map((s) => ({ label: s.school, sub: `${s.active}/${s.teachers}`, value: s.rate }))" :max="100" suffix="%" :warn-below="60" /></section>
      <RecordTable :rows="r.teachers" :columns="teacherActCols" :search-keys="['name', 'school']" :filters="[{ key: 'school', label: 'المدرسة', options: opts(r.teachers, 'school') }]" unit="معلم" :row-class="(x) => (x.active ? '' : 'row-risk')">
        <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('نشاط-المعلمين.csv', r.teachers, teacherActCols)" /></template>
      </RecordTable>
      <p class="muted note"><i class="pi pi-info-circle" /> المعلم النشط: له عملية واحدة على الأقل خلال آخر 7 أيام (دخول، إدراج، تصحيح، رفع).</p>
    </template>

    <!-- تقديرات المحتوى -->
    <template v-else>
      <StatTiles :items="[
        { label: 'العناصر المقدَّرة', value: r.totals.items, icon: 'pi pi-book' },
        { label: 'عدد التقديرات', value: r.totals.ratings, icon: 'pi pi-star', tone: 'amber' },
        { label: 'متوسط تقدير التلاميذ', value: r.totals.students ?? '—', icon: 'pi pi-users', tone: 'green', hint: 'الاستفادة، على 5' },
        { label: 'متوسط تقدير المعلمين', value: r.totals.teachers ?? '—', icon: 'pi pi-graduation-cap', tone: 'purple', hint: 'التصميم، على 5' }
      ]" />
      <RecordTable v-if="r.low.length" :rows="r.low" :columns="ratingCols" unit="عنصر" class="mb" :page-size="10">
        <template #toolbar><b class="lowt"><i class="pi pi-exclamation-triangle" /> الأقل تقديراً (أقل من 3) — للمراجعة</b></template>
      </RecordTable>
      <RecordTable :rows="r.rows" :columns="ratingCols" :search-keys="['title', 'authorName']" :filters="[{ key: 'kindLabel', label: 'النوع', options: [{ label: 'محتوى', value: 'محتوى' }, { label: 'واجب / تقييم', value: 'واجب / تقييم' }] }, { key: 'subject', label: 'المادة', options: opts(r.rows, 'subject') }]" unit="عنصر">
        <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('تقديرات-المحتوى.csv', r.rows, ratingCols)" /></template>
      </RecordTable>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { contributorsReport, studentActivityReport, teacherActivityReport } from '@/api/insights'
import { ratingsReport } from '@/api/ratings'
import { exportCsv } from '@/utils/exportCsv'

const props = defineProps({ kind: { type: String, required: true } })
const auth = useAuthStore()
const TITLES = { contributors: 'المساهمون في المكتبة', activity: 'نشاط التلاميذ', teachers: 'نشاط المعلمين', ratings: 'تقديرات المحتوى' }
const subtitle = computed(() => {
  if (auth.role === 'teacher') return 'نسبة نشاط تلاميذ أقسامك، تلميذاً تلميذاً.'
  if (auth.role === 'editor') return 'في حدود مستوياتك.'
  return 'كل المدارس — قابلة للتصدير.'
})
const opts = (rows, k) => [...new Set(rows.map((x) => x[k]))].filter(Boolean).map((v) => ({ label: v, value: v }))
const schoolContribCols = [{ field: 'school', label: 'المدرسة' }, { field: 'contributors', label: 'المساهمون' }, { field: 'teachers', label: 'معلمو المدرسة' }, { field: 'share', label: 'نسبة المساهمين %' }, { field: 'sent', label: 'المُرسَل' }, { field: 'approved', label: 'المعتمد' }]
const teacherContribCols = [{ field: 'name', label: 'المعلم' }, { field: 'school', label: 'المدرسة' }, { field: 'contents', label: 'محتوى' }, { field: 'activities', label: 'واجبات وتقييمات' }, { field: 'sent', label: 'المجموع' }, { field: 'approved', label: 'المعتمد' }, { field: 'rate', label: 'نسبة الاعتماد %' }]
const schoolActCols = [{ field: 'school', label: 'المدرسة' }, { field: 'students', label: 'التلاميذ' }, { field: 'active', label: 'النشطون' }, { field: 'rate', label: 'نسبة النشاط %' }, { field: 'minutes', label: 'دقائق/أسبوع' }]
const studentActCols = [{ field: 'name', label: 'التلميذ', type: 'person', sub: 'className' }, { field: 'activeLabel', label: 'الحالة' }, { field: 'seen', label: 'آخر دخول' }, { field: 'minutesWeek', label: 'دقائق/أسبوع' }, { field: 'progress', label: 'التقدّم', type: 'progress' }]
const teacherActCols = [{ field: 'name', label: 'المعلم' }, { field: 'school', label: 'المدرسة' }, { field: 'days', label: 'أيام النشاط (7)' }, { field: 'seen', label: 'آخر نشاط' }, { field: 'uploads', label: 'رفع للمكتبة' }, { field: 'graded', label: 'تصحيحات' }, { field: 'classes', label: 'الأقسام' }]
const ratingCols = [{ field: 'title', label: 'العنصر' }, { field: 'kindLabel', label: 'النوع' }, { field: 'subject', label: 'المادة' }, { field: 'authorName', label: 'المؤلف' }, { field: 'students', label: 'التلاميذ /5' }, { field: 'studentsCount', label: 'عدد' }, { field: 'teachers', label: 'المعلمون /5' }, { field: 'teachersCount', label: 'عدد' }]
const seen = (d) => (d === 0 ? 'اليوم' : d === 1 ? 'أمس' : `منذ ${d} أيام`)

const r = ref(null)
onMounted(async () => {
  const levelIds = auth.role === 'editor' ? (auth.active.levels || []).map((l) => l.id) : null
  if (props.kind === 'contributors') r.value = await contributorsReport({ levelIds })
  else if (props.kind === 'ratings') r.value = await ratingsReport({ levelIds })
  else if (props.kind === 'teachers') {
    const x = await teacherActivityReport()
    x.teachers = x.teachers.map((t) => ({ ...t, seen: seen(t.lastSeenDays) }))
    r.value = x
  } else {
    const x = await studentActivityReport({ classIds: auth.role === 'teacher' ? auth.active.classIds || [] : null })
    if (x.students) x.students = x.students.map((s) => ({ ...s, seen: seen(s.lastSeenDays), activeLabel: s.active ? 'نشط' : 'غير نشط' }))
    r.value = x
  }
})
</script>

<style scoped>
.mb { margin-bottom: 1rem; }
.panel h3 { margin: 0 0 0.85rem; font-size: 1rem; }
.note { margin-top: 1rem; }
.lowt { color: #b45309; font-size: 0.9rem; display: inline-flex; gap: 0.35rem; align-items: center; }
</style>
