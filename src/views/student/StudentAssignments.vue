<template>
  <!-- ST06: واجباتي / مهامي — الواجبات والاختبارات المصادَق عليها -->
  <div class="sa" :class="`sa--${theme}`">
    <header class="sa__head">
      <h1>{{ titles[theme] }}</h1>
      <div class="sa__tabs">
        <button v-for="tb in tabs" :key="tb" type="button" class="pill" :class="{ 'is-active': tab === tb }" @click="tab = tb">
          {{ tabLabels[theme][tb] }} <span class="pill__count">{{ grouped[tb].length }}</span>
        </button>
      </div>
    </header>

    <!-- البراعم: بطاقات تحديات كبيرة -->
    <div v-if="theme === 'kids'" class="k-grid">
      <RouterLink v-for="a in visible" :key="a.id" :to="`/app/activity/${a.id}`" class="k-card" :style="{ '--c': a.subject.color }">
        <span class="k-card__icon"><i :class="a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
        <strong>{{ a.type === 'quiz' ? 'لعبة أسئلة' : 'واجب' }}</strong>
        <span>{{ a.label }}</span>
        <span v-if="a.state === 'graded'" class="k-card__stars"><i v-for="n in 3" :key="n" class="pi" :class="n <= Math.round((a.score / a.maxScore) * 3) ? 'pi-star-fill' : 'pi-star'" /></span>
        <span v-else-if="a.state === 'submitted'" class="k-card__tag">أرسلته ✓</span>
        <span v-else class="k-card__tag" :class="{ late: a.state === 'late' }">{{ due(a).text }}</span>
      </RouterLink>
    </div>

    <!-- المستكشفون: سجل المهام -->
    <div v-else-if="theme === 'juniors'" class="j-log">
      <RouterLink v-for="a in visible" :key="a.id" :to="`/app/activity/${a.id}`" class="j-item" :style="{ '--c': a.subject.color }">
        <span class="j-item__box" :class="a.state"><i :class="a.state === 'graded' || a.state === 'submitted' ? 'pi pi-check' : a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
        <div class="j-item__b"><small>{{ a.subject.name }} · {{ a.type === 'quiz' ? 'تحدي' : 'مهمة' }}</small><strong>{{ a.label }}</strong></div>
        <span v-if="a.state === 'graded'" class="j-item__score">{{ a.score }}/{{ a.maxScore }}</span>
        <span v-else class="chip" :data-hue="a.state === 'submitted' ? 'blue' : due(a).hue">{{ a.state === 'submitted' ? 'بانتظار المعلم' : due(a).text }}</span>
        <span class="j-item__xp">{{ a.type === 'quiz' ? `حتى +${10 + 5 * (a.questionsCount || 0)}` : '+15' }} نقطة</span>
      </RouterLink>
    </div>

    <!-- الشباب: جدول -->
    <table v-else class="t-table">
      <thead><tr><th>العمل</th><th class="hide-sm">المقرر</th><th>الأجل</th><th>الحالة</th><th>العلامة</th></tr></thead>
      <tbody>
        <tr v-for="a in visible" :key="a.id" @click="$router.push(`/app/activity/${a.id}`)">
          <td><span class="type">{{ a.type === 'quiz' ? 'اختبار' : 'واجب' }}</span> {{ a.label }} <span v-if="a.required" class="req">إلزامي</span></td>
          <td class="hide-sm"><span class="sq" :style="{ background: a.subject.color }" />{{ a.subject.name }}</td>
          <td class="num">{{ shortDate(a.due) }}</td>
          <td><span class="st" :class="`st--${a.state}`">{{ t(`student.state.${a.state}`) }}</span></td>
          <td class="num">{{ a.score !== null ? `${a.score}/${a.maxScore}` : '—' }}</td>
        </tr>
      </tbody>
    </table>

    <EmptyState v-if="!visible.length" icon="pi pi-check-circle" :text="t('student.noUpcoming')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import EmptyState from '@/components/EmptyState.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'
import { dueInfo } from '@/utils/due'
import { gregorian } from '@/utils/dates'

