<template>
  <!-- TE15: منشئ التقييمات — ثمانية أنواع أسئلة، تجربة الاختبار وتنقيطه قبل النشر، إدراج في القسم أو المستوى، وإرسال للمكتبة المركزية -->
  <div>
    <PageHeader title="منشئ التقييمات" subtitle="ثمانية أنواع أسئلة تُصحَّح آلياً (المقالي والقصير بلا كلمات مفتاحية يصحّحهما المعلم). جرّب الاختبار بنفسك قبل نشره." />
    <div class="qb">
      <section class="panel meta">
        <label class="fl full"><span>عنوان الاختبار *</span><InputText v-model="q.title" fluid placeholder="مثال: اختبار قصير — أحكام الطهارة" /></label>
        <label class="fl"><span>{{ tg.isEditor.value ? 'أين يُنشر؟ (المستوى كقسم واحد أو قسم)' : 'الأقسام *' }}</span><MultiSelect v-model="q.targets" :options="targetOpts" option-label="label" option-value="value" display="chip" fluid placeholder="اختر" /></label>
        <label class="fl"><span>المادة *</span><Select v-model="q.subjectId" :options="cat.subjectOptions(levelId)" option-label="label" option-value="value" fluid :disabled="!levelId" /></label>
        <label class="fl"><span>الدرس</span><Select v-model="q.lessonId" placeholder="— بلا درس —" :options="[{ label: '— بلا درس —', value: null }, ...cat.linkLessonOptions(q.subjectId)]" option-label="label" option-value="value" option-disabled="disabled" filter fluid :disabled="!q.subjectId" /></label>
        <label class="fl"><span>المدة (دقائق)</span><InputNumber v-model="q.minutes" :min="0" :max="180" fluid placeholder="بلا حدّ" /></label>
        <label class="fl"><span>آخر أجل</span><InputText v-model="q.due" type="datetime-local" fluid /></label>
        <label class="fl sw full"><ToggleSwitch v-model="q.showAnswers" /> <span>إظهار الإجابات الصحيحة بعد التسليم</span></label>
        <p v-if="!tg.isEditor.value" class="muted small full"><i class="pi pi-info-circle" /> يُرسل تلقائياً للمكتبة المركزية للمراجعة، ولا يراه التلاميذ حتى يصادق عليه مدير المدرسة أو يعتمده المحرر.</p>
        <p v-else class="muted small">ما ينشره المحرر يدخل بنك الأنشطة معتمداً، وما يُنشر على المستوى إجباري لكل أقسامه.</p>
      </section>

      <section class="qs">
        <div class="qs__bar">
          <h3>الأسئلة ({{ q.questions.length }}) · المجموع {{ total }} ن</h3>
          <div class="btns">
            <Button label="من بنك الأسئلة" icon="pi pi-database" outlined size="small" :disabled="!levelId" @click="openBank" />
            <Button :label="mode === 'test' ? 'العودة للتحرير' : 'جرّب الاختبار'" :icon="mode === 'test' ? 'pi pi-pencil' : 'pi pi-play'" severity="help" size="small" :disabled="!q.questions.length" @click="toggleTest" />
          </div>
        </div>
        <div v-if="mode === 'edit'" class="types">
          <button v-for="(x, key) in QTYPES" :key="key" type="button" class="type" @click="addQ(key)"><i :class="x.icon" /><span>{{ x.label }}</span><small>{{ x.auto === true ? 'آلي' : x.auto ? 'آلي/يدوي' : 'يدوي' }}</small></button>
        </div>

        <div v-if="!q.questions.length" class="panel empty"><i class="pi pi-question-circle" /><p>اختر نوع سؤال أعلاه لإضافته.</p></div>

        <!-- التحرير -->
        <template v-if="mode === 'edit'">
          <div v-for="(item, i) in q.questions" :key="item.key" class="panel qc">
            <header><span class="n">{{ i + 1 }}</span><small class="muted"><i :class="QTYPES[item.type].icon" /> {{ QTYPES[item.type].label }}</small>
              <span class="qc__tools">
                <button type="button" :disabled="!i" title="أعلى" @click="move(i, -1)"><i class="pi pi-arrow-up" /></button>
                <button type="button" :disabled="i === q.questions.length - 1" title="أسفل" @click="move(i, 1)"><i class="pi pi-arrow-down" /></button>
                <button type="button" title="نسخ" @click="dup(i)"><i class="pi pi-copy" /></button>
                <button type="button" class="del" title="حذف" @click="q.questions.splice(i, 1)"><i class="pi pi-trash" /></button>
              </span>
            </header>
            <QuestionEditor :q="item" />
          </div>
        </template>

        <!-- التجربة: أجب كما يجيب التلميذ ثم صحّح -->
        <template v-else>
          <Message severity="info">وضع التجربة: أجب كما يجيب التلميذ، ثم اضغط «صحّح» لترى التنقيط. لا يُحفظ شيء.</Message>
          <div v-for="(item, i) in q.questions" :key="'t' + item.key" class="panel qc" :class="testResult && (testResult.perQuestion[i].manual ? 'man' : testResult.perQuestion[i].correct ? 'ok' : 'ko')">
            <header><span class="n">{{ i + 1 }}</span><b class="tq">{{ item.q }}</b><small class="muted">{{ qpoints(item) }} ن</small></header>
            <QuestionField v-model="testAnswers[i]" :q="publics[i]" :readonly="!!testResult" />
            <div v-if="testResult" class="res">
              <b>{{ testResult.perQuestion[i].manual ? 'يصحّحه المعلم يدوياً' : `${testResult.perQuestion[i].score} / ${testResult.perQuestion[i].max}` }}</b>
              <span>الصحيح: {{ correctText(item) }}</span>
            </div>
          </div>
          <div class="save">
            <template v-if="testResult"><b class="score">النتيجة الآلية: {{ testResult.auto }} / {{ testResult.max }}</b><small v-if="testResult.needsManual" class="muted">+ أسئلة يصحّحها المعلم</small><Button label="أعد المحاولة" text @click="resetTest" /></template>
            <Button v-else label="صحّح" icon="pi pi-check" @click="testResult = gradeQuiz(q.questions, testAnswers)" />
          </div>
        </template>

        <div v-if="mode === 'edit'" class="save">
          <small v-if="problems.length" class="warn"><i class="pi pi-exclamation-triangle" /> {{ problems[0] }}</small>
          <Button label="حفظ كمسودة" text severity="secondary" :disabled="!q.title.trim()" @click="save(false)" />
          <Button label="نشر" icon="pi pi-send" :disabled="problems.length > 0" :loading="busy" @click="save(true)" />
        </div>
      </section>
    </div>

    <Dialog v-model:visible="bankDlg" modal header="بنك الأسئلة" :style="{ width: 'min(760px, 96vw)' }">
      <p class="muted">أسئلة الاختبارات المعتمدة لهذا المستوى{{ q.subjectId ? ' والمادة' : '' }}. اختر ما تريد إضافته.</p>
      <div class="bank">
        <label v-for="b in bank" :key="b.id" class="bq" :class="{ on: picked.includes(b.id) }">
          <Checkbox v-model="picked" :value="b.id" />
          <div><b>{{ b.q }}</b><small class="muted">{{ b.lessonTitle }} · {{ QTYPES[qtype(b)].label }}</small></div>
        </label>
      </div>
      <template #footer>
        <Button label="إلغاء" text severity="secondary" @click="bankDlg = false" />
        <Button :label="`إضافة ${picked.length} سؤال`" :disabled="!picked.length" @click="addFromBank" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import ToggleSwitch from 'primevue/toggleswitch'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import QuestionEditor from '@/components/quiz/QuestionEditor.vue'
