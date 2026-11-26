<template>
  <!-- AD18: الاستيراد والتصدير — تصدير البيانات وسجل العمليات -->
  <div>
    <PageHeader title="الاستيراد والتصدير" subtitle="صدّر بيانات المنصة إلى Excel، واطّلع على سجل عمليات الاستيراد والتصدير." />
    <div class="ex">
      <div v-for="e in EXPORTS" :key="e.key" class="panel card">
        <i :class="e.icon" />
        <b>{{ e.label }}</b>
        <small class="muted">{{ e.hint }}</small>
        <Button label="تصدير" icon="pi pi-download" size="small" outlined :loading="busy === e.key" @click="run(e)" />
      </div>
      <RouterLink to="/app/users-import" class="panel card imp"><i class="pi pi-file-import" /><b>استيراد جماعي</b><small class="muted">تلاميذ، معلمون، أولياء من Excel</small><span class="lnk">فتح <i class="pi pi-arrow-left flip" /></span></RouterLink>
    </div>
    <RecordTable :rows="jobs" :columns="[{ field: 'kindLabel', label: 'العملية' }, { field: 'file', label: 'الملف' }, { field: 'rows', label: 'الأسطر' }, { field: 'errors', label: 'الأخطاء' }, { field: 'by', label: 'بواسطة' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }]" unit="عملية" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { listJobs, addJob, listSchools, globalReport } from '@/api/admin'
import { listUsers } from '@/api/people'
import { exportCsv } from '@/utils/exportCsv'

const auth = useAuthStore()
const toast = useToast()
const EXPORTS = [
  { key: 'users', label: 'المستخدمون', hint: 'كل الأشخاص وأدوارهم', icon: 'pi pi-users' },
  { key: 'schools', label: 'المدارس', hint: 'المدارس ومديروها وأعدادها', icon: 'pi pi-building' },
  { key: 'performance', label: 'أداء المدارس', hint: 'التقدّم والمعدلات ونسبة الدخول', icon: 'pi pi-chart-bar' }
]
const jobs = ref([])
const busy = ref(null)
const load = async () => (jobs.value = (await listJobs()).map((j) => ({ ...j, kindLabel: j.kind === 'import' ? 'استيراد' : 'تصدير', status: 'done' })))
onMounted(load)
async function run(e) {
  busy.value = e.key
  let rows, cols
  if (e.key === 'users') {
    rows = await listUsers()
    cols = [{ field: 'name', label: 'الاسم' }, { field: 'roles', label: 'الأدوار' }, { field: 'schoolsLabel', label: 'المدارس' }, { field: 'phone', label: 'الهاتف' }, { field: 'status', label: 'الحالة' }]
  } else if (e.key === 'schools') {
    rows = await listSchools()
    cols = [{ field: 'code', label: 'الرمز' }, { field: 'name', label: 'المدرسة' }, { field: 'manager', label: 'المدير' }, { field: 'classes', label: 'الأقسام' }, { field: 'students', label: 'التلاميذ' }]
  } else {
    rows = (await globalReport()).schools
    cols = [{ field: 'name', label: 'المدرسة' }, { field: 'students', label: 'التلاميذ' }, { field: 'progress', label: 'التقدم %' }, { field: 'average', label: 'المعدل' }, { field: 'active', label: 'النشاط %' }]
  }
  const file = `${e.label}-${new Date().toISOString().slice(0, 10)}.csv`
  exportCsv(file, rows, cols)
  await addJob({ kind: 'export', entity: e.key, file, rows: rows.length, ok: rows.length, errors: 0 }, auth.person)
  busy.value = null
  toast.add({ severity: 'success', summary: `صُدّر ${rows.length} سطراً`, life: 2000 })
  load()
}
</script>

<style scoped>
.ex { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem; margin-bottom: 1rem; }
.card { display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start; }
.card > i { font-size: 1.5rem; color: var(--brand); }
.card .p-button { margin-top: 0.4rem; }
.imp { text-decoration: none; color: inherit; border: 1.5px dashed var(--brand); }
.lnk { color: var(--brand); font-weight: 700; font-size: 0.86rem; margin-top: 0.4rem; }
</style>
