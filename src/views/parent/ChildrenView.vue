<template>
  <!-- PA02–PA04: ملف الابن — الدروس، الواجبات والتقييمات، النتائج، الملف -->
  <div>
    <PageHeader title="أبنائي" subtitle="متابعة تفصيلية لكل ابن: ما درسه، ما عليه من واجبات وتقييمات، ونتائجه." />
    <ChildSwitcher :children="children" :model-value="child?.id" @update:model-value="select" />

    <template v-if="child && r">
      <div class="head panel">
        <span class="head__av" :class="child.gender">{{ child.firstName.charAt(0) }}</span>
        <div class="head__t">
          <h2>{{ child.name }}</h2>
          <p class="muted">{{ child.className }} · {{ child.schoolName }}</p>
        </div>
        <RouterLink :to="{ name: 'child-report', query: { child: child.id } }" class="btn-o"><i class="pi pi-chart-line" /> التقرير الدوري</RouterLink>
      </div>

      <div class="tabs">
        <button v-for="tb in TABS" :key="tb.key" type="button" class="pill" :class="{ 'is-active': tab === tb.key }" @click="tab = tb.key"><i :class="tb.icon" /> {{ tb.label }}</button>
      </div>

      <!-- الدروس -->
      <div v-if="tab === 'lessons'" class="subj">
        <div v-for="s in r.subjects" :key="s.id" class="panel sj" :style="{ '--c': s.color }">
          <div class="sj__h"><span class="sj__ic"><i :class="s.icon" /></span><b>{{ s.name }}</b><bdi class="sj__p" dir="ltr">{{ s.progress }}%</bdi></div>
          <div class="sj__bar"><i :style="{ width: s.progress + '%' }" /></div>
          <small class="muted">{{ s.doneCount }} من {{ s.lessonsCount }} درساً</small>
          <p v-if="s.next" class="sj__next"><i class="pi pi-arrow-left flip" /> الدرس التالي: <b>{{ s.next.title }}</b></p>
          <p v-else class="sj__next done"><i class="pi pi-check" /> أكمل كل الدروس</p>
        </div>
      </div>

      <!-- الواجبات والتقييمات -->
      <RecordTable v-else-if="tab === 'tasks'" :rows="acts" :columns="[
        { field: 'title', label: 'العمل' }, { field: 'subjectName', label: 'المادة' }, { field: 'typeLabel', label: 'النوع' },
        { field: 'due', label: 'آخر أجل', type: 'date' }, { field: 'stateTag', label: 'الحالة', type: 'status' }, { field: 'scoreLabel', label: 'العلامة' }
      ]" :search-keys="['title', 'subjectName']" :filters="[{ key: 'stateTag', label: 'الحالة', options: [{ label: 'متأخر', value: 'late' }, { label: 'مفتوح', value: 'open' }, { label: 'بانتظار التصحيح', value: 'submitted' }, { label: 'مصحَّح', value: 'graded' }] }]" unit="عمل" />

      <!-- النتائج -->
      <div v-else-if="tab === 'grades'" class="grades-g">
        <section class="panel">
          <h3 class="sec">تطوّر العلامات</h3>
          <TrendLine v-if="r.history.length > 1" :data="r.history.slice(-10).reverse().map((g, i) => ({ label: new Date(g.at).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' }), value: g.score20 }))" :max="20" suffix="/20" label="تطور العلامات" />
          <p v-else class="muted">لا تكفي النتائج لرسم المنحنى بعد.</p>
        </section>
        <section class="panel">
          <h3 class="sec">المعدل حسب المادة</h3>
          <BarList :rows="r.subjects.filter((s) => s.average !== null).map((s) => ({ label: s.name, value: s.average }))" :max="20" suffix="/20" :warn-below="10" />
        </section>
        <RecordTable class="span2" :rows="r.history.slice().reverse().map((g) => ({ ...g, id: g.id }))" :columns="[{ field: 'title', label: 'العمل' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'score20', label: 'العلامة /20' }]" unit="نتيجة" />
      </div>

      <!-- الملف -->
      <div v-else class="panel profile">
        <dl>
          <div><dt>الاسم الكامل</dt><dd>{{ child.name }}</dd></div>
          <div><dt>القسم</dt><dd>{{ child.className }}</dd></div>
          <div><dt>المستوى</dt><dd>{{ child.levelName }}</dd></div>
          <div><dt>المدرسة</dt><dd>{{ child.schoolName }}</dd></div>
          <div><dt>نقاط التلميذ</dt><dd>{{ r.stars }}</dd></div>
          <div><dt>الشارات</dt><dd>{{ r.badges.map((b) => b.title).join('، ') || '—' }}</dd></div>
        </dl>
        <p class="muted note"><i class="pi pi-info-circle" /> لتعديل بيانات ابنك أو ربط ابن آخر بحسابك، تواصل مع إدارة المدرسة.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import ChildSwitcher from '@/components/parent/ChildSwitcher.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import BarList from '@/components/ui/BarList.vue'
