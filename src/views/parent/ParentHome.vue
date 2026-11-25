<template>
  <!-- PA01: لوحة الولي — ابن واحد في كل مرة، ما يحتاج انتباهك أولاً -->
  <div class="ph">
    <PageHeader :title="`السلام عليكم، ${auth.person.firstName}`" :subtitle="children.length > 1 ? `لديك ${children.length} أبناء في المنصة — اختر الابن لعرض متابعته` : 'متابعة ابنك في المنصة'" />
    <ChildSwitcher v-if="children.length > 1" :children="children" :model-value="child?.id" @update:model-value="select" />

    <template v-if="child && d">
      <SchoolBanner :school="brand.school" :branding="brand.branding" variant="teens" class="ph__banner" />

      <StatTiles :items="[
        { label: 'التقدّم في الدروس', value: d.progress + '%', icon: 'pi pi-book', hint: `${d.doneLessons} من ${d.totalLessons} درساً` },
        { label: 'المعدل العام', value: avg ?? '—', icon: 'pi pi-chart-line', tone: avg !== null && avg < 10 ? 'red' : 'green', hint: 'على 20' },
        { label: 'أعمال متأخرة', value: late.length, icon: 'pi pi-exclamation-circle', tone: late.length ? 'red' : 'green', hint: late.length ? 'تحتاج متابعتك' : 'لا شيء متأخر' },
        { label: 'المواظبة', value: d.streak + ' يوم', icon: 'pi pi-bolt', tone: 'amber', hint: 'أيام متتالية من التعلم' }
      ]" />

      <div class="ph__grid">
        <section class="panel">
          <h2 class="sec"><i class="pi pi-bell" /> يحتاج انتباهك</h2>
          <ul v-if="alerts.length" class="alerts">
            <li v-for="(a, i) in alerts" :key="i" :class="'al--' + a.tone"><i :class="a.icon" /><div><b>{{ a.title }}</b><small>{{ a.text }}</small></div></li>
          </ul>
          <p v-else class="muted ok"><i class="pi pi-check-circle" /> كل شيء على ما يرام هذا الأسبوع.</p>
        </section>

        <section class="panel">
          <h2 class="sec"><i class="pi pi-calendar" /> أعمال هذا الأسبوع</h2>
          <ul v-if="week.length" class="tasks">
            <li v-for="a in week" :key="a.id">
              <span class="tk__ic" :style="{ background: a.subject?.color }"><i :class="a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
              <div><b>{{ a.title }}</b><small>{{ a.subject?.name }} · {{ dueText(a.due) }}</small></div>
              <StatusTag :status="a.state === 'todo' ? 'open' : a.state" />
            </li>
          </ul>
          <p v-else class="muted">لا أعمال مبرمجة هذا الأسبوع.</p>
        </section>

        <section class="panel">
          <h2 class="sec"><i class="pi pi-chart-bar" /> التقدّم حسب المادة</h2>
          <BarList :rows="d.subjects.map((s) => ({ label: s.name, value: s.progress }))" :max="100" suffix="%" />
        </section>

        <section class="panel">
          <h2 class="sec"><i class="pi pi-star" /> آخر النتائج</h2>
          <ul v-if="r.history.length" class="grades">
            <li v-for="g in r.history.slice(-5).reverse()" :key="g.id"><span>{{ g.title }}</span><b :class="{ low: g.score20 < 10 }"><bdi dir="ltr">{{ g.score20 }}/20</bdi></b></li>
          </ul>
          <p v-else class="muted">لا نتائج بعد.</p>
          <RouterLink :to="{ name: 'children', query: { child: child.id, tab: 'grades' } }" class="more">كل النتائج <i class="pi pi-arrow-left flip" /></RouterLink>
        </section>

        <section class="panel span2">
          <h2 class="sec"><i class="pi pi-users" /> معلمو {{ child.firstName }}</h2>
          <div class="teachers">
            <div v-for="tc in teachers" :key="tc.id" class="tc">
              <span class="tc__av">{{ tc.name.charAt(0) }}</span>
              <div><b>{{ tc.gender === 'female' ? 'الأستاذة' : 'الأستاذ' }} {{ tc.name }}</b><small>{{ tc.subjects.join('، ') }}</small></div>
              <RouterLink v-if="tc.canMessage" :to="{ name: 'messages', query: { to: tc.id, subject: `متابعة ${child.firstName}` } }" class="tc__msg"><i class="pi pi-envelope" /> مراسلة</RouterLink>
            </div>
          </div>
        </section>
      </div>
    </template>
    <EmptyState v-else-if="!children.length" icon="pi pi-users" title="لا يوجد أبناء مرتبطون بحسابك" text="تواصل مع إدارة المدرسة لربط أبنائك بحسابك." class="panel" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import ChildSwitcher from '@/components/parent/ChildSwitcher.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import BarList from '@/components/ui/BarList.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import { useChild } from '@/composables/useChild'
