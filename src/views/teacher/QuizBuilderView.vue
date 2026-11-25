<template>
  <!-- TE15: منشئ الاختبارات — أسئلة متعددة الخيارات / صح وخطأ، من بنك الأسئلة أو جديدة، مع معاينة -->
  <div>
    <PageHeader title="منشئ الاختبارات" subtitle="أنشئ اختباراً قصيراً يُصحَّح آلياً. أضف أسئلة جديدة أو اخترها من بنك أسئلة المنصة." />
    <div class="qb">
      <section class="panel meta">
        <label class="fl full"><span>عنوان الاختبار *</span><InputText v-model="q.title" fluid placeholder="مثال: اختبار قصير — أحكام الطهارة" /></label>
        <label v-if="isTeacher" class="fl"><span>الأقسام *</span><MultiSelect v-model="q.classIds" :options="cat.classOptions(auth.active.classIds)" option-label="label" option-value="value" display="chip" fluid /></label>
        <label v-else class="fl"><span>المستوى *</span><Select v-model="q.levelId" :options="cat.levelOptions" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>المادة *</span><Select v-model="q.subjectId" :options="cat.subjectOptions(levelId)" option-label="label" option-value="value" fluid :disabled="!levelId" /></label>
        <label class="fl"><span>المدة (دقائق)</span><InputNumber v-model="q.minutes" :min="0" :max="180" fluid placeholder="بلا حدّ" /></label>
        <label class="fl"><span>آخر أجل</span><InputText v-model="q.due" type="datetime-local" fluid /></label>
        <label class="fl sw full"><ToggleSwitch v-model="q.shuffle" /> <span>ترتيب عشوائي للأسئلة والخيارات</span></label>
        <label class="fl sw full"><ToggleSwitch v-model="q.showAnswers" /> <span>إظهار الإجابات الصحيحة بعد التسليم</span></label>
      </section>

      <section class="qs">
        <div class="qs__bar">
          <h3>الأسئلة ({{ q.questions.length }}) · المجموع {{ q.questions.length }} نقاط</h3>
          <div class="btns">
            <Button label="من بنك الأسئلة" icon="pi pi-database" outlined size="small" :disabled="!levelId" @click="openBank" />
            <Button label="خيارات متعددة" icon="pi pi-plus" size="small" @click="addQ('mcq')" />
            <Button label="صح / خطأ" icon="pi pi-plus" size="small" severity="secondary" @click="addQ('tf')" />
            <Button :label="preview ? 'تعديل' : 'معاينة'" :icon="preview ? 'pi pi-pencil' : 'pi pi-eye'" text size="small" @click="preview = !preview" />
          </div>
        </div>

        <div v-if="!q.questions.length" class="panel empty"><i class="pi pi-question-circle" /><p>ابدأ بإضافة سؤال.</p></div>

        <div v-for="(item, i) in q.questions" :key="item.key" class="panel qc">
          <header><span class="n">{{ i + 1 }}</span><small class="muted">{{ item.type === 'tf' ? 'صح أم خطأ' : 'خيارات متعددة' }}</small>
            <span v-if="!preview" class="qc__tools">
              <button type="button" :disabled="!i" title="أعلى" @click="move(i, -1)"><i class="pi pi-arrow-up" /></button>
              <button type="button" :disabled="i === q.questions.length - 1" title="أسفل" @click="move(i, 1)"><i class="pi pi-arrow-down" /></button>
              <button type="button" class="del" title="حذف" @click="q.questions.splice(i, 1)"><i class="pi pi-trash" /></button>
            </span>
          </header>
          <template v-if="!preview">
            <InputText v-model="item.q" fluid placeholder="نص السؤال" />
            <div class="opts">
              <div v-for="(o, oi) in item.options" :key="oi" class="opt" :class="{ right: item.answer === oi }">
                <button type="button" class="mark" :title="'الإجابة الصحيحة'" @click="item.answer = oi"><i :class="item.answer === oi ? 'pi pi-check-circle' : 'pi pi-circle'" /></button>
                <InputText v-model="item.options[oi]" :disabled="item.type === 'tf'" fluid />
                <button v-if="item.type === 'mcq' && item.options.length > 2" type="button" class="rm" @click="removeOpt(item, oi)"><i class="pi pi-times" /></button>
              </div>
              <button v-if="item.type === 'mcq' && item.options.length < 5" type="button" class="addopt" @click="item.options.push('')"><i class="pi pi-plus" /> خيار</button>
            </div>
            <InputText v-model="item.explain" fluid placeholder="شرح الإجابة (يظهر بعد التسليم) — اختياري" class="exp" />
          </template>
          <template v-else>
            <p class="pq">{{ item.q || '—' }}</p>
            <div class="popts"><span v-for="(o, oi) in item.options" :key="oi" :class="{ right: q.showAnswers && item.answer === oi }">{{ o }}</span></div>
          </template>
        </div>

        <div class="save">
          <small v-if="problems.length" class="warn"><i class="pi pi-exclamation-triangle" /> {{ problems[0] }}</small>
          <Button label="حفظ كمسودة" text severity="secondary" @click="save('draft')" />
          <Button :label="isTeacher ? 'نشر للتلاميذ' : 'إرسال للمراجعة'" icon="pi pi-send" :disabled="problems.length > 0" :loading="busy" @click="save(isTeacher ? 'published' : 'review')" />
        </div>
      </section>
    </div>

    <Dialog v-model:visible="bankDlg" modal header="بنك الأسئلة" :style="{ width: 'min(760px, 96vw)' }">
      <p class="muted">أسئلة اختبارات المنصة لهذا المستوى{{ q.subjectId ? ' والمادة' : '' }}. اختر ما تريد إضافته.</p>
      <div class="bank">
        <label v-for="b in bank" :key="b.id" class="bq" :class="{ on: picked.includes(b.id) }">
          <Checkbox v-model="picked" :value="b.id" />
          <div><b>{{ b.q }}</b><small class="muted">{{ b.lessonTitle }} · {{ b.options.length }} خيارات</small></div>
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
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { createActivity, questionBank } from '@/api/teaching'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const isTeacher = computed(() => auth.role === 'teacher')
let k = 0
const blank = () => ({ title: '', classIds: [...(auth.active.classIds || []).slice(0, 1)], levelId: null, subjectId: null, minutes: 15, due: '', shuffle: true, showAnswers: true, questions: [] })
const q = reactive(blank())
const preview = ref(false)
const busy = ref(false)
const bankDlg = ref(false)
const bank = ref([])
const picked = ref([])
const levelId = computed(() => (isTeacher.value ? cat.levelOfClass(q.classIds[0]) : q.levelId))

