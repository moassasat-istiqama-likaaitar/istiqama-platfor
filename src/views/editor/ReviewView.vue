<template>
  <!-- ED03/ED04: مراجعة المحتوى — المحرر يقرر مباشرة (لا ينتظر المدير): اعتماد بتصنيف، طلب تعديل بملاحظة، رفض بملاحظة -->
  <div>
    <PageHeader title="مراجعة المحتوى" :subtitle="`ما يرسله المعلمون للمكتبة المركزية في نطاقك: ${scopeText}. لا تنتظر مصادقة المدير — هي خطوة وقائية فقط.`" />
    <StatTiles :items="[
      { label: 'بانتظار القرار', value: rows.length, icon: 'pi pi-inbox', tone: rows.length ? 'amber' : 'green' },
      { label: 'مقترحات المعلمين', value: rows.filter((r) => r.kind === 'upload').length, icon: 'pi pi-user', tone: 'purple' },
      { label: 'أنشطة', value: rows.filter((r) => r.kind === 'activity').length, icon: 'pi pi-question-circle', tone: 'blue' },
      { label: 'قرارات أخيرة', value: log.length, icon: 'pi pi-history', tone: 'green' }
    ]" />
    <div class="kinds">
      <button v-for="k in KINDS" :key="k.key" type="button" class="pill" :class="{ 'is-active': kind === k.key }" @click="kind = k.key"><i :class="k.icon" /> {{ k.label }} <span class="pill__count">{{ rows.filter(k.fn).length }}</span></button>
      <small v-if="outside" class="muted out"><i class="pi pi-info-circle" /> {{ outside }} عنصراً آخر ينتظر خارج نطاقك (عند محررين آخرين)</small>
    </div>
    <RecordTable :rows="rows.filter(KINDS.find((k) => k.key === kind).fn)" :loading="loading" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'origin', label: 'المصدر' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' },
      { field: 'levelName', label: 'المستوى' }, { field: 'authorName', label: 'المؤلف' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'authorName', 'lessonTitle']" :filters="[
      { key: 'origin', label: 'المصدر', options: [{ label: 'المكتبة', value: 'المكتبة' }, { label: 'مقترح معلم', value: 'مقترح معلم' }, { label: 'صادق عليه المدير', value: 'صادق عليه المدير' }, { label: 'نشاط معلم', value: 'نشاط معلم' }] },
      { key: 'levelName', label: 'المستوى', options: levelOpts }
    ]" unit="عنصر" empty-text="لا شيء ينتظر المراجعة 🎉">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.lessonTitle" class="muted d">{{ row.lessonTitle }}</small></template>
      <template #actions="{ row }"><Button label="مراجعة" size="small" @click="open(row)" /></template>
    </RecordTable>

    <Dialog v-model:visible="dlg" modal :header="cur?.title" :style="{ width: 'min(900px, 96vw)' }">
      <div v-if="cur" class="rv">
        <div class="rv__view">
          <ContentViewer v-if="cur.kind !== 'activity' && cur.payload && ['video', 'slides', 'pdf', 'image'].includes(cur.type)" :item="cur" :color="subj?.color" :accent="subj?.accent" :art="subj?.art" />
          <ol v-else-if="cur.questions?.length" class="qs"><li v-for="(q, i) in cur.questions" :key="i"><b>{{ q.q }}</b> <small class="muted">{{ QTYPES[qtype(q)].label }} · {{ qpoints(q) }} ن</small><div class="right">✓ {{ correctText(q) }}</div></li></ol>
          <p v-else-if="cur.instructions" class="ins">{{ cur.instructions }}</p>
          <div v-else class="file"><i class="pi pi-file" /><p>{{ cur.title }}</p><small class="muted">ملف مرفوع من المعلم — يُعرض هنا بعد الربط بالخلفية</small></div>
        </div>
        <aside class="rv__side">
          <dl>
            <div><dt>المصدر</dt><dd>{{ cur.origin }}</dd></div>
            <div><dt>المؤلف</dt><dd>{{ cur.authorName }}</dd></div>
            <div><dt>المادة / المستوى</dt><dd>{{ cur.subjectName }} — {{ cur.levelName || '—' }}</dd></div>
            <div v-if="cur.lessonTitle"><dt>الدرس</dt><dd>{{ cur.lessonTitle }}</dd></div>
          </dl>
          <h4>معايير المراجعة</h4>
          <label v-for="c in CHECKS" :key="c" class="chk"><Checkbox v-model="checks" :value="c" /> {{ c }}</label>
          <h4 class="mt">عند الاعتماد</h4>
          <label class="f"><span>التصنيف <small class="muted" v-if="cur.proposedClass">(اقترح المعلم: {{ classLabel(cur.proposedClass) }})</small></span><Select v-model="classification" :options="CLASSIFICATIONS" option-label="label" option-value="value" fluid :disabled="cur.kind === 'activity'" /></label>
          <label v-if="cur.kind !== 'activity'" class="chk sw"><ToggleSwitch v-model="essential" /> <span><b>أساسي للمستوى</b> — يُربط إجبارياً بكل أقسام {{ cur.levelName }} في درسه</span></label>
          <label class="f"><span>ملاحظة لصاحب المحتوى <small class="muted">(إجبارية للرفض وطلب التعديل)</small></span><Textarea v-model="note" rows="3" auto-resize fluid /></label>
        </aside>
      </div>
      <template #footer>
        <Button label="رفض" icon="pi pi-times" severity="danger" outlined :loading="busy === 'rejected'" @click="act('rejected')" />
        <Button label="طلب تعديل" icon="pi pi-pencil" severity="secondary" outlined :loading="busy === 'edit'" @click="act('edit')" />
        <Button label="اعتماد" icon="pi pi-check" severity="success" :loading="busy === 'approved'" @click="act('approved')" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useAuthStore } from '@/stores/auth'