import QuestionField from '@/components/quiz/QuestionField.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { useTargets } from '@/composables/useTargets'
import { createActivity, questionBank } from '@/api/teaching'
import { QTYPES, qtype, qpoints, blankQuestion, questionProblem, publicQuestion, gradeQuiz, correctText } from '@/utils/quiz'

const auth = useAuthStore()
const cat = useCatalog()
const tg = useTargets()
const toast = useToast()
let k = 0
const targetOpts = computed(() => tg.options())
const week = () => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16)
const blank = () => ({ title: '', targets: targetOpts.value.slice(0, 1).map((o) => o.value), subjectId: null, lessonId: null, minutes: 15, due: week(), showAnswers: true, questions: [] })
const q = reactive(blank())
const mode = ref('edit')
const busy = ref(false)
const bankDlg = ref(false)
const bank = ref([])
const picked = ref([])
const testAnswers = ref([])
const testResult = ref(null)
const levelId = computed(() => tg.levelOf(q.targets[0]))
const total = computed(() => q.questions.reduce((n, x) => n + qpoints(x), 0))
const publics = computed(() => q.questions.map((x, i) => publicQuestion(x, i + 3)))

const addQ = (type) => q.questions.push({ key: ++k, ...blankQuestion(type) })
const dup = (i) => q.questions.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(q.questions[i])), key: ++k })
function move(i, d) {
  const [x] = q.questions.splice(i, 1)
  q.questions.splice(i + d, 0, x)
}
function resetTest() {
  testAnswers.value = q.questions.map(() => undefined)
  testResult.value = null
}
function toggleTest() {
  mode.value = mode.value === 'test' ? 'edit' : 'test'
  resetTest()
}
async function openBank() {
  picked.value = []
  bank.value = await questionBank(levelId.value, q.subjectId)
  bankDlg.value = true
}
function addFromBank() {
  bank.value.filter((b) => picked.value.includes(b.id)).forEach((b) => {
    const { id, lessonTitle, ...rest } = b
    q.questions.push({ key: ++k, points: 1, explain: '', ...JSON.parse(JSON.stringify(rest)), type: qtype(b) })
  })
  bankDlg.value = false
}
const problems = computed(() => {
  const out = []
  if (!q.title.trim()) out.push('أضف عنواناً للاختبار')
  if (!q.targets.length) out.push('اختر أين يُنشر')
  if (new Set(q.targets.map(tg.levelOf)).size > 1) out.push('الأهداف من مستويات مختلفة: اختر مستوى واحداً')
  if (!q.subjectId) out.push('اختر المادة')
  if (!q.questions.length) out.push('أضف سؤالاً واحداً على الأقل')
  q.questions.forEach((x, i) => {
    const p = questionProblem(x, i)
    if (p) out.push(p)
  })
  return out
})
async function save(publish) {
  if (publish && problems.value.length) return
  busy.value = true
  const { targets, due, ...rest } = JSON.parse(JSON.stringify(q))
  rest.questions = rest.questions.map(({ key, ...x }) => x)
  const r = await createActivity(auth.person, { kind: 'quiz', ...rest, levelId: levelId.value }, { targets: publish ? tg.decode(targets) : [], due, submit: publish, byRole: auth.role })
  busy.value = false
  toast.add({ severity: 'success', summary: !publish ? 'حُفظت المسودة' : `نُشر في ${r.reached} قسم`, detail: publish && !tg.isEditor.value ? 'يظهر للتلاميذ بعد مصادقة المدير أو اعتماد المحرر' : '', life: 3000 })
  Object.assign(q, blank())
}
</script>

