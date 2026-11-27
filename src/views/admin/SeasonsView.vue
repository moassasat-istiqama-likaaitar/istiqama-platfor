<template>
  <!-- AD09: المواسم الدراسية — قيد الإعداد ← نشط ← إقفال ← مؤرشف (للقراءة فقط)، مع معالج «إطلاق الموسم» وإعادة فتح مؤقت للتصحيح -->
  <div>
    <PageHeader title="المواسم الدراسية" subtitle="موسم واحد نشط في كل لحظة. يُعَدّ الموسم الجديد والقديم ما زال نشطاً، ثم يُطلق فيُؤرشف القديم للقراءة فقط." />

    <ol class="life">
      <li v-for="(st, i) in LIFE" :key="st.key"><b>{{ i + 1 }}</b><span>{{ st.label }}</span><small>{{ st.hint }}</small></li>
    </ol>

    <div class="ss">
      <article v-for="s in rows" :key="s.id" class="panel se" :class="s.status">
        <header>
          <h3>{{ s.name }}</h3>
          <StatusTag :status="s.reopened ? 'reopened' : s.status === 'draft' ? 'preparing' : s.status" />
        </header>
        <p class="muted">{{ fmt(s.start) }} ← {{ fmt(s.end) }}</p>
        <ol v-if="s.semesters?.length" class="terms"><li v-for="tm in s.semesters" :key="tm.n"><b>{{ tm.name }}</b><small class="muted">{{ fmt(tm.start) }} – {{ fmt(tm.end) }}</small></li></ol>

        <div v-if="s.status === 'archived' && s.snapshot" class="snap">
          <span><b>{{ s.snapshot.classes }}</b> قسم</span><span><b>{{ s.snapshot.students }}</b> تلميذ</span><span><b>{{ s.snapshot.reportCards }}</b> كشف</span><span><b>{{ s.snapshot.messages }}</b> رسالة</span>
        </div>
        <p v-if="s.status === 'archived'" class="muted small"><i class="pi pi-box" /> أُرشف {{ fmt(s.archivedAt) }} — للقراءة فقط.</p>
        <p v-if="s.reopened" class="warn small"><i class="pi pi-unlock" /> مفتوح للتصحيح حتى {{ fmtTime(s.reopen.until) }} — السبب: {{ s.reopen.reason }} ({{ s.reopen.by }})</p>
        <p v-if="s.status === 'closing'" class="small muted"><i class="pi pi-lock" /> قيد الإقفال: أقفل العلامات واطبع الكشوف واعتمد الترقية، ثم أطلق الموسم الجديد من بطاقته.</p>
        <p v-if="s.launch" class="small muted"><i class="pi pi-check-circle" /> أُطلق: {{ s.launch.promoted }} مُرقّى · {{ s.launch.repeat }} معيد · {{ s.launch.leave }} منسحب</p>

        <footer>
          <Button v-if="s.status !== 'archived' || s.reopened" label="تعديل" icon="pi pi-pencil" text size="small" @click="edit(s)" />
          <Button v-if="s.status === 'draft'" label="إطلاق الموسم" icon="pi pi-send" size="small" @click="openWizard(s)" />
          <Button v-if="s.status === 'active'" label="بدء الإقفال" icon="pi pi-lock" text size="small" severity="warn" @click="closing(s, true)" />
          <Button v-if="s.status === 'closing'" label="إلغاء الإقفال" icon="pi pi-undo" text size="small" @click="closing(s, false)" />
          <Button v-if="s.status === 'archived' && !s.reopened" label="إعادة فتح مؤقت للتصحيح" icon="pi pi-unlock" text size="small" severity="secondary" @click="openReopen(s)" />
          <Button v-if="s.reopened" label="إنهاء الفتح المؤقت" icon="pi pi-lock" text size="small" @click="endRe(s)" />
        </footer>
      </article>
      <button v-if="!rows.some((x) => x.status === 'draft')" type="button" class="panel add" @click="edit(null)"><i class="pi pi-plus" /> إعداد موسم جديد</button>
    </div>

    <!-- ما يُؤرشف وما يبقى -->
    <section class="panel scope">
      <div><h3><i class="pi pi-box" /> يُؤرشف مع الموسم (للقراءة فقط)</h3><ul><li v-for="x in ARCHIVE_SCOPE.archived" :key="x">{{ x }}</li></ul></div>
      <div><h3><i class="pi pi-sync" /> يبقى مستمراً خارج الموسم</h3><ul><li v-for="x in ARCHIVE_SCOPE.kept" :key="x">{{ x }}</li></ul></div>
      <p class="muted small full">بعد الأرشفة يرى الولي والتلميذ كشوف المواسم السابقة في «سجلّي». ما يُخفى ليراه الإشراف العام فقط يُضبط لاحقاً.</p>
    </section>

    <FormDialog v-model:visible="dlg" wide :title="cur ? 'تعديل الموسم' : 'إعداد موسم جديد'" :fields="SEASON_FIELDS" :value="formValue" @save="save" />

    <!-- معالج إطلاق الموسم -->
    <Dialog v-model:visible="wiz.open" modal :header="`إطلاق الموسم ${wiz.season?.name || ''}`" :style="{ width: 'min(860px, 96vw)' }">
      <ol class="steps"><li v-for="(st, i) in STEPS" :key="st" :class="{ on: wiz.step === i, done: wiz.step > i }"><b>{{ i + 1 }}</b> {{ st }}</li></ol>

      <div v-if="wiz.step === 0" class="wz">
        <p class="muted">راجع تواريخ السداسيين (تضبطها الإدارة العامة).</p>
        <div v-for="tm in wiz.semesters" :key="tm.n" class="trow"><b>{{ tm.name }}</b><input v-model="tm.start" type="date" /><span>←</span><input v-model="tm.end" type="date" /></div>
      </div>

      <div v-else-if="wiz.step === 1" class="wz">
        <p class="muted">الناجح ينتقل إلى المستوى التالي، وتلاميذ آخر مستوى يتخرّجون. سجّل عدد المعيدين والمنسحبين لكل مستوى (تفصيل كل تلميذ يأتي من كشوف الإقفال).</p>
        <table class="pt">
          <thead><tr><th>المستوى</th><th>التلاميذ</th><th>ينتقل إلى</th><th>معيد</th><th>منسحب</th><th>يُرقّى</th></tr></thead>
          <tbody>
            <tr v-for="p in wiz.promotion" :key="p.levelId">
              <td>{{ p.levelName }}</td><td>{{ p.students }}</td><td>{{ p.next }}</td>
              <td><InputNumber v-model="p.repeat" :min="0" :max="p.students" input-class="ni" /></td>
              <td><InputNumber v-model="p.leave" :min="0" :max="p.students" input-class="ni" /></td>
              <td><b>{{ Math.max(0, p.students - p.repeat - p.leave) }}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="wiz.step === 2" class="wz">
        <label class="chk"><Checkbox v-model="wiz.copyClasses" binary /> توليد أقسام الموسم الجديد من أقسام الموسم الحالي (بالأسماء نفسها)</label>
        <label class="chk"><Checkbox v-model="wiz.proposeAssignments" binary /> اقتراح إسنادات المعلمين من الموسم السابق ليؤكدها مدراء المدارس</label>
        <p class="muted small"><i class="pi pi-lock" /> كل الدروس تبدأ مغلقة حتى يفتحها المحرر.</p>
      </div>

      <div v-else class="wz">
        <Message severity="warn">عند الإطلاق: يُؤرشف الموسم {{ current?.name }} للقراءة فقط، ويصبح {{ wiz.season?.name }} الموسم النشط.</Message>
        <div class="sum">
          <span><b>{{ totals.promoted }}</b> يُرقّى</span><span><b>{{ totals.repeat }}</b> معيد</span><span><b>{{ totals.leave }}</b> منسحب</span>
        </div>
        <p class="small"><b>يُؤرشف:</b> {{ ARCHIVE_SCOPE.archived.join('، ') }}.</p>
        <p class="small"><b>يبقى:</b> {{ ARCHIVE_SCOPE.kept.join('، ') }}.</p>
      </div>

      <template #footer>
        <Button v-if="wiz.step > 0" label="السابق" text severity="secondary" @click="wiz.step--" />
        <Button v-if="wiz.step < STEPS.length - 1" label="التالي" icon="pi pi-arrow-left" icon-pos="right" @click="wiz.step++" />
        <Button v-else label="إطلاق الموسم" icon="pi pi-send" :loading="busy" @click="launch" />
      </template>
    </Dialog>

    <!-- إعادة الفتح المؤقت -->
    <Dialog v-model:visible="re.open" modal header="إعادة فتح مؤقت للتصحيح" :style="{ width: 'min(520px, 95vw)' }">
      <p class="muted small">يُفتح الموسم {{ re.season?.name }} للتعديل مدةً محددة (لتصحيح علامة مثلاً)، ثم يعود مؤرشفاً تلقائياً. يُسجَّل ذلك في سجل النشاط.</p>
      <label class="fl"><span>السبب *</span><Textarea v-model="re.reason" rows="2" auto-resize fluid placeholder="مثال: تصحيح علامة تلميذ في كشف السداسي الثاني" /></label>
      <label class="fl"><span>المدة</span><Select v-model="re.hours" :options="[{ label: '24 ساعة', value: 24 }, { label: '48 ساعة', value: 48 }, { label: '7 أيام', value: 168 }]" option-label="label" option-value="value" fluid /></label>
      <template #footer><Button label="إلغاء" text severity="secondary" @click="re.open = false" /><Button label="فتح للتصحيح" icon="pi pi-unlock" :disabled="!re.reason.trim()" @click="reopen" /></template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { fullName } from '@/api/people'
