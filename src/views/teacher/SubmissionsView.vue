<template>
  <!-- TE09/TE10: التسليمات والتصحيح — العلامة والملاحظة تصلان للتلميذ ووليه فوراً -->
  <div>
    <PageHeader title="التسليمات والتصحيح" subtitle="الواجبات تنتظر تصحيحك؛ التقييمات تُصحَّح آلياً ويمكنك مراجعتها." />
    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'submitted' }" @click="tab = 'submitted'">بانتظار التصحيح <span class="pill__count">{{ rows.filter((r) => r.status === 'submitted').length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'graded' }" @click="tab = 'graded'">مصحَّحة <span class="pill__count">{{ rows.filter((r) => r.status === 'graded').length }}</span></button>
    </div>
    <RecordTable :rows="shown" :loading="loading" :columns="[
      { field: 'student', label: 'التلميذ', type: 'person', sub: 'className' }, { field: 'title', label: 'العمل' }, { field: 'subjectName', label: 'المادة' },
      { field: 'at', label: 'سُلّم في', type: 'date' }, { field: 'scoreLabel', label: 'العلامة' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['student', 'title']" :filters="[{ key: 'className', label: 'القسم', options: classOpts }, { key: 'type', label: 'النوع', options: [{ label: 'واجب', value: 'homework' }, { label: 'تقييم', value: 'quiz' }] }]" unit="تسليم" empty-text="لا تسليمات هنا">
      <template #cell-title="{ row }">{{ row.title }} <span v-if="row.late" class="late">متأخر</span></template>
      <template #actions="{ row }"><Button :label="row.status === 'submitted' ? 'صحّح' : 'عرض'" size="small" :outlined="row.status !== 'submitted'" @click="open(row)" /></template>
    </RecordTable>

    <Dialog v-model:visible="dlg" modal :header="cur ? `${cur.student} — ${cur.title}` : ''" :style="{ width: 'min(760px, 96vw)' }">
      <div v-if="cur" class="gd">
        <p class="muted">{{ cur.className }} · {{ cur.subjectName }} · سُلّم {{ new Date(cur.at).toLocaleString('ar-DZ') }}</p>
        <div v-if="cur.text" class="ans"><small>إجابة التلميذ</small><p>{{ cur.text }}</p></div>
        <div v-if="cur.files?.length" class="files"><span v-for="f in cur.files" :key="f" class="chip"><i class="pi pi-image" /> {{ f }}</span></div>
        <template v-if="cur.type === 'quiz' && cur.perQuestion">
          <p class="muted"><i class="pi pi-bolt" /> صُحّح آلياً {{ autoSum }} ن. {{ manualIdx.length ? `صحّح ${manualIdx.length} سؤالاً يدوياً:` : 'يمكنك تعديل العلامة النهائية إن لزم.' }}</p>
          <ol class="pq">
            <li v-for="(q, i) in cur.questions" :key="i" :class="{ man: cur.perQuestion[i]?.manual || cur.perQuestion[i]?.gradedByTeacher }">
              <div class="pq__h"><b>{{ q.q }}</b><small class="muted">{{ QTYPES[qtype(q)].label }}</small></div>
              <div class="pq__a">إجابته: <b>{{ answerText(q, cur.answers?.[i]) }}</b></div>
              <template v-if="manualIdx.includes(i)">
                <div class="pq__m muted">النموذج: {{ correctText(q) }}</div>
                <div class="pq__s"><InputNumber v-model="manual[i]" :min="0" :max="cur.perQuestion[i].max" :step="0.5" show-buttons button-layout="horizontal" input-class="sm" /> <small>/ {{ cur.perQuestion[i].max }}</small></div>
              </template>
              <div v-else class="pq__s auto" :class="{ ok: cur.perQuestion[i].correct }">{{ cur.perQuestion[i].score }} / {{ cur.perQuestion[i].max }}</div>
            </li>
          </ol>
        </template>
        <p v-else-if="cur.type === 'quiz'" class="muted"><i class="pi pi-bolt" /> تقييم مصحَّح آلياً — يمكنك تعديل العلامة إن لزم.</p>
        <label class="f"><span>العلامة (من {{ cur.maxScore }})</span>
          <div class="score">
            <InputNumber v-model="score" :min="0" :max="cur.maxScore" show-buttons button-layout="horizontal" :step="0.5" />
            <button v-for="q in quick" :key="q" type="button" class="q" @click="score = q">{{ q }}</button>
          </div>
        </label>
        <label class="f"><span>ملاحظة للتلميذ (يراها وليّه أيضاً)</span><Textarea v-model="note" rows="3" auto-resize fluid placeholder="مثال: عمل جيد، انتبه إلى ترتيب الأفكار." /></label>
        <div class="notes"><button v-for="n in NOTES" :key="n" type="button" class="chip" @click="note = n">{{ n }}</button></div>
      </div>
      <template #footer>
        <Button label="إلغاء" text severity="secondary" @click="dlg = false" />
        <Button label="حفظ التصحيح" icon="pi pi-check" :loading="busy" :disabled="score === null || manualIdx.some((i) => manual[i] === null || manual[i] === undefined)" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { submissions, grade } from '@/api/teaching'
import { QTYPES, qtype, answerText, correctText } from '@/utils/quiz'
import { watch } from 'vue'

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const NOTES = ['عمل ممتاز، بارك الله فيك.', 'عمل جيد، واصل.', 'راجع الدرس وأعد المحاولة.', 'انتبه إلى الخط وترتيب الأفكار.']
const tab = ref('submitted')
const rows = ref([])
const loading = ref(true)
const dlg = ref(false)
const cur = ref(null)
const score = ref(null)
const note = ref('')
const busy = ref(false)
const manual = ref({})
// الأسئلة التي تحتاج تصحيحاً يدوياً (مقالي، قصير بلا كلمات مفتاحية) أو صحّحها المعلم سابقاً
const manualIdx = computed(() => (cur.value?.perQuestion || []).map((r, i) => (r.manual || r.gradedByTeacher ? i : -1)).filter((i) => i >= 0))
const autoSum = computed(() => (cur.value?.perQuestion || []).reduce((n, r, i) => n + (manualIdx.value.includes(i) ? 0 : r.score), 0))
// المجموع = الآلي + اليدوي
watch(manual, (m) => {
  if (manualIdx.value.length) score.value = Math.round((autoSum.value + manualIdx.value.reduce((n, i) => n + (Number(m[i]) || 0), 0)) * 10) / 10
}, { deep: true })

async function load() {
  loading.value = true
  rows.value = (await submissions(auth.active.classIds || [])).map((r) => ({ ...r, scoreLabel: r.score !== null ? `${r.score}/${r.maxScore}` : '—' }))
  loading.value = false
}
onMounted(async () => {
  await load()
  if (route.query.open) {
    const r = rows.value.find((x) => x.id === route.query.open)
    if (r) open(r)
  }
})
const shown = computed(() => rows.value.filter((r) => r.status === tab.value))
const classOpts = computed(() => [...new Set(rows.value.map((r) => r.className))].map((c) => ({ label: c, value: c })))
const quick = computed(() => (cur.value ? [cur.value.maxScore, Math.round(cur.value.maxScore * 0.75), Math.round(cur.value.maxScore * 0.5)] : []))

function open(r) {
  cur.value = r
  score.value = r.score
  note.value = r.note || ''
  manual.value = Object.fromEntries((r.perQuestion || []).map((x, i) => [i, x.gradedByTeacher ? x.score : x.manual ? null : undefined]).filter(([, v]) => v !== undefined))
  dlg.value = true
}
async function save() {
  busy.value = true
  try {
    await grade(cur.value.id, score.value, note.value, manualIdx.value.length ? Object.fromEntries(manualIdx.value.map((i) => [i, Number(manual.value[i]) || 0])) : null)
    toast.add({ severity: 'success', summary: 'حُفظ التصحيح', detail: `${cur.value.student}: ${score.value}/${cur.value.maxScore}`, life: 2500 })
    dlg.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.late { font-size: 0.72rem; color: #b42318; background: #fdeeee; border-radius: 999px; padding: 0 0.45rem; margin-inline-start: 0.3rem; }
.gd { display: flex; flex-direction: column; gap: 0.85rem; }
.gd > p { margin: 0; }
.ans { background: var(--bg); border-radius: 10px; padding: 0.75rem; }
.ans small { color: var(--p-text-muted-color); }
.ans p { margin: 0.25rem 0 0; }
.files, .notes { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.notes .chip { cursor: pointer; border: 1px dashed var(--line); background: none; font: inherit; font-size: 0.8rem; }
.f { display: flex; flex-direction: column; gap: 0.3rem; }
.f > span { font-weight: 700; font-size: 0.88rem; }
.score { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.pq { margin: 0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; max-height: 45vh; overflow: auto; }
.pq li { padding: 0.5rem 0.6rem; border-radius: 10px; background: var(--bg); }
.pq li.man { background: #fff8e6; }
.pq__h { display: flex; justify-content: space-between; gap: 0.5rem; }
.pq__a, .pq__m { font-size: 0.86rem; margin-top: 0.2rem; }
.pq__s { margin-top: 0.3rem; display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
.pq__s.auto { color: #b42318; font-weight: 700; } .pq__s.auto.ok { color: #17733f; }
.pq :deep(.sm) { width: 3.5rem; text-align: center; }
.q { border: 1px solid var(--line); background: var(--surface); border-radius: 8px; padding: 0.35rem 0.7rem; cursor: pointer; font: inherit; }
</style>
