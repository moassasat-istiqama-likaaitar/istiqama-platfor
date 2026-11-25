<template>
  <div v-if="r" class="sp" :class="`sp--${theme}`">
    <!-- ================= البراعم: لوحة الملصقات ================= -->
    <template v-if="theme === 'kids'">
      <section class="k-jar">
        <div class="k-jar__star"><i class="pi pi-star-fill" /></div>
        <div><b>{{ r.stars }}</b><span>نجمة جمعتها</span></div>
        <div class="k-jar__fire"><i class="pi pi-bolt" /> {{ r.streak }} أيام</div>
      </section>
      <h2 class="k-title">ملصقاتي</h2>
      <div class="k-stickers">
        <div v-for="b in r.allBadges" :key="b.id" class="sticker" :class="{ locked: !b.earned }">
          <span><i :class="b.earned ? b.icon : 'pi pi-question'" /></span>
          <strong>{{ b.earned ? b.title : '؟؟؟' }}</strong>
        </div>
      </div>
      <h2 class="k-title">دروسي</h2>
      <div class="k-bars">
        <div v-for="s in r.subjects" :key="s.id" class="k-bar" :style="{ '--c': s.color }">
          <div class="k-bar__tube"><span :style="{ height: s.progress + '%' }" /></div>
          <i :class="s.icon" />
          <small>{{ s.name }}</small>
        </div>
      </div>
    </template>

    <!-- ================= المستكشفون: طريق المستويات ================= -->
    <template v-else-if="theme === 'juniors'">
      <h1>إنجازاتي</h1>
      <section class="j-road card">
        <div class="j-road__head"><span class="j-lvl">{{ r.xp.level }}</span><div><strong>مستوى المستكشف {{ r.xp.level }}</strong><small>{{ r.xp.inLevel }}/{{ r.xp.next }} XP للمستوى التالي</small></div></div>
        <div class="j-road__track">
          <div v-for="n in 8" :key="n" class="j-stop" :class="{ done: n < r.xp.level, now: n === r.xp.level }">
            <span>{{ n }}</span>
          </div>
        </div>
      </section>
      <div class="j-grid">
        <section class="card">
          <h3>تقدّمي في المواد</h3>
          <div v-for="s in r.subjects" :key="s.id" class="j-sub" :style="{ '--c': s.color }">
            <span class="j-sub__i"><i :class="s.icon" /></span>
            <div class="j-sub__b"><div class="j-sub__t"><strong>{{ s.name }}</strong><span>{{ s.progress }}%</span></div><div class="bar" :style="{ '--bar-color': s.color }"><span :style="{ width: s.progress + '%' }" /></div></div>
          </div>
        </section>
        <section class="card">
          <h3>الشارات</h3>
          <div class="j-badges">
            <div v-for="b in r.allBadges" :key="b.id" class="j-badge" :class="{ locked: !b.earned }" v-tooltip.top="b.hint">
              <span><i :class="b.earned ? b.icon : 'pi pi-lock'" /></span><small>{{ b.title }}</small>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- ================= الشباب: لوحة تحليلات ================= -->
    <template v-else>
      <h1>التحليلات</h1>
      <div class="t-kpis">
        <div><small>الدروس المكتملة</small><b>{{ r.totals.lessons }}<span>/{{ r.totals.lessonsAll }}</span></b></div>
        <div><small>الأعمال المنجزة</small><b>{{ r.totals.activities }}</b></div>
        <div><small>المعدل العام</small><b>{{ overall ?? '—' }}<span v-if="overall">/20</span></b></div>
        <div><small>المواظبة</small><b>{{ r.streak }}<span> يوم</span></b></div>
      </div>
      <div class="t-grid">
        <section class="panel">
          <h3>المعدل حسب المقرر</h3>
          <div v-for="s in r.subjects" :key="s.id" class="t-avg">
            <span class="t-avg__n"><span class="sq" :style="{ background: s.color }" />{{ s.name }}</span>
            <div class="t-avg__track"><span :style="{ width: ((s.average || 0) / 20) * 100 + '%', background: s.color }" /></div>
            <b>{{ s.average ?? '—' }}</b>
          </div>
        </section>
        <section class="panel">
          <h3>تطوّر العلامات</h3>
          <svg v-if="r.history.length > 1" viewBox="0 0 300 120" class="t-line" preserveAspectRatio="none">
            <line v-for="y in [0, 10, 20]" :key="y" x1="0" x2="300" :y1="110 - y * 5" :y2="110 - y * 5" stroke="var(--line)" />
            <polyline :points="linePts" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linejoin="round" />
            <circle v-for="(p, i) in pts" :key="i" :cx="p[0]" :cy="p[1]" r="3.5" fill="var(--brand)" />
          </svg>
          <p v-else class="muted">لا توجد علامات كافية بعد</p>
          <small class="muted">آخر {{ r.history.length }} أعمال مصحّحة (على 20)</small>
        </section>
      </div>
      <section class="panel">
        <h3>تفاصيل المقررات</h3>
        <table class="t-table">
          <thead><tr><th>المقرر</th><th>الدروس</th><th>الاختبارات</th><th>الواجبات</th><th>التفاعلات</th><th>المعدل</th></tr></thead>
          <tbody>
            <tr v-for="s in r.subjects" :key="s.id">
              <td><span class="sq" :style="{ background: s.color }" />{{ s.name }}</td>
              <td>{{ s.doneCount }}/{{ s.lessonsCount }}</td><td>{{ s.quizzesDone }}/{{ s.quizzesTotal }}</td>
              <td>{{ s.homeworkDone }}/{{ s.homeworkTotal }}</td><td>{{ s.comments }}</td><td><b>{{ s.average ?? '—' }}</b></td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const student = useStudentStore()
