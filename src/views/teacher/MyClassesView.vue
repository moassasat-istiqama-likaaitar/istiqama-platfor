<template>
  <!-- TE02/TE03/TE06/TE07: أقسامي — التلاميذ، خطة الدروس (فتح الدروس + درس الأسبوع)، إحصائيات القسم -->
  <div>
    <PageHeader title="أقسامي" subtitle="تابع تلاميذ كل قسم، وحدّد الدروس المفتوحة ودرس الأسبوع الذي تقترحه المنصة على تلاميذك." />

    <div class="cls">
      <button v-for="c in list" :key="c.id" type="button" class="cl" :class="{ on: c.id === cur?.id }" @click="pick(c.id)">
        <b>{{ c.name }}</b><small>{{ c.students }} تلميذاً · {{ c.levelName }}</small>
      </button>
    </div>

    <template v-if="cur">
      <StatTiles :items="[
        { label: 'التلاميذ', value: cur.students, icon: 'pi pi-users' },
        { label: 'تقدّم القسم', value: cur.progress + '%', icon: 'pi pi-book', tone: 'purple' },
        { label: 'معدل القسم', value: cur.average, icon: 'pi pi-chart-line', tone: 'green', hint: 'على 20' },
        { label: 'يحتاجون متابعة', value: cur.atRisk, icon: 'pi pi-exclamation-triangle', tone: cur.atRisk ? 'red' : 'green' }
      ]" />

      <div class="tabs">
        <button v-for="tb in TABS" :key="tb.key" type="button" class="pill" :class="{ 'is-active': tab === tb.key }" @click="tab = tb.key"><i :class="tb.icon" /> {{ tb.label }}</button>
      </div>

      <!-- التلاميذ -->
      <RecordTable v-if="tab === 'students'" :rows="students" :columns="[
        { field: 'name', label: 'التلميذ', type: 'person', sub: 'parents' }, { field: 'progress', label: 'التقدّم', type: 'progress' },
        { field: 'average', label: 'المعدل' }, { field: 'late', label: 'متأخرات' }, { field: 'seen', label: 'آخر دخول' }
      ]" :search-keys="['name', 'parents']" :filters="[{ key: 'risk', label: 'الحالة', options: [{ label: 'يحتاج متابعة', value: true }, { label: 'في المسار', value: false }] }]" unit="تلميذ" :row-class="(r) => (r.risk ? 'row-risk' : '')">
        <template #actions="{ row }">
          <Button icon="pi pi-eye" text rounded size="small" title="ملف التلميذ" @click="openStudent(row)" />
        </template>
      </RecordTable>

      <!-- خطة الدروس -->
      <div v-else-if="tab === 'plan' && plan" class="plan">
        <div class="panel plan__mode">
          <div>
            <h3>فتح الدروس لتلاميذ القسم</h3>
            <p class="muted">المحرر يفتح دروس المستوى أولاً. «تلقائي»: كل ما فتحه المحرر يُفتح لتلاميذك في موعده. «يدوي»: تفتح أنت ما فتحه المحرر، فوراً أو بتاريخ، حتى لا يسبق التلميذ الشرح في القسم.</p>
          </div>
          <div class="seg">
            <button type="button" :class="{ on: plan.mode === 'follow' }" @click="setMode('follow')"><i class="pi pi-sync" /> تلقائي (يتبع المحرر)</button>
            <button type="button" :class="{ on: plan.mode === 'manual' }" @click="setMode('manual')"><i class="pi pi-calendar" /> يدوي / مجدول</button>
          </div>
        </div>
        <p class="muted hint"><i class="pi pi-star-fill" style="color: #f5a400" /> «درس الأسبوع» يظهر لكل تلاميذ القسم كدرس مقترح في رئيسيتهم، قبل اقتراح المنصة الآلي.</p>

        <details v-for="s in plan.subjects" :key="s.id" class="panel subj" :open="s === plan.subjects[0]">
          <summary><span class="ic" :style="{ background: s.color }"><i :class="s.icon" /></span> <b>{{ s.name }}</b> <small class="muted">{{ s.lessons.filter((l) => l.open).length }} / {{ s.lessons.length }} مفتوح</small></summary>
          <table class="lt">
            <thead><tr><th>#</th><th>الدرس</th><th>أنجزه</th><th>المحرر</th><th>لتلاميذي</th><th>درس الأسبوع</th></tr></thead>
            <tbody>
              <tr v-for="l in s.lessons" :key="l.id" :class="{ closed: !l.open, week: l.week }">
                <td>{{ l.order }}</td>
                <td><b>{{ l.title }}</b><small class="muted"> · {{ l.axis }}</small></td>
                <td><bdi dir="ltr">{{ l.doneBy }}/{{ plan.students }}</bdi></td>
                <td><OpenControl :at="l.editorAt" readonly /></td>
                <td>
                  <OpenControl :at="l.teacherAt" :readonly="plan.mode === 'follow'" :locked="l.editorState === 'closed' ? 'لم يفتحه المحرر' : ''" @set="(v) => setOpen(l, v)" />
                </td>
                <td><button type="button" class="star" :class="{ on: l.week }" :disabled="!l.open" :title="l.week ? 'إلغاء' : 'اجعله درس الأسبوع'" @click="toggleWeek(s, l)"><i :class="l.week ? 'pi pi-star-fill' : 'pi pi-star'" /></button></td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>

      <!-- الإحصائيات -->
      <div v-else-if="tab === 'stats' && plan" class="stats">
        <section class="panel">
          <h3>إنجاز الدروس حسب المادة</h3>
          <BarList :rows="plan.subjects.map((s) => ({ label: s.name, value: Math.round((s.lessons.reduce((n, l) => n + l.doneBy, 0) / Math.max(1, s.lessons.length * plan.students)) * 100) }))" :max="100" suffix="%" />
        </section>
        <section class="panel">
          <h3>توزيع التلاميذ حسب التقدّم</h3>
          <BarList :rows="buckets" suffix=" تلميذ" />
        </section>
      </div>
    </template>

    <Dialog v-model:visible="sDlg" modal :header="sel?.name" :style="{ width: 'min(520px, 94vw)' }">
      <div v-if="sel" class="sd">
        <StatTiles :items="[
          { label: 'التقدّم', value: sel.progress + '%', icon: 'pi pi-book' },
          { label: 'المعدل', value: sel.average ?? '—', icon: 'pi pi-chart-line', tone: 'green' },
          { label: 'متأخرات', value: sel.late, icon: 'pi pi-clock', tone: sel.late ? 'red' : 'green' },
          { label: 'دقائق هذا الأسبوع', value: sel.minutesWeek, icon: 'pi pi-stopwatch', tone: 'purple' }
        ]" />
        <p><b>الولي:</b> {{ sel.parents }}</p>
        <p class="muted">آخر دخول: {{ sel.seen }}</p>
        <div class="gb">
          <b>امنح شارة</b> <small class="muted">تظهر للتلميذ في «تقدمي» باسمك</small>
          <div class="gb__list">
            <button v-for="b in MANUAL_BADGES" :key="b.id" type="button" class="gb__b" :class="{ on: badgeSel === b.id, has: owned.includes(b.id) }" :disabled="owned.includes(b.id)" @click="badgeSel = b.id"><i :class="b.icon" /> {{ b.title }}<i v-if="owned.includes(b.id)" class="pi pi-check" /></button>
          </div>
          <div v-if="badgeSel" class="gb__go"><InputText v-model="badgeNote" placeholder="لماذا؟ (اختياري) — مثال: ساعد زميله في الحفظ" fluid /><Button label="منح" icon="pi pi-gift" size="small" @click="give" /></div>
        </div>
      </div>
      <template #footer>
        <RouterLink v-if="sel?.real" :to="{ name: 'messages', query: { to: sel.id, subject: 'متابعة' } }" class="p-button p-component p-button-text">مراسلة التلميذ</RouterLink>
        <Button label="إغلاق" @click="sDlg = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import OpenControl from '@/components/plan/OpenControl.vue'
