<template>
  <!-- SM12/TE18: أوراق الدخول — يطبع المدير أو المعلم لتلاميذ القسم (وأوليائهم) أوراقاً باسم المستخدم وكلمة مرور مؤقتة -->
  <div>
    <PageHeader title="أوراق الدخول" subtitle="اطبع لتلاميذ القسم أوراقاً فيها اسم المستخدم وكلمة مرور مؤقتة، ووزّعها عليهم في القسم. عند أول دخول تطلب المنصة من كل واحد اختيار كلمة مرور خاصة به." />

    <section class="panel ls">
      <label class="fl"><span>القسم</span>
        <Select v-model="classId" :options="classOpts" option-label="label" option-value="value" placeholder="اختر القسم" fluid />
      </label>
      <div class="fl"><span>لمن تُطبع الأوراق؟</span>
        <label v-for="o in SCOPES" :key="o.value" class="radio"><RadioButton v-model="scope" :value="o.value" /> <span><b>{{ o.label }}</b><small>{{ o.hint }}</small></span></label>
      </div>
      <label class="chk"><Checkbox v-model="withParents" binary /> <span>مع ورقة لكل ولي (اسم المستخدم وكلمة مرور مؤقتة للولي)</span></label>
      <Message v-if="scope === 'all'" severity="warn" size="small">تُلغى كلمات مرور تلاميذ القسم كلهم، ولا يدخلون إلا بالأوراق الجديدة.</Message>
      <div class="act">
        <Button :label="btnLabel" icon="pi pi-print" :severity="scope === 'all' ? 'danger' : undefined" :disabled="!classId || (scope === 'ids' && !sel.length)" :loading="busy" @click="issue" />
      </div>
    </section>

    <RecordTable v-if="classId" v-model:selection="sel" :rows="rows" :loading="loading" :selectable="scope === 'ids'" :columns="[
      { field: 'name', label: 'التلميذ', type: 'person', sub: 'username' }, { field: 'stateLabel', label: 'الحالة' }, { field: 'parentsLabel', label: 'الولي' }
    ]" :search-keys="['name', 'username']" unit="تلميذ" empty-text="لا تلاميذ في هذا القسم">
      <template #cell-stateLabel="{ row }"><span class="st" :class="`st--${row.state}`">{{ row.stateLabel }}</span></template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { loginSheetRoster, issueLoginSheets } from '@/api/credentials'
import { storage } from '@/utils/storage'

const SCOPES = [
  { value: 'new', label: 'من لم يدخل بعد (مقترح)', hint: 'التلاميذ الذين لم يدخلوا المنصة بكلمة مرورهم الخاصة' },
  { value: 'ids', label: 'تلاميذ محدّدون', hint: 'ضاعت ورقته أو نسي كلمة مروره: حدّده في الجدول أسفله' },
  { value: 'all', label: 'كل تلاميذ القسم', hint: 'بداية الموسم، أو إعادة تعيين للجميع' }
]
const STATE = { never: 'لم يدخل بعد', temp: 'بكلمة مرور مؤقتة لم يغيّرها', own: 'دخل بكلمة مروره' }

const auth = useAuthStore()
const cat = useCatalog()
const router = useRouter()
const toast = useToast()
// المدير: أقسام مدرسته؛ المعلم: أقسامه
const classOpts = computed(() => auth.role === 'school_manager' ? cat.classOptions(cat.classes.filter((c) => c.schoolId === auth.active?.schoolId).map((c) => c.id)) : cat.classOptions(auth.active?.classIds || []))
const classId = ref(classOpts.value.length === 1 ? classOpts.value[0].value : null)
const scope = ref('new')
const withParents = ref(false)
const rows = ref([])
const sel = ref([])
const loading = ref(false)
const busy = ref(false)
const btnLabel = computed(() => scope.value === 'ids' ? `توليد أوراق المحدّدين (${sel.value.length}) وطباعتها` : 'توليد الأوراق وطباعتها')

async function load() {
  if (!classId.value) return
  loading.value = true
  sel.value = []
  rows.value = (await loginSheetRoster(classId.value)).map((r) => ({ ...r, stateLabel: STATE[r.state], parentsLabel: r.parents.join('، ') || '—' }))
  loading.value = false
}
watch(classId, load, { immediate: true })

async function issue() {
  busy.value = true
  try {
    const data = await issueLoginSheets(classId.value, { scope: scope.value, ids: sel.value.map((r) => r.id), withParents: withParents.value }, auth.person)
    // تُمرَّر لصفحة الطباعة فقط؛ في الخادم الحقيقي لا تُحفظ كلمات المرور المؤقتة في المتصفح
    storage.set('ist.loginSheets', data)
    router.push({ name: 'login-sheets-print' })
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.ls { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
.fl { display: flex; flex-direction: column; gap: 0.45rem; }
.fl > span { font-weight: 700; font-size: 0.88rem; }
.radio { display: flex; gap: 0.55rem; align-items: flex-start; cursor: pointer; }
.radio > span { display: flex; flex-direction: column; }
.radio small { color: var(--muted); font-size: 0.8rem; }
.chk { display: flex; gap: 0.55rem; align-items: center; font-size: 0.9rem; cursor: pointer; }
.act { display: flex; justify-content: flex-end; }
.st { font-size: 0.78rem; padding: 0.15rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.st--never { background: #fff1e0; color: #a15c00; }
.st--temp { background: #e8f0ff; color: #2b4a8b; }
.st--own { background: #e6f6ec; color: #1f7a45; }
</style>
