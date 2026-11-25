<template>
  <!-- TE04/TE05: مكتبة القسم — ما يراه تلاميذي: محتوى المكتبة المركزية المعتمد + ما رفعته أنا -->
  <div>
    <PageHeader title="مكتبة القسم" subtitle="المحتوى الذي يصل تلاميذ أقسامك. أضف من المكتبة المركزية أو ارفع محتواك الخاص." />
    <RecordTable :rows="rows" :loading="loading" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' },
      { field: 'levelName', label: 'المستوى' }, { field: 'sourceLabel', label: 'المصدر' }, { field: 'status', label: 'الحالة', type: 'status' }, { field: 'views', label: 'مشاهدات' }
    ]" :search-keys="['title', 'lessonTitle', 'subjectName']" :filters="[
      { key: 'source', label: 'المصدر', options: [{ label: 'المكتبة المركزية', value: 'central' }, { label: 'محتواي', value: 'mine' }] },
      { key: 'type', label: 'النوع', options: cat.TYPE_OPTIONS }
    ]" unit="محتوى">
      <template #toolbar>
        <RouterLink to="/app/central-library" class="p-button p-component p-button-outlined p-button-sm"><i class="pi pi-search" />&nbsp;من المكتبة المركزية</RouterLink>
        <RouterLink to="/app/upload-content" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع محتوى</RouterLink>
      </template>
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.lessonTitle" class="muted d"> {{ row.lessonTitle }}</small></template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { classLibrary } from '@/api/teaching'

const auth = useAuthStore()
const cat = useCatalog()
const rows = ref([])
const loading = ref(true)
onMounted(async () => {
  rows.value = (await classLibrary(auth.active.classIds || [])).map((r) => ({ ...r, typeLabel: cat.TYPE_LABEL[r.type] || r.type, sourceLabel: r.source === 'mine' ? 'محتواي' : 'المكتبة المركزية' }))
  loading.value = false
})
</script>

<style scoped>
.d { display: block; font-size: 0.78rem; }
</style>