import * as learning from '@/api/learning'
import { classTeachers } from '@/api/people'

const auth = useAuthStore()
const brand = useBrandStore()
const { children, child, select } = useChild()
const d = ref(null)
const r = ref(null)
const acts = ref([])
const teachers = ref([])

watch(child, async (c) => {
  if (!c) return
  d.value = null
  const [a, b, x, tch] = await Promise.all([learning.dashboard(c.id, c.levelId), learning.progressReport(c.id, c.levelId), learning.myActivities(c.id, c.levelId), classTeachers(c.classId)])
  r.value = b
  acts.value = x
  teachers.value = tch
  d.value = a
}, { immediate: true })

const avg = computed(() => {
  const xs = r.value?.subjects.map((s) => s.average).filter((v) => v !== null) || []
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null
})
const late = computed(() => acts.value.filter((a) => a.state === 'late'))
const week = computed(() => {
  const end = Date.now() + 7 * 864e5
  return acts.value.filter((a) => ['todo', 'late'].includes(a.state) && new Date(a.due) < end).slice(0, 6)
})
const alerts = computed(() => {
  const out = []
  late.value.slice(0, 3).forEach((a) => out.push({ tone: 'red', icon: 'pi pi-exclamation-circle', title: `متأخر: ${a.title}`, text: `${a.subject?.name} — كان آخر أجل ${new Date(a.due).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' })}` }))
  ;(r.value?.history || []).filter((g) => g.score20 < 10).slice(-2).forEach((g) => out.push({ tone: 'amber', icon: 'pi pi-arrow-down', title: `علامة تحتاج دعماً: ${g.score20}/20`, text: g.title }))
  ;(d.value?.subjects || []).filter((s) => s.progress < 20 && s.lessonsCount).slice(0, 2).forEach((s) => out.push({ tone: 'blue', icon: 'pi pi-info-circle', title: `تقدّم بطيء في ${s.name}`, text: `${s.doneCount} من ${s.lessonsCount} درساً` }))
  return out
})
const dueText = (iso) => {
  const days = Math.ceil((new Date(iso) - Date.now()) / 864e5)
  return days < 0 ? `متأخر ${-days} يوم` : days === 0 ? 'اليوم' : days === 1 ? 'غداً' : `بعد ${days} أيام`
}
</script>

<style scoped>
.ph__banner { margin-bottom: 1.1rem; }
.ph__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.span2 { grid-column: 1 / -1; }
.sec { font-size: 1rem; margin: 0 0 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
.sec i { color: var(--brand); }
.alerts, .tasks, .grades { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.alerts li { display: flex; gap: 0.7rem; padding: 0.6rem 0.75rem; border-radius: 10px; }
.alerts li > i { margin-top: 0.2rem; }
.alerts b { display: block; font-size: 0.9rem; }
.alerts small { color: var(--p-text-muted-color); }
.al--red { background: #fdeeee; } .al--red > i { color: #b42318; }
.al--amber { background: #fff6e0; } .al--amber > i { color: #a15c00; }
.al--blue { background: #ebf2fe; } .al--blue > i { color: #2350c8; }
.ok i { color: #17733f; }
.tasks li { display: grid; grid-template-columns: auto 1fr auto; gap: 0.65rem; align-items: center; }
.tk__ic { width: 34px; height: 34px; border-radius: 10px; color: #fff; display: grid; place-items: center; }
.tasks b { display: block; font-size: 0.9rem; }
.tasks small { color: var(--p-text-muted-color); font-size: 0.78rem; }
.grades li { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--line); }
.grades b.low { color: #b42318; }
.more { display: inline-flex; gap: 0.35rem; align-items: center; margin-top: 0.75rem; font-size: 0.86rem; color: var(--brand); text-decoration: none; font-weight: 700; }
.teachers { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; }
.tc { display: flex; align-items: center; gap: 0.7rem; padding: 0.7rem; border: 1px solid var(--line); border-radius: 12px; }
.tc__av { width: 38px; height: 38px; border-radius: 50%; background: color-mix(in srgb, var(--brand) 14%, #fff); color: var(--brand); display: grid; place-items: center; font-weight: 800; }
.tc b { display: block; font-size: 0.9rem; }
.tc small { color: var(--p-text-muted-color); font-size: 0.78rem; }
.tc__msg { margin-inline-start: auto; font-size: 0.82rem; color: var(--brand); text-decoration: none; font-weight: 700; white-space: nowrap; }
@media (max-width: 900px) { .ph__grid { grid-template-columns: 1fr; } }
</style>
