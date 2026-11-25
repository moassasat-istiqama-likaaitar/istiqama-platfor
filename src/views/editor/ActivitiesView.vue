<template>
  <!-- ED05: الأنشطة — اختبارات وواجبات المنصة والمعلمين -->
  <div>
    <PageHeader title="الأنشطة" subtitle="كل اختبارات وواجبات المنصة: المعتمدة في المكتبة وما أنشأه المعلمون." />
    <RecordTable :rows="rows" :columns="[
      { field: 'title', label: 'النشاط' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' }, { field: 'levelName', label: 'المستوى' },
      { field: 'count', label: 'الأسئلة' }, { field: 'authorName', label: 'المؤلف' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'lessonTitle', 'authorName']" :filters="[
      { key: 'type', label: 'النوع', options: [{ label: 'اختبار', value: 'quiz' }, { label: 'واجب', value: 'homework' }] },
      { key: 'levelName', label: 'المستوى', options: levelOpts },
      { key: 'subjectName', label: 'المادة', options: cat.subjectNames }
    ]" unit="نشاط">
      <template #toolbar><RouterLink to="/app/quiz-builder" class="p-button p-component p-button-sm"><i class="pi pi-plus" />&nbsp;اختبار جديد</RouterLink></template>
      <template #actions="{ row }"><Button icon="pi pi-eye" text rounded size="small" @click="cur = row" /></template>
    </RecordTable>
    <Dialog :visible="!!cur" modal :header="cur?.title" :style="{ width: 'min(640px, 95vw)' }" @update:visible="cur = null">
      <div v-if="cur">
        <p class="muted">{{ cur.subjectName }} · {{ cur.levelName }} · {{ cur.lessonTitle }}</p>
        <p v-if="cur.instructions" class="ins">{{ cur.instructions }}</p>
        <ol class="qs"><li v-for="(q, i) in cur.questions" :key="i"><b>{{ q.q }}</b><span v-for="(o, oi) in q.options" :key="oi" :class="{ right: q.answer === oi }">{{ o }}</span></li></ol>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useCatalog } from '@/composables/useCatalog'
import { listActivities } from '@/api/editorial'

const cat = useCatalog()
const rows = ref([])
const cur = ref(null)
onMounted(async () => (rows.value = (await listActivities()).map((a) => ({ ...a, typeLabel: a.type === 'quiz' ? 'اختبار' : 'واجب' }))))
const levelOpts = computed(() => [...new Set(rows.value.map((r) => r.levelName).filter(Boolean))].map((v) => ({ label: v, value: v })))
</script>

<style scoped>
.ins { background: var(--bg); padding: 0.75rem; border-radius: 10px; }
.qs { padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.7rem; }
.qs b { display: block; margin-bottom: 0.3rem; }
.qs span { display: inline-block; margin: 0.15rem; padding: 0.2rem 0.6rem; border: 1px solid var(--line); border-radius: 8px; font-size: 0.85rem; }
.qs span.right { border-color: #17a077; background: #f0fbf6; }
</style>