const theme = computed(() => student.theme)
const r = ref(null)
onMounted(async () => (r.value = await learning.progressReport(student.personId, student.levelId)))

const overall = computed(() => {
  const v = r.value?.subjects.filter((s) => s.average !== null) || []
  return v.length ? Math.round((v.reduce((n, s) => n + s.average, 0) / v.length) * 10) / 10 : null
})
const pts = computed(() => {
  const h = (r.value?.history || []).slice(-12)
  const step = h.length > 1 ? 290 / (h.length - 1) : 0
  return h.map((x, i) => [5 + i * step, 110 - x.score20 * 5])
})
const linePts = computed(() => pts.value.map((p) => p.join(',')).join(' '))
</script>

<style scoped>
.sp { display: flex; flex-direction: column; gap: 1.1rem; }
.sp h1 { margin: 0; font-size: 1.8rem; }
.card { background: var(--surface); border-radius: var(--radius-lg); padding: 1.1rem; box-shadow: var(--shadow); }
.card h3, .panel h3 { margin: 0 0 0.8rem; font-size: 1rem; }

/* البراعم */
.k-jar { display: flex; align-items: center; gap: 1.2rem; padding: 1.4rem; border-radius: 32px; background: linear-gradient(120deg, #ffcf3c, #ff9f1c); color: #fff; box-shadow: 0 8px 0 #d98200; }
.k-jar__star { width: 100px; height: 100px; border-radius: 50%; background: rgba(255, 255, 255, 0.25); display: grid; place-items: center; }
.k-jar__star i { font-size: 3.2rem; }
.k-jar b { display: block; font-family: var(--font-display); font-size: 3rem; line-height: 1; }
.k-jar span { font-size: 1.2rem; font-weight: 700; }
.k-jar__fire { margin-inline-start: auto; background: rgba(255, 255, 255, 0.25); padding: 0.5rem 1.1rem; border-radius: 999px; font-size: 1.2rem; font-weight: 800; }
.k-title { margin: 0.3rem 0 0; font-size: 1.6rem; }
.k-stickers { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
.sticker { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 1rem 0.5rem; border-radius: 28px; background: var(--surface); box-shadow: var(--shadow); transform: rotate(-2deg); }
.sticker:nth-child(even) { transform: rotate(2deg); }
.sticker span { width: 80px; height: 80px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, #ff6b4a, #ffc93c); color: #fff; box-shadow: 0 5px 0 #d14d2e; }
.sticker span i { font-size: 2rem; }
.sticker strong { font-family: var(--font-display); font-size: 1.05rem; text-align: center; }
.sticker.locked span { background: #e8e2d6; box-shadow: 0 5px 0 #cfc6b5; color: #a89d88; }
.sticker.locked strong { color: var(--muted); }
.k-bars { display: flex; gap: 1.5rem; justify-content: center; padding: 1.2rem; background: var(--surface); border-radius: 32px; box-shadow: var(--shadow); }
.k-bar { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.k-bar__tube { width: 60px; height: 180px; border-radius: 30px; background: color-mix(in srgb, var(--c) 14%, #fff); position: relative; overflow: hidden; border: 4px solid color-mix(in srgb, var(--c) 30%, #fff); }
.k-bar__tube span { position: absolute; bottom: 0; left: 0; right: 0; background: var(--c); border-radius: 26px; }
.k-bar i { color: var(--c); font-size: 1.5rem; }
.k-bar small { font-weight: 700; text-align: center; max-width: 100px; }

/* المستكشفون */
.j-road__head { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.1rem; }
.j-lvl { width: 60px; height: 60px; border-radius: 50%; background: #8ac926; color: #fff; display: grid; place-items: center; font-size: 1.6rem; font-weight: 800; box-shadow: 0 4px 0 #5f9a12; }
.j-road__head div { display: flex; flex-direction: column; }
.j-road__head small { color: var(--muted); }
.j-road__track { display: flex; justify-content: space-between; position: relative; padding: 0 0.5rem; }
.j-road__track::before { content: ''; position: absolute; top: 50%; left: 1rem; right: 1rem; height: 6px; background: var(--line); border-radius: 6px; transform: translateY(-50%); }
.j-stop { position: relative; z-index: 1; width: 44px; height: 44px; border-radius: 50%; background: var(--surface); border: 3px solid var(--line); display: grid; place-items: center; font-weight: 800; color: var(--muted); }
.j-stop.done { background: #8ac926; border-color: #8ac926; color: #fff; }
.j-stop.now { background: var(--brand); border-color: var(--brand); color: #fff; transform: scale(1.2); box-shadow: 0 0 0 6px color-mix(in srgb, var(--brand) 20%, transparent); }
.j-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.1rem; align-items: start; }
.j-sub { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem; }
.j-sub__i { width: 40px; height: 40px; border-radius: 12px; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); display: grid; place-items: center; }
.j-sub__b { flex: 1; }
.j-sub__t { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem; }
.j-sub__t span { font-weight: 800; color: var(--c); }
.j-badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.8rem; }
.j-badge { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; text-align: center; }
.j-badge span { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #8ac926, #0a9bdc); color: #fff; display: grid; place-items: center; transform: rotate(45deg); }
.j-badge span i { transform: rotate(-45deg); font-size: 1.3rem; }
.j-badge small { font-size: 0.72rem; font-weight: 700; margin-top: 0.4rem; }
.j-badge.locked { opacity: 0.45; }
.j-badge.locked span { background: #c5ced8; }

/* الشباب */
.t-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.7rem; }
.t-kpis div { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 0.75rem 0.95rem; }
.t-kpis small { display: block; color: var(--muted); font-size: 0.75rem; }
.t-kpis b { font-size: 1.6rem; font-variant-numeric: tabular-nums; }
.t-kpis b span { font-size: 0.85rem; color: var(--muted); font-weight: 600; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1rem 1.1rem; }
.t-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1rem; }
.t-avg { display: grid; grid-template-columns: 140px 1fr 40px; gap: 0.75rem; align-items: center; margin-bottom: 0.6rem; font-size: 0.88rem; }
.t-avg__n { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t-avg__track { height: 10px; border-radius: 4px; background: var(--bg); overflow: hidden; }
.t-avg__track span { display: block; height: 100%; border-radius: 4px; }
.t-avg b { font-variant-numeric: tabular-nums; text-align: end; }
.t-line { width: 100%; height: 150px; }
.sq { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-inline-end: 0.45rem; }
.t-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.t-table th { text-align: start; font-size: 0.72rem; color: var(--muted); padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--line); }
.t-table td { padding: 0.6rem; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
@media (max-width: 860px) {
  .t-kpis { grid-template-columns: 1fr 1fr; }
  .t-grid, .j-grid { grid-template-columns: 1fr; }
  .k-jar { flex-wrap: wrap; }
  .k-bars { gap: 0.8rem; }
  .k-bar__tube { width: 46px; height: 140px; }
  .t-table { display: block; overflow-x: auto; }
}
</style>