import TrendLine from '@/components/ui/TrendLine.vue'
import { useChild } from '@/composables/useChild'
import * as learning from '@/api/learning'

const route = useRoute()
const { children, child, select } = useChild()
const TABS = [
  { key: 'lessons', label: 'الدروس', icon: 'pi pi-book' },
  { key: 'tasks', label: 'الواجبات والتقييمات', icon: 'pi pi-pencil' },
  { key: 'grades', label: 'النتائج', icon: 'pi pi-chart-line' },
  { key: 'profile', label: 'الملف', icon: 'pi pi-id-card' }
]
const tab = ref(route.query.tab || 'lessons')
const r = ref(null)
const acts = ref([])

watch(child, async (c) => {
  if (!c) return
  r.value = null
  const [rep, a] = await Promise.all([learning.progressReport(c.id, c.levelId), learning.myActivities(c.id, c.levelId)])
  acts.value = a.map((x) => ({
    ...x, subjectName: x.subject?.name, typeLabel: x.type === 'quiz' ? 'تقييم' : 'واجب',
    stateTag: x.state === 'todo' ? 'open' : x.state, scoreLabel: x.score !== null ? `${x.score}/${x.maxScore}` : '—'
  }))
  r.value = rep
}, { immediate: true })
</script>

<style scoped>
.head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.head__av { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 1.4rem; font-weight: 800; background: #0a9bdc; }
.head__av.female { background: #d6458b; }
.head__t h2 { margin: 0; font-size: 1.2rem; }
.head__t p { margin: 0.15rem 0 0; }
.btn-o { margin-inline-start: auto; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 10px; border: 1.5px solid var(--line); color: var(--ink); text-decoration: none; font-weight: 700; }
.btn-o:hover { border-color: var(--brand); color: var(--brand); }
.tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.subj { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); gap: 0.85rem; }
.sj { border-top: 4px solid var(--c); }
.sj__h { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; }
.sj__ic { width: 34px; height: 34px; border-radius: 10px; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); display: grid; place-items: center; }
.sj__p { margin-inline-start: auto; font-weight: 800; }
.sj__bar { height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 0.35rem; }
.sj__bar i { display: block; height: 100%; background: var(--c); }
.sj__next { margin: 0.6rem 0 0; font-size: 0.86rem; }
.sj__next.done { color: #17733f; }
.grades-g { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.span2 { grid-column: 1 / -1; }
.sec { font-size: 1rem; margin: 0 0 0.75rem; }
.profile dl { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)); gap: 0.85rem; margin: 0; }
.profile dt { font-size: 0.8rem; color: var(--p-text-muted-color); }
.profile dd { margin: 0.15rem 0 0; font-weight: 700; }
.note { margin: 1.25rem 0 0; font-size: 0.86rem; }
@media (max-width: 900px) { .grades-g { grid-template-columns: minmax(0, 1fr); } }
</style>
