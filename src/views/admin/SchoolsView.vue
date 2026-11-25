<template>
  <!-- AD07: المدارس -->
  <div>
    <PageHeader title="المدارس" subtitle="المدارس المنضوية في المنصة، رابط دخول كل مدرسة، ومديرها وهويتها." />
    <RecordTable :rows="rows" :columns="[
      { field: 'code', label: 'الرمز', width: '70px' }, { field: 'name', label: 'المدرسة' }, { field: 'genderLabel', label: 'النوع' }, { field: 'manager', label: 'المدير' },
      { field: 'classes', label: 'الأقسام' }, { field: 'students', label: 'التلاميذ' }, { field: 'loginUrl', label: 'رابط الدخول' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['name', 'commune', 'manager']" :filters="[{ key: 'gender', label: 'النوع', options: [{ label: 'مختلطة', value: 'mixed' }, { label: 'ذكور', value: 'male' }, { label: 'إناث', value: 'female' }] }]" unit="مدرسة" :page-size="15">
      <template #toolbar><Button label="مدرسة جديدة" icon="pi pi-plus" size="small" @click="open()" /></template>
      <template #cell-name="{ row }"><span class="sc"><SchoolLogo :school="row" :branding="branding[row.id]" :size="28" /><span><b>{{ row.short }}</b><small class="muted"> {{ row.commune }}</small></span></span></template>
      <template #cell-loginUrl="{ row }"><RouterLink :to="`/s/${row.slug}`" target="_blank" class="lnk" dir="ltr">{{ row.loginUrl }}</RouterLink></template>
      <template #actions="{ row }"><Button icon="pi pi-pencil" text rounded size="small" @click="open(row)" /></template>
    </RecordTable>
    <FormDialog v-model:visible="dlg" :title="cur ? 'تعديل المدرسة' : 'مدرسة جديدة'" :fields="fields" :value="cur || { gender: 'mixed', status: 'active' }" @save="save" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import { listSchools, saveSchool } from '@/api/admin'
import { schoolBranding as branding } from '@/mock/db'

const toast = useToast()
const rows = ref([])
const dlg = ref(false)
const cur = ref(null)
const fields = [
  { key: 'name', label: 'اسم المدرسة', required: true, full: true, placeholder: 'مثال: النور القرآنية - برج البحري', hint: 'الاسم ثم « - » ثم البلدية' },
  { key: 'code', label: 'الرمز' }, { key: 'slug', label: 'رابط الدخول', ltr: true, placeholder: 'nour', hint: 'يصبح الرابط: #/s/nour' },
  { key: 'gender', label: 'النوع', type: 'select', options: [{ label: 'مختلطة', value: 'mixed' }, { label: 'ذكور', value: 'male' }, { label: 'إناث', value: 'female' }] },
  { key: 'status', label: 'الحالة', type: 'select', options: [{ label: 'مفعّلة', value: 'active' }, { label: 'موقوفة', value: 'suspended' }] }
]
const load = async () => (rows.value = await listSchools())
onMounted(load)
function open(row = null) {
  cur.value = row ? { ...row } : null
  dlg.value = true
}
async function save(v) {
  try {
    await saveSchool({ ...v, id: cur.value?.id })
    toast.add({ severity: 'success', summary: 'حُفظت المدرسة', life: 2000 })
    dlg.value = false
    load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  }
}
</script>

<style scoped>
.sc { display: inline-flex; align-items: center; gap: 0.5rem; }
.lnk { color: var(--brand); text-decoration: none; font-size: 0.85rem; }
</style>
