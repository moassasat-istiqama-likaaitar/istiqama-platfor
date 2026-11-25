<template>
  <!-- TE16: ملفاتي وأنشطتي — حالة كل ما رفعته أو أنشأته، وملاحظات المحرر عند طلب التعديل أو الرفض -->
  <div>
    <PageHeader title="ملفاتي وأنشطتي" subtitle="المسودات عندك وحدك حتى ترسلها. ما طلب المحرر تعديله يعود مسودة مع ملاحظته." />
    <div class="legend"><span v-for="(v, k) in LIFECYCLE" :key="k"><StatusTag :status="k" /> <small class="muted">{{ v.hint }}</small></span></div>
    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'files' }" @click="tab = 'files'"><i class="pi pi-folder" /> المحتوى <span class="pill__count">{{ files.length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'acts' }" @click="tab = 'acts'"><i class="pi pi-pencil" /> الواجبات والاختبارات <span class="pill__count">{{ acts.length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'offline' }" @click="tab = 'offline'"><i class="pi pi-print" /> الاختبارات الحضورية <span class="pill__count">{{ offline.length }}</span></button>
    </div>
    <RecordTable v-if="tab === 'offline'" :rows="offline" :columns="[{ field: 'title', label: 'العنوان' }, { field: 'kind', label: 'النوع' }, { field: 'subjectName', label: 'المادة' }, { field: 'levelName', label: 'المستوى' }, { field: 'season', label: 'الموسم' }, { field: 'semLabel', label: 'السداسي' }, { field: 'at', label: 'نُشر', type: 'date' }]" :search-keys="['title']" unit="اختبار" empty-text="لم ترفع اختباراً حضورياً بعد">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.hidden" class="note rejected">أخفاه المحرر</small></template>
      <template #toolbar><RouterLink to="/app/offline-tests" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع اختبار حضوري</RouterLink></template>
    </RecordTable>
    <RecordTable v-else :rows="tab === 'files' ? files : acts" :columns="cols" :search-keys="['title', 'subjectName']" :filters="[{ key: 'status', label: 'الحالة', options: Object.entries(LIFECYCLE).map(([value, x]) => ({ value, label: x.label })) }]" :unit="tab === 'files' ? 'ملف' : 'نشاط'" empty-text="لا شيء بعد">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.note" class="note" :class="row.status"><i class="pi pi-comment" /> {{ row.status === 'rejected' ? 'سبب الرفض' : 'المطلوب تعديله' }}: {{ row.note }}</small></template>
      <template #actions="{ row }">
        <template v-if="row.status === 'draft'">
          <RouterLink v-if="tab === 'files'" :to="{ path: '/app/upload-content', query: { edit: row.id } }" class="p-button p-component p-button-text p-button-sm">تعديل</RouterLink>
          <Button label="إرسال للمراجعة" size="small" icon="pi pi-send" @click="send(row)" />
        </template>
        <Button v-if="['draft', 'rejected'].includes(row.status)" icon="pi pi-trash" text rounded severity="danger" size="small" title="حذف" @click="del(row)" />
      </template>
      <template #toolbar>
        <RouterLink v-if="tab === 'files'" to="/app/upload-content" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع محتوى</RouterLink>
        <template v-else>
          <RouterLink to="/app/new-homework" class="p-button p-component p-button-sm p-button-outlined">واجب جديد</RouterLink>
          <RouterLink to="/app/quiz-builder" class="p-button p-component p-button-sm">اختبار جديد</RouterLink>
        </template>
      </template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { LIFECYCLE, classLabel } from '@/composables/useStatusLabels'
import { myOfflineUploads, myUploads, listMyActivities, removeUpload, submitUpload, submitActivity } from '@/api/teaching'
import { teacherActs } from '@/api/bank'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const tab = ref('files')
const files = ref([])
const acts = ref([])
const offline = ref([])
const cols = computed(() => tab.value === 'files'
  ? [{ field: 'title', label: 'العنوان' }, { field: 'typeLabel', label: 'النوع' }, { field: 'classLabel', label: 'التصنيف' }, { field: 'subjectName', label: 'المادة' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }]
  : [{ field: 'title', label: 'العنوان' }, { field: 'kindLabel', label: 'النوع' }, { field: 'count', label: 'الأسئلة' }, { field: 'subjectName', label: 'المادة' }, { field: 'at', label: 'أُنشئ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }])
async function load() {
  files.value = (await myUploads(auth.person.id)).map((u) => ({ ...u, typeLabel: cat.TYPE_LABEL[u.type], classLabel: classLabel(u.classification || u.proposedClass) + (u.classification ? '' : ' (مقترح)') }))
  offline.value = (await myOfflineUploads(auth.person.id)).map((t) => ({ ...t, semLabel: t.semester === 1 ? 'الأول' : 'الثاني' }))
  acts.value = (await listMyActivities(auth.person.id)).map((a) => ({ ...a, kindLabel: a.kind === 'quiz' ? 'اختبار' : 'واجب', count: a.questions?.length || '—', subjectName: cat.subjects.find((s) => s.id === a.subjectId)?.name }))
}
onMounted(load)
async function send(row) {
  await (tab.value === 'files' ? submitUpload(row.id) : submitActivity(row.id))
  toast.add({ severity: 'success', summary: 'أُرسل للمراجعة', life: 2000 })
  load()
}
async function del(row) {
  if (tab.value === 'files') await removeUpload(row.id)
  else teacherActs().remove(row.id)
  toast.add({ severity: 'info', summary: 'حُذف', life: 1800 })
  load()
}
</script>

<style scoped>
.legend { display: flex; flex-wrap: wrap; gap: 0.5rem 1.2rem; margin-bottom: 1rem; font-size: 0.82rem; }
.legend span { display: inline-flex; gap: 0.4rem; align-items: center; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.note { display: block; font-size: 0.78rem; margin-top: 0.15rem; color: #a15c00; }
.note.rejected { color: #b42318; }
</style>
