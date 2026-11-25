<template>
  <!-- SM07: مصادقة ملفات المعلمين — المحتوى الموجّه لأقسام المدرسة -->
  <div>
    <PageHeader title="مصادقة ملفات المعلمين" subtitle="ما يرفعه معلمو مدرستك لأقسامهم يمرّ عليك قبل أن يصل التلاميذ. المقترحات للمكتبة المركزية يراجعها المحرر." />
    <div class="tabs">
      <button v-for="tb in TABS" :key="tb.key" type="button" class="pill" :class="{ 'is-active': tab === tb.key }" @click="tab = tb.key">{{ tb.label }} <span class="pill__count">{{ rows.filter(tb.fn).length }}</span></button>
    </div>
    <RecordTable :rows="rows.filter(TABS.find((x) => x.key === tab).fn)" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'authorName', label: 'المعلم' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' },
      { field: 'targetLabel', label: 'الوجهة' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'authorName']" unit="ملف" empty-text="لا ملفات هنا">
      <template #actions="{ row }">
        <template v-if="row.status === 'review' && row.target === 'class'">
          <Button icon="pi pi-check" text rounded severity="success" size="small" title="مصادقة" @click="decideIt(row, 'approved')" />
          <Button icon="pi pi-times" text rounded severity="danger" size="small" title="رفض" @click="openReject(row)" />
        </template>
        <small v-else-if="row.target === 'library' && row.status === 'review'" class="muted">عند المحرر</small>
      </template>
    </RecordTable>
    <Dialog v-model:visible="rDlg" modal header="سبب الرفض" :style="{ width: 'min(460px, 94vw)' }">
      <Textarea v-model="note" rows="3" auto-resize fluid placeholder="ما الذي يجب تعديله؟" />
      <template #footer><Button label="رفض" severity="danger" :disabled="!note.trim()" @click="decideIt(target, 'rejected', note)" /></template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { uploadsQueue, decideUpload } from '@/api/teaching'
import { assignments } from '@/mock/db'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const TABS = [
  { key: 'review', label: 'بانتظار المصادقة', fn: (r) => r.status === 'review' && r.target === 'class' },
  { key: 'library', label: 'مقترحات للمكتبة', fn: (r) => r.target === 'library' },
  { key: 'done', label: 'تمّ البتّ فيها', fn: (r) => r.status !== 'review' && r.target === 'class' }
]
const tab = ref('review')
const rows = ref([])
const rDlg = ref(false)
const note = ref('')
const target = ref(null)
async function load() {
  const ids = [...new Set(assignments.filter((a) => a.role === 'teacher' && a.schoolId === auth.active.school.id).map((a) => a.personId))]
  rows.value = (await uploadsQueue({ schoolTeacherIds: ids })).map((u) => ({ ...u, typeLabel: cat.TYPE_LABEL[u.type], targetLabel: u.target === 'library' ? 'المكتبة المركزية' : 'أقسام المعلم' }))
}
onMounted(load)
function openReject(r) {
  target.value = r
  note.value = ''
  rDlg.value = true
}
async function decideIt(r, status, n = '') {
  await decideUpload(r.id, status, n)
  rDlg.value = false
  toast.add({ severity: status === 'approved' ? 'success' : 'info', summary: status === 'approved' ? 'صودق على الملف — يظهر الآن لتلاميذ المعلم' : 'رُفض الملف وأُبلغ المعلم بالسبب', life: 2600 })
  load()
}
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
</style>