import InputText from 'primevue/inputtext'
import { giveBadge, studentBadges, MANUAL_BADGES } from '@/api/teaching'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import BarList from '@/components/ui/BarList.vue'
import { useAuthStore } from '@/stores/auth'
import { listClasses, classStudents } from '@/api/people'
import { classPlan, savePlan } from '@/api/teaching'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const TABS = [{ key: 'students', label: 'التلاميذ', icon: 'pi pi-users' }, { key: 'plan', label: 'خطة الدروس', icon: 'pi pi-list-check' }, { key: 'stats', label: 'إحصائيات القسم', icon: 'pi pi-chart-bar' }]
const tab = ref('students')
const list = ref([])
const students = ref([])
const plan = ref(null)
const sDlg = ref(false)
const sel = ref(null)

const cur = computed(() => list.value.find((c) => c.id === route.query.class) || list.value[0])
const pick = (id) => router.replace({ query: { class: id } })

watch(() => auth.activeAssignmentId, async () => (list.value = await listClasses({ classIds: auth.active.classIds || [] })), { immediate: true })
watch(cur, async (c) => {
  if (!c) return
  const [st, pl] = await Promise.all([classStudents(c.id), classPlan(c.id)])
  students.value = st.map((s) => ({ ...s, risk: s.progress < 30 || s.late >= 3, average: s.average ?? '—', seen: s.lastSeenDays === 0 ? 'اليوم' : s.lastSeenDays === 1 ? 'أمس' : `منذ ${s.lastSeenDays} أيام` }))
  plan.value = pl
})

const buckets = computed(() => {
  const b = [['أقل من 30%', 0, 30], ['30% – 60%', 30, 60], ['60% – 80%', 60, 80], ['أكثر من 80%', 80, 101]]
  return b.map(([label, lo, hi]) => ({ label, value: students.value.filter((s) => s.progress >= lo && s.progress < hi).length }))
})