import { listSeasons, createSeason, updateSeason, setClosing, promotionPreview, launchSeason, reopenSeason, endReopen, ARCHIVE_SCOPE, SEMESTER_NAMES } from '@/api/admin'

const auth = useAuthStore()
const toast = useToast()
const LIFE = [
  { key: 'draft', label: 'قيد الإعداد', hint: 'التواريخ، السداسيان، الأقسام، الإسنادات' },
  { key: 'active', label: 'نشط', hint: 'موسم واحد فقط في كل لحظة' },
  { key: 'closing', label: 'إقفال', hint: 'إقفال العلامات، الكشوف، اعتماد الترقية' },
  { key: 'archived', label: 'مؤرشف', hint: 'للقراءة فقط' }
]
const STEPS = ['التواريخ والسداسيان', 'ترقية التلاميذ', 'الأقسام والإسنادات', 'التأكيد']
const rows = ref([])
const dlg = ref(false)
const cur = ref(null)
const busy = ref(false)
const fmt = (d) => (d ? new Date(d).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')
const fmtTime = (d) => new Date(d).toLocaleString('ar-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const load = async () => (rows.value = await listSeasons())
onMounted(load)
const current = computed(() => rows.value.find((s) => ['active', 'closing'].includes(s.status)))
const err = (e) => toast.add({ severity: 'warn', summary: e.message, life: 2800 })

/* الموسم وتواريخ السداسيين — تضبطها الإدارة العامة (المدير العام والمشرف العام) */
const SEASON_FIELDS = [
  { key: 'name', label: 'الاسم', required: true, placeholder: '2027 / 2028' }, { key: 'start', label: 'بداية الموسم', type: 'date', required: true }, { key: 'end', label: 'نهاية الموسم', type: 'date', required: true },
  { key: 's1start', label: 'بداية السداسي الأول', type: 'date', hint: 'يُقترح تلقائياً إن تُرك فارغاً' }, { key: 's1end', label: 'نهاية السداسي الأول', type: 'date' },
  { key: 's2start', label: 'بداية السداسي الثاني', type: 'date' }, { key: 's2end', label: 'نهاية السداسي الثاني', type: 'date' }
]
const formValue = computed(() => {
  const s = cur.value
  if (!s) return {}
  const [a, b] = s.semesters || []
  return { ...s, s1start: a?.start, s1end: a?.end, s2start: b?.start, s2end: b?.end }
})
function edit(s) {
  cur.value = s ? { ...s } : null
  dlg.value = true
}
async function save(v) {
  const { s1start, s1end, s2start, s2end, ...data } = v
  if (s1start || s1end || s2start || s2end) data.semesters = [{ n: 1, name: SEMESTER_NAMES[0], start: s1start, end: s1end }, { n: 2, name: SEMESTER_NAMES[1], start: s2start, end: s2end }]
  try {
    if (cur.value) await updateSeason(cur.value.id, data, auth.role)
    else await createSeason(data, auth.role)
    toast.add({ severity: 'success', summary: cur.value ? 'حُفظ الموسم' : 'أُنشئ الموسم «قيد الإعداد»', life: 2200 })
    dlg.value = false
    load()
  } catch (e) {
    err(e)
  }
}
async function closing(s, on) {
  try {
    await setClosing(s.id, on)
    toast.add({ severity: 'info', summary: on ? 'بدأ إقفال الموسم' : 'عاد الموسم نشطاً', life: 2200 })
    load()
  } catch (e) {
    err(e)
  }
}

const wiz = reactive({ open: false, step: 0, season: null, semesters: [], promotion: [], copyClasses: true, proposeAssignments: true })
async function openWizard(s) {
  Object.assign(wiz, { open: true, step: 0, season: s, semesters: JSON.parse(JSON.stringify(s.semesters || [])), promotion: await promotionPreview(), copyClasses: true, proposeAssignments: true })
}
const totals = computed(() => ({
  promoted: wiz.promotion.reduce((t, p) => t + Math.max(0, p.students - p.repeat - p.leave), 0),
  repeat: wiz.promotion.reduce((t, p) => t + (p.repeat || 0), 0),
  leave: wiz.promotion.reduce((t, p) => t + (p.leave || 0), 0)
}))
async function launch() {
  busy.value = true
  try {
    await updateSeason(wiz.season.id, { semesters: wiz.semesters }, auth.role)
    await launchSeason(wiz.season.id, { promotion: wiz.promotion, copyClasses: wiz.copyClasses, proposeAssignments: wiz.proposeAssignments }, auth.role)
    toast.add({ severity: 'success', summary: `أُطلق الموسم ${wiz.season.name}`, detail: current.value ? `وأُرشف ${current.value.name}` : '', life: 3500 })
    wiz.open = false
    load()
  } catch (e) {
    err(e)
  } finally {
    busy.value = false
  }
}

const re = reactive({ open: false, season: null, reason: '', hours: 48 })
const openReopen = (s) => Object.assign(re, { open: true, season: s, reason: '', hours: 48 })
async function reopen() {
  try {
    await reopenSeason(re.season.id, { reason: re.reason, hours: re.hours }, fullName(auth.person), auth.role)
    toast.add({ severity: 'success', summary: 'فُتح الموسم مؤقتاً للتصحيح', life: 2500 })
    re.open = false
    load()
  } catch (e) {
    err(e)
  }
}
async function endRe(s) {
  await endReopen(s.id)
  toast.add({ severity: 'info', summary: 'عاد الموسم مؤرشفاً', life: 2000 })
  load()
}
</script>

<style scoped>
.life { list-style: none; padding: 0; margin: 0 0 1rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.life li { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 0.6rem 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; }
.life b { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 0.75rem; }
.life span { font-weight: 700; font-size: 0.9rem; }
.life small { font-size: 0.76rem; color: var(--p-text-muted-color); }
.ss { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.se { display: flex; flex-direction: column; gap: 0.35rem; }
.se.active { border: 2px solid var(--brand); }
.se.draft { border: 2px dashed var(--brand); }
.se.closing { border: 2px solid #e0a100; }
.se.archived { opacity: 0.92; }
.se header { display: flex; justify-content: space-between; align-items: center; }
.se h3 { margin: 0; }
.terms { padding-inline-start: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; margin: 0.3rem 0; }
.terms small { display: block; font-size: 0.78rem; }
.snap { display: flex; gap: 0.8rem; flex-wrap: wrap; font-size: 0.82rem; background: var(--bg); border-radius: 10px; padding: 0.5rem 0.7rem; }
.small { font-size: 0.82rem; margin: 0; }
.warn { color: #8a5a00; }
.se footer { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: auto; padding-top: 0.4rem; }
.add { border: 2px dashed var(--line); background: none; font: inherit; cursor: pointer; color: var(--brand); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem; min-height: 150px; }
.scope { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.2rem; }
.scope h3 { font-size: 0.95rem; margin: 0 0 0.4rem; display: flex; gap: 0.4rem; align-items: center; }
.scope ul { margin: 0; padding-inline-start: 1.2rem; font-size: 0.88rem; line-height: 1.8; }
.full { grid-column: 1 / -1; }
.steps { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; gap: 0.4rem; flex-wrap: wrap; }
.steps li { padding: 0.35rem 0.7rem; border-radius: 999px; background: var(--bg); font-size: 0.84rem; color: var(--p-text-muted-color); }
.steps li.on { background: var(--brand); color: #fff; }
.steps li.done { color: #17733f; }
.wz { min-height: 220px; display: flex; flex-direction: column; gap: 0.6rem; }
.trow { display: flex; align-items: center; gap: 0.6rem; }
.trow b { width: 110px; }
.trow input { border: 1px solid var(--line); border-radius: 8px; padding: 0.35rem 0.5rem; font: inherit; }
.pt { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
.pt th { text-align: start; color: var(--p-text-muted-color); font-size: 0.78rem; padding: 0.35rem; border-bottom: 1px solid var(--line); }
.pt td { padding: 0.3rem 0.35rem; border-bottom: 1px solid var(--line); }
.pt :deep(.ni) { width: 4rem; }
.chk { display: flex; gap: 0.5rem; align-items: center; }
.sum { display: flex; gap: 1.2rem; font-size: 0.95rem; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.6rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
@media (max-width: 860px) { .life, .scope { grid-template-columns: minmax(0, 1fr); } }
</style>
