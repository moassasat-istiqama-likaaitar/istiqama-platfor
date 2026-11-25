<template>
  <!-- AD06: سجل النشاطات -->
  <div>
    <PageHeader title="سجل النشاطات" subtitle="من فعل ماذا ومتى — للتدقيق والأمان. يُحفظ السجل 12 شهراً." />
    <RecordTable :rows="rows" :columns="[{ field: 'at', label: 'الوقت' }, { field: 'person', label: 'المستخدم' }, { field: 'roleLabel', label: 'الصفة' }, { field: 'school', label: 'المدرسة' }, { field: 'actionLabel', label: 'العملية' }, { field: 'device', label: 'الجهاز' }, { field: 'ip', label: 'العنوان' }]" :search-keys="['person', 'actionLabel', 'school']" :filters="[{ key: 'actionLabel', label: 'العملية', options: actions }, { key: 'roleLabel', label: 'الصفة', options: roles }]" :page-size="20" unit="عملية">
      <template #cell-at="{ row }">{{ new Date(row.at).toLocaleString('ar-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</template>
      <template #cell-ip="{ row }"><bdi dir="ltr">{{ row.ip }}</bdi></template>
      <template #toolbar><Button label="تصدير" icon="pi pi-download" size="small" outlined severity="secondary" @click="exportCsv('سجل-النشاطات.csv', rows, [{ field: 'at', label: 'الوقت' }, { field: 'person', label: 'المستخدم' }, { field: 'actionLabel', label: 'العملية' }, { field: 'ip', label: 'IP' }])" /></template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { activityLog } from '@/api/admin'
import { exportCsv } from '@/utils/exportCsv'

const { t } = useI18n()
const rows = ref([])
onMounted(async () => (rows.value = (await activityLog()).map((r) => ({ ...r, roleLabel: r.role ? t('roles.' + r.role) : '—' }))))
const uniq = (k) => [...new Set(rows.value.map((r) => r[k]))].map((v) => ({ label: v, value: v }))
const actions = computed(() => uniq('actionLabel'))
const roles = computed(() => uniq('roleLabel'))
</script>