<style scoped>
.qb { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; align-items: start; }
.meta { display: flex; flex-direction: column; gap: 0.85rem; position: sticky; top: 80px; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.fl.sw { flex-direction: row; align-items: center; gap: 0.6rem; }
.fl.sw > span { font-weight: 500; font-size: 0.85rem; }
.qs { display: flex; flex-direction: column; gap: 0.75rem; }
.qs__bar { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.qs__bar h3 { margin: 0; font-size: 1rem; }
.btns { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.empty { text-align: center; color: var(--p-text-muted-color); }
.empty i { font-size: 2rem; }
.qc { display: flex; flex-direction: column; gap: 0.6rem; }
.qc header { display: flex; align-items: center; gap: 0.6rem; }
.n { width: 28px; height: 28px; border-radius: 50%; background: var(--brand); color: #fff; display: grid; place-items: center; font-weight: 800; }
.qc__tools { margin-inline-start: auto; display: flex; gap: 0.2rem; }
.qc__tools button { border: 0; background: none; cursor: pointer; color: var(--p-text-muted-color); padding: 0.3rem; }
.qc__tools button:disabled { opacity: 0.3; }
.qc__tools .del:hover { color: #b42318; }
.opts { display: flex; flex-direction: column; gap: 0.4rem; }
.opt { display: flex; align-items: center; gap: 0.4rem; }
.opt.right :deep(input) { border-color: #17a077; background: #f0fbf6; }
.mark, .rm { border: 0; background: none; cursor: pointer; font-size: 1.1rem; color: var(--p-text-muted-color); }
.opt.right .mark { color: #17a077; }
.addopt { align-self: flex-start; border: 1px dashed var(--line); background: none; border-radius: 8px; padding: 0.3rem 0.7rem; cursor: pointer; font: inherit; font-size: 0.82rem; color: var(--brand); }
.exp :deep(input), .exp { font-size: 0.85rem; }
.pq { margin: 0; font-weight: 700; }
.popts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
.popts span { border: 1.5px solid var(--line); border-radius: 10px; padding: 0.5rem 0.75rem; }
.popts span.right { border-color: #17a077; background: #f0fbf6; }
.save { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.warn { color: #a15c00; margin-inline-end: auto; }
.types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; }
.type { border: 1px solid var(--line); background: var(--surface); border-radius: 12px; padding: 0.55rem; cursor: pointer; font: inherit; color: inherit; display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
.type:hover { border-color: var(--brand); }
.type i { color: var(--brand); font-size: 1.1rem; }
.type span { font-weight: 700; font-size: 0.84rem; }
.type small { font-size: 0.7rem; color: var(--p-text-muted-color); }
.qc.ok { border-color: #17a077; } .qc.ko { border-color: #e5484d; } .qc.man { border-color: #e0a100; }
.tq { flex: 1; }
.res { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.86rem; padding-top: 0.4rem; border-top: 1px dashed var(--line); }
.res span { color: #17733f; }
.score { font-size: 1.1rem; }
.small { font-size: 0.8rem; margin: 0; }
.bank { display: flex; flex-direction: column; gap: 0.4rem; max-height: 55vh; overflow: auto; }
.bq { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.6rem; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }
.bq.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, #fff); }
.bq b { display: block; font-size: 0.9rem; }
.bq small { font-size: 0.78rem; }
@media (max-width: 960px) { .types { grid-template-columns: repeat(2, 1fr); } .qb { grid-template-columns: 1fr; } .meta { position: static; } }
</style>
