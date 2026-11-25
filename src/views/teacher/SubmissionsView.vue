<template>
  <!-- TE09/TE10: التسليمات والتصحيح — العلامة والملاحظة تصلان للتلميذ ووليه فوراً -->
  <div>
    <PageHeader title="التسليمات والتصحيح" subtitle="الواجبات تنتظر تصحيحك؛ الاختبارات تُصحَّح آلياً ويمكنك مراجعتها." />
    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'submitted' }" @click="tab = 'submitted'">بانتظار التصحيح <span class="pill__count">{{ rows.filter((r) => r.status === 'submitted').length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'graded' }" @click="tab = 'graded'">مصحَّحة <span class="pill__count">{{ rows.filter((r) => r.status === 'graded').length }}</span></button>
    </div>
    <RecordTable :rows="shown" :loading="loading" :columns="[
      { field: 'student', label: 'التلميذ', type: 'person', sub: 'className' }, { field: 'title', label: 'العمل' }, { field: 'subjectName', label: 'المادة' },
      { field: 'at', label: 'سُلّم في', type: 'date' }, { field: 'scoreLabel', label: 'العلامة' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['student', 'title']" :filters="[{ key: 'className', label: 'القسم', options: classOpts }, { key: 'type', label: 'النوع', options: [{ label: 'واجب', value: 'homework' }, { label: 'اختبار', value: 'quiz' }] }]" unit="تسليم" empty-text="لا تسليمات هنا">
      <template #cell-title="{ row }">{{ row.title }} <span v-if="row.late" class="late">متأخر</span></template>
      <template #actions="{ row }"><Button :label="row.status === 'submitted' ? 'صحّح' : 'عرض'" size="small" :outlined="row.status !== 'submitted'" @click="open(row)" /></template>
    </RecordTable>

    <Dialog v-model:visible="dlg" modal :header="cur ? `${cur.student} — ${cur.title}` : ''" :style="{ width: 'min(620px, 95vw)' }">
      <div v-if="cur" class="gd">
        <p class="muted">{{ cur.className }} · {{ cur.subjectName }} · سُلّم {{ new Date(cur.at).toLocaleString('ar-DZ') }}</p>
        <div v-if="cur.text" class="ans"><small>إجابة التلميذ</small><p>{{ cur.text }}</p></div>
        <div v-if="cur.files?.length" class="files"><span v-for="f in cur.files" :key="f" class="chip"><i class="pi pi-image" /> {{ f }}</span></div>
        <p v-if="cur.type === 'quiz'" class="muted"><i class="pi pi-bolt" /> اختبار مصحَّح آلياً — يمكنك تعديل العلامة إن لزم.</p>
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
        <Button label="حفظ التصحيح" icon="pi pi-check" :loading="busy" :disabled="score === null" @click="save" />
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
  dlg.value = true
}
async function save() {
  busy.value = true
  try {
    await grade(cur.value.id, score.value, note.value)
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
.q { border: 1px solid var(--line); background: var(--surface); border-radius: 8px; padding: 0.35rem 0.7rem; cursor: pointer; font: inherit; }
</style>