async function persist(patch, msg) {
  await savePlan(cur.value.id, patch)
  plan.value = await classPlan(cur.value.id)
  if (msg) toast.add({ severity: 'success', summary: msg, life: 2200 })
}
// عند التحويل إلى «يدوي» نبدأ مما هو مفتوح حالياً حتى لا تُغلق الدروس فجأة على التلاميذ
const setMode = (mode) => persist(mode === 'manual' && !Object.keys(plan.value.opens || {}).length ? { mode, opens: Object.fromEntries(plan.value.subjects.flatMap((s) => s.lessons.filter((l) => l.open).map((l) => [l.id, l.editorAt]))) } : { mode }, mode === 'follow' ? 'تلقائي: ما يفتحه المحرر يُفتح لتلاميذك في موعده' : 'يدوي: افتح الدروس لتلاميذك فوراً أو بتاريخ')
function setOpen(l, at) {
  // لا يُفتح للتلميذ قبل موعد المحرر
  const v = at && l.editorAt && at < l.editorAt ? l.editorAt : at
  persist({ opens: { ...(plan.value.opens || {}), [l.id]: v } }, !v ? `أُغلق «${l.title}»` : v <= new Date().toISOString() ? `فُتح «${l.title}» للتلاميذ` : `جُدول «${l.title}»`)
}
function toggleWeek(s, l) {
  const weekLesson = { ...(plan.value.weekLesson || {}) }
  if (weekLesson[s.id] === l.id) delete weekLesson[s.id]
  else weekLesson[s.id] = l.id
  persist({ weekLesson }, weekLesson[s.id] ? `«${l.title}» درس الأسبوع في ${s.name}` : 'أُلغي درس الأسبوع')
}
const badgeSel = ref(null)
const badgeNote = ref('')
const owned = ref([])
async function openStudent(row) {
  sel.value = row
  badgeSel.value = null
  badgeNote.value = ''
  owned.value = await studentBadges(row.id)
  sDlg.value = true
}
async function give() {
  await giveBadge(auth.person, sel.value.id, badgeSel.value, badgeNote.value)
  toast.add({ severity: 'success', summary: `مُنحت شارة «${MANUAL_BADGES.find((b) => b.id === badgeSel.value).title}» لـ ${sel.value.name}`, life: 2500 })
  owned.value = [...owned.value, badgeSel.value]
  badgeSel.value = null
}
</script>

<style scoped>
.gb { margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed var(--line); }
.gb__list { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }
.gb__b { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 0.3rem 0.75rem; cursor: pointer; font: inherit; font-size: 0.84rem; color: inherit; display: inline-flex; gap: 0.35rem; align-items: center; }
.gb__b.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 10%, transparent); }
.gb__b.has { opacity: 0.6; cursor: default; }
.gb__go { display: flex; gap: 0.5rem; }
.cls { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem; }
.cl { display: flex; flex-direction: column; align-items: flex-start; padding: 0.6rem 1rem; border-radius: 12px; border: 1.5px solid var(--line); background: var(--surface); font: inherit; color: inherit; cursor: pointer; }
.cl.on { border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent); }
.cl small { color: var(--p-text-muted-color); font-size: 0.78rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
:deep(.row-risk td:first-child) { box-shadow: inset -3px 0 0 #e5484d; }
.plan__mode { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.plan__mode h3 { margin: 0 0 0.25rem; font-size: 1rem; }
.plan__mode p { margin: 0; font-size: 0.86rem; max-width: 560px; }
.seg { display: flex; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.seg button { border: 0; background: var(--surface); padding: 0.55rem 0.9rem; font: inherit; cursor: pointer; display: flex; gap: 0.4rem; align-items: center; color: var(--ink); }
.seg button.on { background: var(--brand); color: #fff; }
.hint { font-size: 0.85rem; margin: 0 0 0.75rem; }
.subj { margin-bottom: 0.75rem; }
.subj summary { cursor: pointer; display: flex; align-items: center; gap: 0.6rem; list-style: none; }
.subj summary small { margin-inline-start: auto; }
.ic { width: 30px; height: 30px; border-radius: 9px; color: #fff; display: grid; place-items: center; }
.lt { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.88rem; }
.lt th { text-align: start; font-size: 0.78rem; color: var(--p-text-muted-color); padding: 0.4rem; border-bottom: 1px solid var(--line); }
.lt td { padding: 0.35rem 0.4rem; border-bottom: 1px solid var(--line); }
.lt tr.closed td { opacity: 0.55; }
.lt tr.week { background: #fff8e1; }
.star { border: 0; background: none; cursor: pointer; font-size: 1.05rem; color: #b8c0cc; }
.star.on { color: #f5a400; }
.star:disabled { opacity: 0.3; cursor: not-allowed; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.stats h3 { font-size: 1rem; margin: 0 0 0.85rem; }
@media (max-width: 900px) { .stats { grid-template-columns: 1fr; } }
</style>
