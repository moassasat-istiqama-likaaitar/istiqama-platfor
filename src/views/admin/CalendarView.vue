<template>
  <!-- AD15: الرزنامة — العطل والاختبارات والاجتماعات -->
  <div>
    <PageHeader title="الرزنامة" subtitle="مواعيد الموسم المشتركة بين المدارس (أو لمدرسة واحدة): العطل، الاختبارات، الاجتماعات، التكوين." />
    <div class="cal">
      <section class="panel">
        <header class="mh">
          <Button icon="pi pi-chevron-right" text rounded @click="shift(-1)" />
          <h3>{{ monthLabel }}</h3>
          <Button icon="pi pi-chevron-left" text rounded @click="shift(1)" />
        </header>
        <div class="grid">
          <span v-for="d in DAYS" :key="d" class="dn">{{ d }}</span>
          <div v-for="(c, i) in cells" :key="i" class="cell" :class="{ out: !c.in, today: c.today }">
            <span class="num">{{ c.date.getDate() }}</span>
            <span v-for="e in c.events" :key="e.id" class="ev" :style="{ '--c': TYPES[e.type].color }" :title="e.title">{{ e.title }}</span>
          </div>
        </div>
        <div class="legend"><span v-for="(tp, k) in TYPES" :key="k"><i :style="{ background: tp.color }" /> {{ tp.label }}</span></div>
      </section>
      <section>
        <div class="lh"><h3>المواعيد القادمة</h3><Button label="موعد جديد" icon="pi pi-plus" size="small" @click="open()" /></div>
        <div v-for="e in upcoming" :key="e.id" class="panel item" :style="{ '--c': TYPES[e.type].color }">
          <div><b>{{ e.title }}</b><small class="muted">{{ fmt(e.start) }}{{ e.end !== e.start ? ' ← ' + fmt(e.end) : '' }} · {{ TYPES[e.type].label }} · {{ e.scope === 'all' ? 'كل المدارس' : cat.schools.find((s) => s.id === e.scope)?.short }}</small></div>
          <span class="tools"><Button icon="pi pi-pencil" text rounded size="small" @click="open(e)" /><Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="del(e)" /></span>
        </div>
      </section>
    </div>
    <FormDialog v-model:visible="dlg" :title="cur ? 'تعديل الموعد' : 'موعد جديد'" :fields="fields" :value="cur || { type: 'event', scope: 'all' }" @save="save" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { useCatalog } from '@/composables/useCatalog'
import { listEvents, saveEvent, removeEvent } from '@/api/admin'

const cat = useCatalog()
const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const TYPES = { holiday: { label: 'عطلة', color: '#17a077' }, exam: { label: 'اختبارات', color: '#e5484d' }, meeting: { label: 'اجتماع', color: '#3159e8' }, training: { label: 'تكوين', color: '#8457d6' }, event: { label: 'نشاط', color: '#ef7d32' } }
const events = ref([])
const month = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const dlg = ref(false)
const cur = ref(null)
const fields = [
  { key: 'title', label: 'العنوان', required: true, full: true },
  { key: 'type', label: 'النوع', type: 'select', options: Object.entries(TYPES).map(([value, x]) => ({ value, label: x.label })) },
  { key: 'scope', label: 'النطاق', type: 'select', options: [{ label: 'كل المدارس', value: 'all' }, ...cat.schoolOptions] },
  { key: 'start', label: 'من', type: 'date', required: true }, { key: 'end', label: 'إلى', type: 'date', required: true }
]
const load = async () => (events.value = await listEvents())
onMounted(load)
const key = (d) => d.toISOString().slice(0, 10)
const monthLabel = computed(() => month.value.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' }))
const cells = computed(() => {
  const first = new Date(month.value)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const today = key(new Date())
  return [...Array(42)].map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const k = key(new Date(d.getTime() - d.getTimezoneOffset() * 60000))
    return { date: d, in: d.getMonth() === first.getMonth(), today: k === today, events: events.value.filter((e) => e.start <= k && e.end >= k) }
  })
})
const upcoming = computed(() => events.value.filter((e) => e.end >= key(new Date())))
const shift = (n) => (month.value = new Date(month.value.getFullYear(), month.value.getMonth() + n, 1))
const fmt = (d) => new Date(d).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' })
function open(e = null) {
  cur.value = e ? { ...e } : null
  dlg.value = true
}
async function save(v) {
  await saveEvent({ ...(cur.value || {}), ...v })
  dlg.value = false
  load()
}
async function del(e) {
  await removeEvent(e.id)
  load()
}
</script>

<style scoped>
.cal { display: grid; grid-template-columns: 1.7fr 1fr; gap: 1rem; align-items: start; }
.mh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.mh h3 { margin: 0; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.dn { text-align: center; font-size: 0.75rem; color: var(--p-text-muted-color); padding: 0.3rem 0; }
.cell { min-height: 78px; background: var(--bg); border-radius: 6px; padding: 0.25rem; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.cell.out { opacity: 0.4; }
.cell.today { outline: 2px solid var(--brand); }
.num { font-size: 0.78rem; font-weight: 700; }
.ev { font-size: 0.66rem; background: color-mix(in srgb, var(--c) 16%, #fff); color: color-mix(in srgb, var(--c) 80%, #000); border-inline-start: 3px solid var(--c); border-radius: 3px; padding: 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.legend { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-top: 0.75rem; font-size: 0.8rem; }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-inline-end: 0.25rem; }
.lh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.lh h3 { margin: 0; font-size: 1rem; }
.item { display: flex; justify-content: space-between; gap: 0.5rem; border-inline-start: 4px solid var(--c); margin-bottom: 0.5rem; padding: 0.7rem 0.9rem; }
.item b { display: block; }
.item small { font-size: 0.78rem; }
.tools { display: flex; }
@media (max-width: 960px) { .cal { grid-template-columns: 1fr; } }
</style>
