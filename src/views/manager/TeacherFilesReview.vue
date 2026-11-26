<template>
  <!-- SM07: مصادقة محتوى المعلمين — المدير يصادق فقط (← معتمد مؤقتاً في أقسام المعلم). الرفض وطلب التعديل للمحرر. -->
  <div>
    <PageHeader title="مصادقة محتوى المعلمين" subtitle="ما يرسله معلمو مدرستك للمكتبة المركزية. مصادقتك تجعله يظهر في أقسام صاحبه فوراً (معتمد مؤقتاً) حتى يبتّ فيه المحرر." />
    <Message severity="info" class="mb"><i class="pi pi-info-circle" /> إن لم يعجبك محتوى فاتركه دون مصادقة: الرفض وطلب التعديل من صلاحية المحرر.</Message>
    <div class="tabs">
      <button v-for="tb in TABS" :key="tb.key" type="button" class="pill" :class="{ 'is-active': tab === tb.key }" @click="tab = tb.key">{{ tb.label }} <span class="pill__count">{{ rows.filter(tb.fn).length }}</span></button>
    </div>
    <RecordTable :rows="rows.filter(TABS.find((x) => x.key === tab).fn)" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'authorName', label: 'المعلم' }, { field: 'kindLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' },
      { field: 'levelName', label: 'المستوى' }, { field: 'at', label: 'أُرسل', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'authorName']" unit="عنصر" empty-text="لا شيء هنا">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.note" class="muted d">ملاحظة المحرر: {{ row.note }}</small></template>
      <template #actions="{ row }">
        <Button icon="pi pi-eye" text rounded size="small" title="معاينة" @click="cur = row" />
        <Button v-if="row.status === 'review'" label="مصادقة" icon="pi pi-check" size="small" severity="success" @click="approve(row)" />
      </template>
    </RecordTable>
    <Dialog :visible="!!cur" modal :header="cur?.title" :style="{ width: 'min(820px, 96vw)' }" @update:visible="cur = null">
      <div v-if="cur">
        <p class="muted">{{ cur.authorName }} · {{ cur.subjectName }} · {{ cur.levelName }}</p>
        <ContentViewer v-if="cur.kind === 'upload' && ['video', 'slides', 'pdf', 'image'].includes(cur.type)" :item="preview" />
        <ol v-else-if="cur.questions?.length" class="qs"><li v-for="(q, i) in cur.questions" :key="i"><b>{{ q.q }}</b> <small class="muted">({{ QTYPES[q.type || 'mcq'].label }})</small><div class="ans">{{ correctText(q) }}</div></li></ol>
        <p v-else>{{ cur.instructions }}</p>
      </div>
      <template #footer><Button v-if="cur?.status === 'review'" label="مصادقة" icon="pi pi-check" severity="success" @click="approve(cur)" /></template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { managerQueue, managerApprove } from '@/api/teaching'
import { normUpload, uploads } from '@/api/bank'
import { QTYPES, correctText } from '@/utils/quiz'
import { assignments } from '@/mock/db'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const TABS = [
  { key: 'review', label: 'بانتظار مصادقتك', fn: (r) => r.status === 'review' },
  { key: 'temp', label: 'صادقت عليها (عند المحرر)', fn: (r) => r.status === 'temp' },
  { key: 'done', label: 'بتّ فيها المحرر', fn: (r) => ['approved', 'rejected'].includes(r.status) }
]
const tab = ref('review')
const rows = ref([])
const cur = ref(null)
const preview = computed(() => (cur.value?.kind === 'upload' ? normUpload(uploads().find(cur.value.id)) : null))
async function load() {
  const ids = [...new Set(assignments.filter((a) => a.role === 'teacher' && a.schoolId === auth.active.school.id).map((a) => a.personId))]
  rows.value = (await managerQueue(ids)).map((r) => ({ ...r, kindLabel: r.kind === 'activity' ? (r.type === 'quiz' ? 'تقييم' : 'واجب') : cat.TYPE_LABEL[r.type] }))
}
onMounted(load)
async function approve(r) {
  await managerApprove(r.kind, r.id)
  cur.value = null
  toast.add({ severity: 'success', summary: 'صودق عليه', detail: 'يظهر الآن في أقسام المعلم (معتمد مؤقتاً) حتى يبتّ فيه المحرر', life: 3000 })
  load()
}
</script>

<style scoped>
.mb { margin-bottom: 1rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.d { display: block; font-size: 0.78rem; }
.qs { padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.ans { font-size: 0.86rem; color: #17733f; margin-top: 0.2rem; }
</style>
