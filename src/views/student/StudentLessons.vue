<template>
  <!-- ST02: دروسي — المواد ونسبة التقدم -->
  <div class="sl" :class="`sl--${theme}`">
    <header class="sl__head">
      <h1>{{ titles[theme] }}</h1>
      <div v-if="theme !== 'kids'" class="search">
        <i class="pi pi-search" />
        <input v-model="q" type="search" :placeholder="t('student.searchPlaceholder')" @input="debounced" />
      </div>
      <div v-if="theme !== 'kids'" class="types">
        <button v-for="ty in types" :key="ty" type="button" class="pill" :class="{ 'is-active': type === ty }" @click="setType(ty)">
          <i :class="typeIcon[ty]" /> {{ ty === 'all' ? t('common.all') : t(`student.types.${ty}`) }}
        </button>
      </div>
    </header>

    <!-- نتائج البحث -->
    <section v-if="searching">
      <div v-if="results.length" class="results">
        <RouterLink v-for="r in results" :key="r.id" :to="`/app/lesson/${r.lessonId}?c=${r.id}`" class="res" :style="{ '--c': r.subject.color }">
          <span class="res__icon"><i :class="typeIcon[r.type]" /></span>
          <div class="res__body"><strong>{{ r.title }}</strong><small>{{ r.subject.name }} · {{ r.lessonTitle }}</small></div>
          <span class="chip">{{ t(`student.types.${r.type}`) }}</span>
        </RouterLink>
      </div>
      <EmptyState v-else icon="pi pi-search" :text="t('student.searchEmpty')" />
    </section>

    <!-- البراعم: مربعات كبيرة -->
    <div v-else-if="theme === 'kids'" class="k-tiles">
      <RouterLink v-for="s in subjects" :key="s.id" :to="`/app/subject/${s.id}`" class="k-tile" :style="{ '--c': s.color }">
        <span v-if="s.newCount" class="k-tile__new">{{ s.newCount }}</span>
        <span class="k-tile__icon"><i :class="s.icon" /></span>
        <strong>{{ s.name }}</strong>
        <span class="k-tile__bar"><span :style="{ width: s.progress + '%' }" /></span>
      </RouterLink>
    </div>

    <!-- المستكشفون: بطاقات مناطق -->
    <div v-else-if="theme === 'juniors'" class="j-regions">
      <RouterLink v-for="s in subjects" :key="s.id" :to="`/app/subject/${s.id}`" class="j-region" :style="{ '--c': s.color }">
        <span class="j-region__icon"><i :class="s.icon" /></span>
        <div class="j-region__b">
          <strong>{{ s.name }}</strong>
          <small>{{ s.axes?.length }} فصول · {{ s.doneCount }}/{{ s.lessonsCount }} درساً</small>
          <div class="j-region__bar"><span :style="{ width: s.progress + '%' }" /></div>
        </div>
        <span class="j-region__pct">{{ s.progress }}%</span>
      </RouterLink>
    </div>

    <!-- الشباب: جدول مقررات -->
    <table v-else class="t-table">
      <thead><tr><th>المقرر</th><th>المحاور</th><th>الدروس</th><th class="w">التقدّم</th><th /></tr></thead>
      <tbody>
        <tr v-for="s in subjects" :key="s.id" @click="$router.push(`/app/subject/${s.id}`)">
          <td><span class="sq" :style="{ background: s.color }" /> <b>{{ s.name }}</b> <span v-if="s.newCount" class="new">{{ s.newCount }} جديد</span></td>
          <td class="num">{{ s.axes?.length }}</td>
          <td class="num">{{ s.doneCount }}/{{ s.lessonsCount }}</td>
          <td><div class="bar" :style="{ '--bar-color': s.color }"><span :style="{ width: s.progress + '%' }" /></div></td>
          <td class="num">{{ s.progress }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const route = useRoute()
const student = useStudentStore()
const theme = computed(() => student.theme)
const titles = { kids: 'دروسي', juniors: 'مناطق الاستكشاف', teens: 'المقررات' }
const subjects = ref([])
const q = ref(route.query.q || '')
const type = ref('all')
const results = ref([])
const types = ['all', 'video', 'slides', 'pdf', 'image']
const typeIcon = { all: 'pi pi-th-large', video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const searching = computed(() => q.value.trim() || type.value !== 'all')

onMounted(async () => {
  const d = await student.refresh()
  subjects.value = d.subjects
  if (searching.value) run()
})
let timer
function debounced() {
  clearTimeout(timer)
  timer = setTimeout(run, 200)
}
function setType(ty) {
  type.value = ty
  run()
}
async function run() {
  if (searching.value) results.value = await learning.search(student.levelId, q.value, type.value)
}
</script>

<style scoped>
.sl { display: flex; flex-direction: column; gap: 1.1rem; }
.sl__head h1 { margin: 0 0 0.7rem; font-size: 1.8rem; }
.search { position: relative; }
.search i { position: absolute; top: 50%; transform: translateY(-50%); inset-inline-start: 1rem; color: var(--muted); }
.search input { width: 100%; padding: 0.85rem 1.1rem; padding-inline-start: 2.8rem; border-radius: var(--radius); border: 2px solid var(--line); background: var(--surface); font: inherit; color: var(--ink); outline: none; }
.search input:focus { border-color: var(--brand); }
.types { display: flex; gap: 0.45rem; flex-wrap: wrap; margin-top: 0.6rem; }
.results { display: flex; flex-direction: column; gap: 0.55rem; }
.res { display: flex; align-items: center; gap: 0.8rem; padding: 0.75rem 1rem; background: var(--surface); border-radius: var(--radius); text-decoration: none; color: inherit; border-inline-start: 5px solid var(--c); box-shadow: var(--shadow); }
.res__icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); }
.res__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.res__body small { color: var(--muted); }

