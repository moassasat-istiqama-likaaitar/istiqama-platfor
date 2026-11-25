<template>
  <div v-if="d" class="th">
    <SchoolBanner :school="brand.school" :branding="brand.branding" variant="teens" />
    <header class="th__head">
      <div>
        <h1>{{ greeting }}، {{ auth.person.firstName }}</h1>
        <p class="muted">{{ todayLabel }} · {{ auth.active.class?.name }}</p>
      </div>
      <div class="kpis">
        <div class="kpi"><small>التقدّم العام</small><b>{{ d.progress }}%</b></div>
        <div class="kpi"><small>أعمال مطلوبة</small><b>{{ d.todoCount }}</b></div>
        <div class="kpi"><small>المواظبة</small><b>{{ d.streak }} <span>يوم</span></b></div>
      </div>
    </header>

    <!-- مخطط الأسبوع -->
    <section class="panel">
      <header class="ph"><h2>هذا الأسبوع</h2><RouterLink to="/app/my-assignments" class="link">كل الأعمال</RouterLink></header>
      <div class="week">
        <div v-for="(day, i) in d.week" :key="i" class="day" :class="{ today: i === 0 }">
          <div class="day__head"><span>{{ wd(day.date) }}</span><b>{{ new Date(day.date).getDate() }}</b></div>
          <RouterLink v-for="a in day.items" :key="a.id" :to="`/app/activity/${a.id}`" class="task" :style="{ '--c': a.subject.color }">
            <small>{{ a.type === 'quiz' ? 'اختبار' : 'واجب' }}</small>{{ a.lesson.title }}
          </RouterLink>
          <span v-if="!day.items.length" class="day__free">—</span>
        </div>
      </div>
      <div v-if="late.length" class="late">
        <i class="pi pi-exclamation-circle" /> {{ late.length }} أعمال متأخرة:
        <RouterLink v-for="a in late.slice(0, 3)" :key="a.id" :to="`/app/activity/${a.id}`">{{ a.lesson.title }}</RouterLink>
      </div>
    </section>

    <div class="th__grid">
      <RouterLink v-if="d.continueWith" :to="`/app/lesson/${d.continueWith.lessonId}`" class="panel cont" :style="{ '--c': d.continueWith.subject.color }">
        <small>تابع القراءة</small>
        <strong>{{ d.continueWith.title }}</strong>
        <span class="muted">{{ d.continueWith.subject.name }}</span>
        <div class="bar" :style="{ '--bar-color': d.continueWith.subject.color }"><span :style="{ width: d.continueWith.subject.progress + '%' }" /></div>
        <span class="cont__go">فتح الدرس <i class="pi pi-arrow-left flip" /></span>
      </RouterLink>

      <section class="panel">
        <header class="ph"><h2>المقررات</h2></header>
        <table class="tbl">
          <tbody>
            <tr v-for="s in d.subjects" :key="s.id">
              <td><RouterLink :to="`/app/subject/${s.id}`" class="subj"><span class="sq" :style="{ background: s.color }" />{{ s.name }}</RouterLink></td>
              <td class="w"><div class="bar" :style="{ '--bar-color': s.color }"><span :style="{ width: s.progress + '%' }" /></div></td>
              <td class="num">{{ s.doneCount }}/{{ s.lessonsCount }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import { useBrandStore } from '@/stores/brand'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import * as learning from '@/api/learning'
import { gregorian, hijri, weekday } from '@/utils/dates'

const { locale } = useI18n()
const auth = useAuthStore()
const brand = useBrandStore()
const student = useStudentStore()
const d = ref(null)
const all = ref([])
const greeting = computed(() => (new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'))
const todayLabel = computed(() => `${weekday(new Date(), locale.value)} ${gregorian(new Date(), locale.value)} · ${hijri(new Date(), locale.value)}`)
const wd = (date) => weekday(date, locale.value)
const late = computed(() => all.value.filter((a) => a.state === 'late'))

onMounted(async () => {
  d.value = await student.refresh()
  all.value = await learning.myActivities(student.personId, student.levelId)
})
</script>

<style scoped>
.th { display: flex; flex-direction: column; gap: 1.1rem; }
.th__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
.th__head h1 { margin: 0; font-size: 1.6rem; }
.th__head p { margin: 0.2rem 0 0; font-size: 0.88rem; }
.kpis { display: flex; gap: 0.6rem; }
.kpi { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 0.55rem 0.9rem; min-width: 110px; }
.kpi small { display: block; color: var(--muted); font-size: 0.72rem; }
.kpi b { font-size: 1.35rem; }
.kpi b span { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1rem 1.1rem; box-shadow: none; }
.ph { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.ph h2 { margin: 0; font-size: 1rem; }
.link { color: var(--brand); text-decoration: none; font-size: 0.85rem; font-weight: 700; }
.week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.5rem; }
.day { display: flex; flex-direction: column; gap: 0.35rem; min-height: 120px; padding: 0.5rem; border-radius: 10px; background: var(--bg); }
.day.today { background: color-mix(in srgb, var(--brand) 8%, #fff); outline: 1.5px solid color-mix(in srgb, var(--brand) 40%, transparent); }
.day__head { display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; color: var(--muted); }
.day__head b { font-size: 1.05rem; color: var(--ink); }
.task { display: flex; flex-direction: column; padding: 0.4rem 0.5rem; border-radius: 8px; background: var(--surface); border-inline-start: 3px solid var(--c); text-decoration: none; color: inherit; font-size: 0.78rem; font-weight: 600; line-height: 1.35; }
.task small { color: var(--c); font-weight: 700; font-size: 0.68rem; }
.day__free { color: var(--line); text-align: center; margin-top: 1rem; }
.late { margin-top: 0.8rem; padding: 0.55rem 0.8rem; border-radius: 10px; background: #fff1f1; color: #b42318; font-size: 0.85rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.late a { color: #b42318; font-weight: 700; }
.th__grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.1rem; align-items: start; }
.cont { display: flex; flex-direction: column; gap: 0.35rem; text-decoration: none; color: inherit; border-top: 4px solid var(--c); }
.cont small { color: var(--c); font-weight: 700; }
.cont strong { font-size: 1.2rem; }
.cont__go { margin-top: 0.5rem; color: var(--c); font-weight: 700; font-size: 0.88rem; display: flex; gap: 0.4rem; align-items: center; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl td { padding: 0.55rem 0.3rem; border-bottom: 1px solid var(--line); }
.tbl tr:last-child td { border-bottom: 0; }
.subj { display: flex; align-items: center; gap: 0.55rem; text-decoration: none; color: inherit; font-weight: 600; white-space: nowrap; }
.sq { width: 10px; height: 10px; border-radius: 3px; }
.w { width: 50%; }
.num { text-align: end; font-variant-numeric: tabular-nums; color: var(--muted); font-size: 0.85rem; }
@media (max-width: 900px) {
  .week { grid-template-columns: repeat(7, 140px); overflow-x: auto; }
  .th__grid { grid-template-columns: 1fr; }
  .kpis { width: 100%; }
  .kpi { flex: 1; min-width: 0; }
}
</style>
