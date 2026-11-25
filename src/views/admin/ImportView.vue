<template>
  <!-- AD04: الاستيراد الجماعي — نموذج Excel ← معاينة وتصحيح الأخطاء ← تأكيد -->
  <div>
    <PageHeader title="الاستيراد الجماعي" subtitle="أضف مئات التلاميذ أو المعلمين أو الأولياء دفعة واحدة من ملف Excel." />
    <ol class="steps"><li v-for="(s, i) in STEPS" :key="s" :class="{ on: step === i, done: step > i }"><span>{{ i + 1 }}</span>{{ s }}</li></ol>

    <section v-if="step === 0" class="panel s0">
      <div class="grid2">
        <label class="fl"><span>نوع البيانات</span><Select v-model="entity" :options="ENTITIES" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>المدرسة</span><Select v-model="schoolId" :options="cat.schoolOptions" option-label="label" option-value="value" filter fluid /></label>
      </div>
      <div class="tpl">
        <i class="pi pi-file-excel" />
        <div><b>نموذج الاستيراد</b><p class="muted">الأعمدة المطلوبة: {{ ENTITIES.find((e) => e.value === entity).cols.join('، ') }}</p></div>
        <Button label="تنزيل نموذج Excel" icon="pi pi-file-excel" outlined size="small" v-tooltip="schoolId ? '' : 'اختر المدرسة أولاً لتظهر أقسامها في القوائم'" @click="template" />
      </div>
      <label class="drop" :class="{ has: file }">
        <input type="file" accept=".xlsx,.xls,.csv" @change="(e) => (file = e.target.files[0]?.name)" />
        <i class="pi pi-cloud-upload" />
        <b>{{ file || 'اختر ملف Excel أو CSV' }}</b>
        <small class="muted">حتى 5000 سطر في الملف الواحد</small>
      </label>
      <div class="act"><Button label="تحليل الملف" icon="pi pi-arrow-left flip" icon-pos="right" :disabled="!file || !schoolId" :loading="busy" @click="analyze" /></div>
    </section>

    <section v-else-if="step === 1">
      <Message :severity="errors ? 'warn' : 'success'" class="mb">{{ rows.length }} سطراً · {{ rows.length - errors }} صالح · {{ errors }} يحتوي أخطاء. يمكنك تصحيح الأخطاء هنا أو استبعادها.</Message>
      <RecordTable :rows="rows" :columns="[{ field: 'line', label: 'السطر' }, { field: 'lastName', label: 'اللقب' }, { field: 'firstName', label: 'الاسم' }, { field: 'birthDate', label: 'الميلاد' }, { field: 'className', label: 'القسم' }, { field: 'parentPhone', label: 'هاتف الولي' }, { field: 'error', label: 'الملاحظة' }]" :page-size="15" unit="سطر" :row-class="(r) => (r.error ? 'row-err' : '')">
        <template #cell-error="{ row }"><span v-if="row.error" class="err"><i class="pi pi-exclamation-triangle" /> {{ row.error }}</span><span v-else class="ok"><i class="pi pi-check" /> صالح</span></template>
        <template #actions="{ row }"><Button v-if="row.error" label="استبعاد" text size="small" severity="danger" @click="rows = rows.filter((x) => x.id !== row.id)" /></template>
      </RecordTable>
      <div class="act"><Button label="رجوع" text severity="secondary" @click="step = 0" /><Button :label="`استيراد ${rows.length - errors} سطر`" icon="pi pi-check" :loading="busy" @click="confirm" /></div>
    </section>

    <section v-else class="panel done">
      <i class="pi pi-check-circle" />
      <h2>تمّ الاستيراد</h2>
      <p>أُضيف {{ imported }} {{ ENTITIES.find((e) => e.value === entity).label }} بحالة «بانتظار التفعيل». يفعّلهم مدير المدرسة من شاشة «تفعيل الحسابات».</p>
      <Button label="استيراد ملف آخر" outlined @click="reset" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Message from 'primevue/message'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { previewImport, addJob } from '@/api/admin'