const { t, locale } = useI18n()
const student = useStudentStore()
const theme = computed(() => student.theme)
const all = ref([])
const tab = ref('todo')
const tabs = ['todo', 'submitted', 'graded']
const titles = { kids: 'تحدياتي', juniors: 'سجل المهام', teens: 'الأعمال' }
const tabLabels = {
  kids: { todo: 'تنتظرني', submitted: 'أرسلتها', graded: 'نجومي' },
  juniors: { todo: 'مهام مفتوحة', submitted: 'بانتظار المعلم', graded: 'مكتملة' },
  teens: { todo: 'مطلوبة', submitted: 'مُسلّمة', graded: 'مصحّحة' }
}
const due = (a) => dueInfo(a.due, t)
const shortDate = (d) => gregorian(d, locale.value, { day: 'numeric', month: 'short' })

onMounted(async () => (all.value = await learning.myActivities(student.personId, student.levelId)))
const grouped = computed(() => ({
  todo: all.value.filter((a) => ['todo', 'late'].includes(a.state)).sort((a, b) => a.due.localeCompare(b.due)),
  submitted: all.value.filter((a) => a.state === 'submitted'),
  graded: all.value.filter((a) => a.state === 'graded').sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
}))
const visible = computed(() => grouped.value[tab.value])
</script>

<style scoped>
.sa { display: flex; flex-direction: column; gap: 1rem; }
.sa__head h1 { margin: 0 0 0.7rem; font-size: 1.8rem; }
.sa__tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.sa--kids .pill { font-size: 1.05rem; padding: 0.55rem 1.2rem; }

.k-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }
.k-card { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1.3rem 0.8rem; border-radius: 28px; background: var(--surface); text-align: center; text-decoration: none; color: var(--ink); box-shadow: var(--shadow); border-bottom: 7px solid var(--c); }
.k-card__icon { width: 70px; height: 70px; border-radius: 50%; background: var(--c); color: #fff; display: grid; place-items: center; }
.k-card__icon i { font-size: 1.8rem; }
.k-card strong { font-family: var(--font-display); font-size: 1.25rem; }
.k-card > span:not(.k-card__icon) { font-size: 0.9rem; color: var(--muted); }
.k-card__stars i { color: #f5a400; font-size: 1.3rem; }
.k-card__tag { font-weight: 800; color: var(--c) !important; }
.k-card__tag.late { color: #ef4444 !important; }

.j-log { display: flex; flex-direction: column; gap: 0.55rem; }
.j-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.75rem 1rem; border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow); text-decoration: none; color: inherit; }
.j-item__box { width: 40px; height: 40px; border-radius: 12px; border: 2.5px solid var(--c); color: var(--c); display: grid; place-items: center; flex-shrink: 0; }
.j-item__box.graded, .j-item__box.submitted { background: #8ac926; border-color: #8ac926; color: #fff; }
.j-item__box.late { border-color: #ef4444; color: #ef4444; }
.j-item__b { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.j-item__b small { color: var(--muted); font-weight: 700; font-size: 0.75rem; }
.j-item__score { font-weight: 800; color: var(--c); }
.j-item__xp { font-size: 0.75rem; font-weight: 800; color: #5f9a12; background: #effad9; padding: 0.15rem 0.5rem; border-radius: 999px; }

.t-table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; font-size: 0.9rem; }
.t-table th { text-align: start; font-size: 0.75rem; color: var(--muted); padding: 0.6rem 1rem; border-bottom: 1px solid var(--line); }
.t-table td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--line); }
.t-table tbody tr { cursor: pointer; }
.t-table tbody tr:hover { background: var(--bg); }
.type { font-size: 0.72rem; font-weight: 700; color: var(--muted); margin-inline-end: 0.3rem; }
.req { font-size: 0.66rem; background: #fff1f1; color: #b42318; padding: 0 0.4rem; border-radius: 6px; margin-inline-start: 0.3rem; }
.sq { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-inline-end: 0.4rem; }
.num { font-variant-numeric: tabular-nums; color: var(--muted); white-space: nowrap; }
.st { font-size: 0.74rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; white-space: nowrap; }
.st--todo { background: var(--bg); color: var(--ink); }
.st--late { background: #fff1f1; color: #b42318; }
.st--submitted { background: #eef4ff; color: #1d55d1; }
.st--graded { background: #e7f8ee; color: #15803d; }
@media (max-width: 640px) { .hide-sm { display: none; } .k-grid { grid-template-columns: 1fr 1fr; } .j-item__xp { display: none; } .t-table td, .t-table th { padding: 0.6rem; } }
</style>
