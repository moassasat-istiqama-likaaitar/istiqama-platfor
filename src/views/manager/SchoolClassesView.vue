<template>
  <!-- SM06 / AD10: الأقسام — إنشاء الأقسام وإسناد المعلمين -->
  <div>
    <PageHeader :title="scope === 'all' ? 'الأقسام في كل المدارس' : 'أقسام المدرسة'" subtitle="إنشاء الأقسام لكل مستوى، وإسناد المعلمين لكل قسم." />
    <RecordTable :rows="rows" :loading="loading" :columns="cols" :search-keys="['name', 'teachersLabel', 'schoolName']" :filters="filters" unit="قسم">
      <template #toolbar><Button v-if="scope === 'school'" label="قسم جديد" icon="pi pi-plus" size="small" @click="openForm()" /></template>
      <template #actions="{ row }"><Button icon="pi pi-pencil" text rounded size="small" @click="openForm(row)" /></template>
    </RecordTable>
    <FormDialog v-model:visible="dlg" :title="edit ? `تعديل: ${edit.name}` : 'قسم جديد'" :fields="fields" :value="val" @save="save" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { listClasses } from '@/api/people'
import { createClass, updateClass, teacherOptions, classTeacherIds } from '@/api/school'

const props = defineProps({ scope: { type: String, default: 'school' } })
const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const rows = ref([])
const loading = ref(true)
const dlg = ref(false)
const edit = ref(null)
const val = ref({})
const tOpts = ref([])
const schoolId = computed(() => (props.scope === 'school' ? auth.active.school?.id : null))
const cols = computed(() => [
  { field: 'name', label: 'القسم' }, ...(props.scope === 'all' ? [{ field: 'schoolName', label: 'المدرسة' }] : []), { field: 'levelName', label: 'المستوى' }, { field: 'genderLabel', label: 'النوع' },
  { field: 'students', label: 'التلاميذ' }, { field: 'teachersLabel', label: 'المعلمون' }, { field: 'progress', label: 'التقدّم', type: 'progress' }
])
const filters = computed(() => [
  { key: 'levelName', label: 'المستوى', options: [...new Set(rows.value.map((r) => r.levelName))].map((v) => ({ label: v, value: v })) },
  ...(props.scope === 'all' ? [{ key: 'schoolName', label: 'المدرسة', options: cat.schools.map((s) => ({ label: s.name, value: s.name })) }] : [])
])
const fields = computed(() => [
  { key: 'name', label: 'اسم القسم', required: true, placeholder: 'مثال: الرابعة ابتدائي ب' },
  { key: 'levelId', label: 'المستوى', type: 'select', options: cat.levelOptions, required: true },
  { key: 'gender', label: 'النوع', type: 'select', options: [{ label: 'مختلط', value: 'mixed' }, { label: 'ذكور', value: 'male' }, { label: 'إناث', value: 'female' }], required: true },
  { key: 'teacherIds', label: 'المعلمون', type: 'multi', options: tOpts.value, full: true }
])
async function load() {
  loading.value = true
  rows.value = await listClasses({ schoolId: schoolId.value })
  if (schoolId.value) tOpts.value = await teacherOptions(schoolId.value)
  loading.value = false
}
onMounted(load)
async function openForm(row = null) {
  edit.value = row
  if (row && !schoolId.value) tOpts.value = await teacherOptions(row.schoolId)
  val.value = row ? { name: row.name, levelId: row.levelId, gender: row.gender, teacherIds: classTeacherIds(row.id) } : { gender: 'mixed', teacherIds: [] }
  dlg.value = true
}
async function save(v) {
  try {
    if (edit.value) await updateClass(edit.value.id, v)
    else await createClass(schoolId.value, v)
    toast.add({ severity: 'success', summary: edit.value ? 'حُفظ القسم' : 'أُنشئ القسم', life: 2000 })
    dlg.value = false
    load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  }
}
</script>
