<template>
  <div v-if="r" class="sp">
    <h1>{{ t('student.report_.title') }}</h1>

    <div class="kpis">
      <div class="kpi"><i class="pi pi-book" /><b>{{ r.totals.lessons }}<small>/{{ r.totals.lessonsAll }}</small></b><span>{{ t('student.report_.lessons') }}</span></div>
      <div class="kpi"><i class="pi pi-pencil" /><b>{{ r.totals.activities }}</b><span>{{ t('student.report_.activities') }}</span></div>
      <div class="kpi"><i class="pi pi-bolt" /><b>{{ r.streak }}</b><span>{{ t('student.streak') }}</span></div>
      <div class="kpi"><i class="pi pi-star-fill" /><b>{{ r.stars }}</b><span>{{ t('student.stars') }}</span></div>
    </div>

    <section class="card">
      <h2><i class="pi pi-chart-bar" /> {{ t('student.report_.bySubject') }}</h2>
      <div class="rows">
        <div v-for="s in r.subjects" :key="s.id" class="row" :style="{ '--c': s.color }">
          <div class="row__name">
            <span class="row__art"><LessonArt :kind="s.art" :color="s.color" :accent="s.accent" bare /></span>
            <strong>{{ s.name }}</strong>
          </div>
          <div class="row__bar">
            <div class="bar" :style="{ '--bar-color': s.color }"><span :style="{ width: s.progress + '%' }" /></div>
            <small>{{ t('student.lessonsDone', { done: s.doneCount, total: s.lessonsCount }) }}</small>
          </div>
          <div class="row__stats">
            <span v-tooltip.top="t('student.report_.quizzes')"><i class="pi pi-question-circle" /> {{ s.quizzesDone }}/{{ s.quizzesTotal }}</span>
            <span v-tooltip.top="t('student.report_.homework')"><i class="pi pi-file-edit" /> {{ s.homeworkDone }}/{{ s.homeworkTotal }}</span>
            <span v-tooltip.top="t('student.report_.interactions')"><i class="pi pi-comments" /> {{ s.comments }}</span>
          </div>
          <div class="row__avg" :class="avgClass(s.average)">
            <b>{{ s.average ?? '—' }}</b><small v-if="s.average !== null">/20</small>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2><i class="pi pi-trophy" /> {{ t('student.report_.allBadges') }}</h2>
      <div class="badges">
        <div v-for="b in r.allBadges" :key="b.id" class="badge" :class="{ locked: !b.earned }">
          <span class="badge__icon"><i :class="b.earned ? b.icon : 'pi pi-lock'" /></span>
          <strong>{{ b.title }}</strong>
          <small>{{ b.earned ? b.hint : t('student.report_.locked') }}</small>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import LessonArt from '@/components/art/LessonArt.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const student = useStudentStore()
const r = ref(null)
onMounted(async () => {
  r.value = await learning.progressReport(student.personId, student.levelId)
})
const avgClass = (v) => (v === null ? '' : v >= 14 ? 'good' : v >= 10 ? 'mid' : 'low')
</script>

<style scoped>
.sp { display: flex; flex-direction: column; gap: 1.25rem; }
.sp h1 { margin: 0; font-size: 1.8rem; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.9rem; }
.kpi { background: var(--surface); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 0.15rem; }
.kpi i { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--brand-soft); color: var(--brand); margin-bottom: 0.35rem; }
.kpi:nth-child(3) i { background: #ffe9d4; color: #ff6b2c; }
.kpi:nth-child(4) i { background: #fff3c9; color: #e19400; }
.kpi b { font-family: var(--font-display); font-size: 1.8rem; line-height: 1.1; }
.kpi b small { font-size: 0.9rem; color: var(--muted); }
.kpi span { color: var(--muted); font-weight: 700; font-size: 0.85rem; }
.card { background: var(--surface); border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--shadow); }
.card h2 { margin: 0 0 1rem; font-size: 1.15rem; display: flex; gap: 0.5rem; align-items: center; }
.card h2 i { color: var(--brand); }
.rows { display: flex; flex-direction: column; gap: 0.6rem; }
.row { display: grid; grid-template-columns: 200px 1fr auto 70px; gap: 1rem; align-items: center; padding: 0.7rem 0.9rem; border-radius: var(--radius); background: var(--bg); }
.row__name { display: flex; align-items: center; gap: 0.6rem; }
.row__art { width: 46px; height: 34px; flex-shrink: 0; }
.row__bar { display: flex; flex-direction: column; gap: 0.25rem; }
.row__bar small { color: var(--muted); font-size: 0.75rem; }
.row__stats { display: flex; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; color: var(--muted); }
.row__stats i { color: var(--c); font-size: 0.85rem; }
.row__avg { text-align: center; font-family: var(--font-display); }
.row__avg b { font-size: 1.4rem; }
.row__avg small { color: var(--muted); }
.good b { color: #16a34a; } .mid b { color: #e19400; } .low b { color: #ef4444; }
.badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.9rem; }
.badge { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.3rem; padding: 1rem 0.5rem; border-radius: var(--radius); background: var(--bg); }
.badge__icon { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--brand))); color: #fff; box-shadow: 0 4px 0 color-mix(in srgb, var(--accent) 45%, #000); }
.badge__icon i { font-size: 1.4rem; }
.badge small { color: var(--muted); font-size: 0.75rem; }
.badge.locked { opacity: 0.55; }
.badge.locked .badge__icon { background: #c9c9d6; box-shadow: 0 4px 0 #a6a6b5; }
@media (max-width: 860px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .row { grid-template-columns: 1fr auto; }
  .row__bar { grid-column: 1 / -1; order: 3; }
  .row__stats { grid-column: 1 / -1; order: 4; }
}
</style>