function addQ(type) {
  q.questions.push(type === 'tf' ? { key: ++k, type, q: '', options: ['صح', 'خطأ'], answer: 0, explain: '' } : { key: ++k, type, q: '', options: ['', '', ''], answer: 0, explain: '' })
}
function removeOpt(item, oi) {
  item.options.splice(oi, 1)
  if (item.answer >= item.options.length) item.answer = 0
}
function move(i, d) {
  const [x] = q.questions.splice(i, 1)
  q.questions.splice(i + d, 0, x)
}
async function openBank() {
  picked.value = []
  bank.value = await questionBank(levelId.value, q.subjectId)
  bankDlg.value = true
}
function addFromBank() {
  bank.value.filter((b) => picked.value.includes(b.id)).forEach((b) => q.questions.push({ key: ++k, type: b.options.length === 2 ? 'tf' : 'mcq', q: b.q, options: [...b.options], answer: b.answer, explain: b.explain || '' }))
  bankDlg.value = false
}
const problems = computed(() => {
  const out = []
  if (!q.title.trim()) out.push('أضف عنواناً للاختبار')
  if (!q.subjectId) out.push('اختر المادة')
  if (!q.questions.length) out.push('أضف سؤالاً واحداً على الأقل')
  q.questions.forEach((x, i) => {
    if (!x.q.trim()) out.push(`السؤال ${i + 1} بلا نص`)
    if (x.options.some((o) => !String(o).trim())) out.push(`في السؤال ${i + 1} خيار فارغ`)
  })
  return out
})
async function save(status) {
  if (status !== 'draft' && problems.value.length) return
  busy.value = true
  await createActivity(auth.person, { kind: 'quiz', status, ...JSON.parse(JSON.stringify(q)) })
  busy.value = false
  toast.add({ severity: 'success', summary: status === 'draft' ? 'حُفظت المسودة' : status === 'review' ? 'أُرسل للمراجعة' : 'نُشر الاختبار', life: 2500 })
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
.bank { display: flex; flex-direction: column; gap: 0.4rem; max-height: 55vh; overflow: auto; }
.bq { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.6rem; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }
.bq.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, #fff); }
.bq b { display: block; font-size: 0.9rem; }
.bq small { font-size: 0.78rem; }
@media (max-width: 960px) { .qb { grid-template-columns: 1fr; } .meta { position: static; } }
</style>
