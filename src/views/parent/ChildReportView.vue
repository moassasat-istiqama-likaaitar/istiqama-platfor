<template>
  <!-- PA05: التقرير الدوري — ملخص مقروء + طباعة كشف النقاط بشعار المؤسسة والمدرسة -->
  <div>
    <PageHeader title="التقرير الدوري" subtitle="ملخص أداء ابنك في الفترة، قابل للطباعة." />
    <ChildSwitcher v-if="children.length > 1" :children="children" :model-value="child?.id" @update:model-value="select" />
    <template v-if="child && r">
      <div class="rp-actions">
        <RouterLink :to="{ name: 'report-card', query: { child: child.id } }" class="p-button p-component"><i class="pi pi-print" />&nbsp; طباعة كشف النقاط</RouterLink>
      </div>
      <section class="panel summary">
        <h2>{{ child.name }} — {{ child.levelName }}</h2>
        <p>{{ sentence }}</p>
      </section>
      <StatTiles :items="[
        { label: 'الدروس المنجزة', value: `${r.totals.lessons}/${r.totals.lessonsAll}`, icon: 'pi pi-book' },
        { label: 'الأعمال المنجزة', value: r.totals.activities, icon: 'pi pi-check-square', tone: 'green' },
        { label: 'المعدل العام', value: avg ?? '—', icon: 'pi pi-chart-line', tone: 'purple', hint: 'على 20' },
        { label: 'الشارات', value: r.badges.length, icon: 'pi pi-trophy', tone: 'amber' }
      ]" />
      <RecordTable :rows="r.subjects" :columns="[
        { field: 'name', label: 'المادة' }, { field: 'progress', label: 'التقدّم', type: 'progress' },
        { field: 'quizzesLabel', label: 'الاختبارات' }, { field: 'homeworkLabel', label: 'الواجبات' }, { field: 'average', label: 'المعدل /20' }, { field: 'appreciation', label: 'التقدير' }
      ]" unit="مادة" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import ChildSwitcher from '@/components/parent/ChildSwitcher.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useChild } from '@/composables/useChild'
import * as learning from '@/api/learning'

const { children, child, select } = useChild()
const r = ref(null)
const appr = (v) => (v === null ? '—' : v >= 16 ? 'ممتاز' : v >= 14 ? 'جيد جداً' : v >= 12 ? 'جيد' : v >= 10 ? 'مقبول' : 'يحتاج دعماً')
watch(child, async (c) => {
  if (!c) return
  const rep = await learning.progressReport(c.id, c.levelId)
  rep.subjects = rep.subjects.map((s) => ({ ...s, quizzesLabel: `${s.quizzesDone}/${s.quizzesTotal}`, homeworkLabel: `${s.homeworkDone}/${s.homeworkTotal}`, average: s.average ?? '—', appreciation: appr(s.average) }))
  r.value = rep
}, { immediate: true })
const avg = computed(() => {
  const xs = (r.value?.subjects || []).map((s) => s.average).filter((v) => typeof v === 'number')
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null
})
const sentence = computed(() => {
  if (!r.value) return ''
  const best = r.value.subjects.slice().sort((a, b) => b.progress - a.progress)[0]
  const weak = r.value.subjects.slice().sort((a, b) => a.progress - b.progress)[0]
  return `أنجز ${child.value.firstName} ${r.value.totals.lessons} درساً من ${r.value.totals.lessonsAll}${avg.value !== null ? ` بمعدل ${avg.value}/20` : ''}. أفضل تقدّم في «${best?.name}»، ويحتاج متابعة أكبر في «${weak?.name}».`
})
</script>

<style scoped>
.rp-actions { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
.rp-actions a { text-decoration: none; }
.summary { margin-bottom: 1rem; }
.summary h2 { margin: 0 0 0.4rem; font-size: 1.1rem; }
.summary p { margin: 0; line-height: 1.8; }
</style>