import { downloadImportTemplate } from '@/utils/importTemplate'

const auth = useAuthStore()
const cat = useCatalog()
const STEPS = ['الملف', 'المعاينة والتصحيح', 'النتيجة']
const ENTITIES = [
  { value: 'students', label: 'تلاميذ', cols: ['اللقب', 'الاسم', 'تاريخ الميلاد', 'الجنس', 'القسم', 'هاتف الولي'] },
  { value: 'teachers', label: 'معلمين', cols: ['اللقب', 'الاسم', 'الهاتف', 'البريد', 'المواد', 'الأقسام'] },
  { value: 'parents', label: 'أولياء', cols: ['اللقب', 'الاسم', 'الهاتف', 'أسماء الأبناء'] }
]
const step = ref(0)
const entity = ref('students')
const schoolId = ref(null)
const file = ref(null)
const busy = ref(false)
const rows = ref([])
const imported = ref(0)
const errors = computed(() => rows.value.filter((r) => r.error).length)
// نموذج Excel: عناوين + أمثلة + قوائم منسدلة بأقسام المدرسة ومواد مستوياتها + ورقة تعليمات
async function template() {
  const cls = cat.classes.filter((c) => c.schoolId === schoolId.value)
  const lv = new Set(cls.map((c) => c.levelId))
  await downloadImportTemplate(entity.value, {
    schoolName: cat.schools.find((s) => s.id === schoolId.value)?.name || '',
    classes: cls.map((c) => c.name),
    subjects: [...new Set(cat.subjects.filter((s) => lv.has(s.levelId)).map((s) => s.name))]
  })
}
async function analyze() {
  busy.value = true
  rows.value = await previewImport(entity.value, schoolId.value)
  busy.value = false
  step.value = 1
}
async function confirm() {
  busy.value = true
  imported.value = rows.value.length - errors.value
  await addJob({ kind: 'import', entity: entity.value, file: file.value, rows: rows.value.length, ok: imported.value, errors: errors.value }, auth.person)
  busy.value = false
  step.value = 2
}
function reset() {
  step.value = 0
  file.value = null
  rows.value = []
}
</script>

<style scoped>
.steps { list-style: none; display: flex; gap: 0.5rem; padding: 0; margin: 0 0 1rem; flex-wrap: wrap; }
.steps li { display: flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.9rem; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--p-text-muted-color); font-size: 0.88rem; }
.steps li span { width: 22px; height: 22px; border-radius: 50%; background: var(--line); display: grid; place-items: center; font-weight: 800; font-size: 0.78rem; }
.steps li.on { border-color: var(--brand); color: var(--ink); font-weight: 700; }
.steps li.on span, .steps li.done span { background: var(--brand); color: #fff; }
.s0 { display: flex; flex-direction: column; gap: 1rem; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.tpl { display: flex; align-items: center; gap: 0.9rem; padding: 0.8rem; background: #eefaf3; border-radius: 12px; }
.tpl > i { font-size: 2rem; color: #17733f; }
.tpl p { margin: 0.1rem 0 0; font-size: 0.84rem; }
.tpl .p-button { margin-inline-start: auto; }
.drop { border: 2px dashed var(--line); border-radius: 14px; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; cursor: pointer; }
.drop.has { border-color: var(--brand); }
.drop input { display: none; }
.drop i { font-size: 2rem; color: var(--brand); }
.act { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.mb { margin-bottom: 1rem; }
.err { color: #b42318; font-size: 0.84rem; }
.ok { color: #17733f; font-size: 0.84rem; }
:deep(.row-err) { background: #fff6f6 !important; }
.done { text-align: center; padding: 2.5rem 1rem; }
.done > i { font-size: 3rem; color: #17a077; }
.done p { max-width: 520px; margin: 0.5rem auto 1rem; }
@media (max-width: 700px) { .grid2 { grid-template-columns: 1fr; } }
</style>
