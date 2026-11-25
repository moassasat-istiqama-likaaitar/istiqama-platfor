<template>
  <!-- TE16: ملفاتي وأنشطتي — حالة كل ما رفعته أو أنشأته، وملاحظات المراجعة -->
  <div>
    <PageHeader title="ملفاتي وأنشطتي" subtitle="تابع حالة المحتوى الذي رفعته والأنشطة التي أنشأتها، وملاحظات المراجِع عند الرفض." />
    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'files' }" @click="tab = 'files'"><i class="pi pi-folder" /> المحتوى <span class="pill__count">{{ files.length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'acts' }" @click="tab = 'acts'"><i class="pi pi-pencil" /> الواجبات والاختبارات <span class="pill__count">{{ acts.length }}</span></button>
    </div>
    <RecordTable v-if="tab === 'files'" :rows="files" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' }, { field: 'targetLabel', label: 'الوجهة' },
      { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'subjectName']" :filters="[{ key: 'status', label: 'الحالة', options: [{ label: 'قيد المراجعة', value: 'review' }, { label: 'معتمد', value: 'approved' }, { label: 'مرفوض', value: 'rejected' }] }]" unit="ملف">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.note" class="note"><i class="pi pi-comment" /> {{ row.note }}</small></template>
      <template #actions="{ row }"><Button v-if="row.status !== 'approved'" icon="pi pi-trash" text rounded severity="danger" size="small" title="حذف" @click="del(row)" /></template>
      <template #toolbar><RouterLink to="/app/upload-content" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع محتوى</RouterLink></template>
    </RecordTable>
    <RecordTable v-else :rows="acts" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'kindLabel', label: 'النوع' }, { field: 'count', label: 'الأسئلة' }, { field: 'at', label: 'أُنشئ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title']" unit="نشاط" empty-text="لم تنشئ واجبات أو اختبارات بعد">
      <template #toolbar>
        <RouterLink to="/app/new-homework" class="p-button p-component p-button-sm p-button-outlined">واجب جديد</RouterLink>
        <RouterLink to="/app/quiz-builder" class="p-button p-component p-button-sm">اختبار جديد</RouterLink>
      </template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { myUploads, listMyActivities, removeUpload } from '@/api/teaching'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const tab = ref('files')
const files = ref([])
const acts = ref([])
async function load() {
  files.value = (await myUploads(auth.person.id)).map((u) => ({ ...u, typeLabel: cat.TYPE_LABEL[u.type], targetLabel: u.target === 'library' ? 'المكتبة المركزية' : 'أقسامي' }))
  acts.value = (await listMyActivities(auth.person.id)).map((a) => ({ ...a, kindLabel: a.kind === 'quiz' ? 'اختبار' : 'واجب', count: a.questions?.length || '—', status: a.status === 'published' ? 'published' : a.status }))
}
onMounted(load)
async function del(row) {
  await removeUpload(row.id)
  toast.add({ severity: 'info', summary: 'حُذف الملف', life: 2000 })
  load()
}
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.note { display: block; color: #b42318; font-size: 0.78rem; margin-top: 0.15rem; }
</style>