import { CLASSIFICATIONS, classLabel } from '@/composables/useStatusLabels'
import { QTYPES, qtype, qpoints, correctText } from '@/utils/quiz'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import { useCatalog } from '@/composables/useCatalog'
import { outOfScopeCount, reviewQueue, decide, recentDecisions } from '@/api/editorial'

const toast = useToast()
const cat = useCatalog()
const CHECKS = ['المحتوى مطابق للمنهاج والدرس', 'خالٍ من الأخطاء العلمية واللغوية', 'مناسب للمستوى العمري', 'جودة الصوت والصورة مقبولة', 'يحترم الضوابط الشرعية والتربوية']
const rows = ref([])
const KINDS = [
  { key: 'all', label: 'الكل', icon: 'pi pi-inbox', fn: () => true },
  { key: 'content', label: 'المحتوى', icon: 'pi pi-book', fn: (r) => r.kind !== 'activity' },
  { key: 'activity', label: 'الواجبات والاختبارات', icon: 'pi pi-question-circle', fn: (r) => r.kind === 'activity' }
]
const kind = ref(route.name === 'activities-review' ? 'activity' : 'all')
watch(() => route.name, (n) => (kind.value = n === 'activities-review' ? 'activity' : 'all'))
const outside = ref(0)
const log = ref([])
const loading = ref(true)
const dlg = ref(false)
const cur = ref(null)
const note = ref('')
const checks = ref([])
const busy = ref(null)
const classification = ref('main')
const essential = ref(false)
const auth = useAuthStore()
const scope = computed(() => ({ levels: auth.active.levelIds || [], subjects: auth.active.subjects || [] }))
const scopeText = computed(() => [(auth.active.levels || []).map((l) => l.name).join('، ') || 'كل المستويات', scope.value.subjects.length ? scope.value.subjects.join('، ') : 'كل المواد'].join(' · '))
const subj = computed(() => cat.subjects.find((s) => s.name === cur.value?.subjectName))
const levelOpts = computed(() => [...new Set(rows.value.map((r) => r.levelName).filter(Boolean))].map((v) => ({ label: v, value: v })))
async function load() {
  loading.value = true
  rows.value = (await reviewQueue(scope.value)).map((r) => ({ ...r, typeLabel: cat.TYPE_LABEL[r.type] || (r.type === 'quiz' ? 'اختبار' : r.type) }))
  log.value = await recentDecisions()
  outside.value = await outOfScopeCount(scope.value)
  loading.value = false
}
onMounted(load)
function open(r) {
  cur.value = r
  note.value = ''
  checks.value = []
  classification.value = r.kind === 'activity' ? 'activity' : r.proposedClass || 'main'
  essential.value = false
  dlg.value = true
}
async function act(decision) {
  busy.value = decision
  try {
    await decide(cur.value, decision, { note: note.value, classification: classification.value, essential: essential.value })
    toast.add({ severity: 'success', summary: { approved: essential.value ? 'اعتُمد ورُبط بكل أقسام المستوى' : 'اعتُمد في المكتبة المركزية', edit: 'أُعيد لصاحبه مسودةً مع ملاحظتك', rejected: 'رُفض المحتوى' }[decision], life: 2200 })
    dlg.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = null
  }
}
</script>

<style scoped>
.kinds { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin: 1rem 0; }
.out { margin-inline-start: auto; }
.d { display: block; font-size: 0.78rem; }
.rv { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1rem; }
.rv__view { min-width: 0; }
.qs { margin: 0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.qs b { display: block; margin-bottom: 0.3rem; }
.qs span { display: inline-block; margin: 0.15rem; padding: 0.2rem 0.6rem; border: 1px solid var(--line); border-radius: 8px; font-size: 0.85rem; }
.qs .right { color: #17733f; font-size: 0.86rem; margin-top: 0.2rem; }
.ins { white-space: pre-wrap; }
.mt { margin-top: 1rem !important; }
.chk.sw span { font-size: 0.84rem; }
.file { text-align: center; padding: 2.5rem 1rem; border: 2px dashed var(--line); border-radius: 14px; }
.file i { font-size: 2.5rem; color: var(--brand); }
.rv__side dl { margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.rv__side dt { font-size: 0.78rem; color: var(--p-text-muted-color); }
.rv__side dd { margin: 0; font-weight: 700; }
.rv__side h4 { margin: 0 0 0.4rem; font-size: 0.9rem; }
.chk { display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; margin-bottom: 0.35rem; }
.f { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.75rem; }
.f > span { font-weight: 700; font-size: 0.86rem; }
@media (max-width: 820px) { .rv { grid-template-columns: 1fr; } }
</style>