.k-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.1rem; }
.k-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding: 2rem 1rem 1.5rem; border-radius: 32px; background: var(--c); color: #fff; text-decoration: none; box-shadow: 0 8px 0 color-mix(in srgb, var(--c) 60%, #000); }
.k-tile:active { transform: translateY(6px); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 60%, #000); }
.k-tile__icon { width: 100px; height: 100px; border-radius: 50%; background: rgba(255, 255, 255, 0.22); display: grid; place-items: center; }
.k-tile__icon i { font-size: 2.8rem; }
.k-tile strong { font-family: var(--font-display); font-size: 1.6rem; }
.k-tile__bar { width: 70%; height: 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.3); overflow: hidden; }
.k-tile__bar span { display: block; height: 100%; background: #ffe066; }
.k-tile__new { position: absolute; top: 14px; inset-inline-end: 14px; background: #fff; color: #ef4444; font-weight: 800; min-width: 36px; height: 36px; border-radius: 999px; display: grid; place-items: center; }

.j-regions { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.9rem; }
.j-region { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.1rem; border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow); text-decoration: none; color: inherit; border-inline-start: 7px solid var(--c); }
.j-region__icon { width: 56px; height: 56px; border-radius: 16px; background: var(--c); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.j-region__icon i { font-size: 1.5rem; }
.j-region__b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.j-region__b strong { font-family: var(--font-display); font-size: 1.15rem; }
.j-region__b small { color: var(--muted); }
.j-region__bar { height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--c) 15%, #fff); overflow: hidden; margin-top: 0.3rem; }
.j-region__bar span { display: block; height: 100%; background: var(--c); }
.j-region__pct { font-weight: 800; font-size: 1.2rem; color: var(--c); }

.t-table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.t-table th { text-align: start; font-size: 0.75rem; color: var(--muted); padding: 0.6rem 1rem; border-bottom: 1px solid var(--line); }
.t-table td { padding: 0.8rem 1rem; border-bottom: 1px solid var(--line); }
.t-table tbody tr { cursor: pointer; }
.t-table tbody tr:hover { background: var(--bg); }
.sq { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-inline-end: 0.4rem; }
.num { font-variant-numeric: tabular-nums; color: var(--muted); }
.w { width: 35%; }
.new { font-size: 0.7rem; background: color-mix(in srgb, var(--brand) 12%, #fff); color: var(--brand); padding: 0.05rem 0.4rem; border-radius: 6px; margin-inline-start: 0.4rem; }
@media (max-width: 560px) { .k-tiles { grid-template-columns: 1fr 1fr; } .k-tile__icon { width: 70px; height: 70px; } .k-tile strong { font-size: 1.15rem; text-align: center; } .j-regions { grid-template-columns: 1fr; } }
</style>
