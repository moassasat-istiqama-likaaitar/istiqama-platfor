<template>
  <!-- SM05: تفعيل الحسابات — طلبات التسجيل في المدرسة -->
  <div>
    <PageHeader title="تفعيل الحسابات" subtitle="حسابات أُنشئت أو طلبت الانضمام إلى مدرستك وتنتظر التحقق والتفعيل." />
    <RecordTable v-model:selection="sel" :rows="rows" :loading="loading" :columns="[
      { field: 'name', label: 'الاسم', type: 'person', sub: 'phone' }, { field: 'roleLabel', label: 'الصفة' }, { field: 'detail', label: 'التفاصيل' }, { field: 'requestedAt', label: 'تاريخ الطلب', type: 'date' }
    ]" :search-keys="['name', 'detail']" :filters="[{ key: 'role', label: 'الصفة', options: [{ label: 'تلميذ', value: 'student' }, { label: 'ولي', value: 'parent' }, { label: 'معلم', value: 'teacher' }] }]" selectable unit="طلب" empty-text="لا طلبات تفعيل — كل الحسابات مفعّلة">
      <template #toolbar>
        <Button :label="`تفعيل المحدد (${sel.length})`" icon="pi pi-check" size="small" severity="success" :disabled="!sel.length" @click="act(sel, 'active')" />
      </template>
      <template #actions="{ row }">
        <Button icon="pi pi-check" text rounded severity="success" size="small" title="تفعيل" @click="act([row], 'active')" />
        <Button icon="pi pi-times" text rounded severity="danger" size="small" title="رفض" @click="act([row], 'archived')" />
      </template>
    </RecordTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { pendingAccounts } from '@/api/school'
import { setStatus } from '@/api/people'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const rows = ref([])
const sel = ref([])
const loading = ref(true)
async function load() {
  loading.value = true
  rows.value = (await pendingAccounts(auth.active.school.id)).map((r) => ({ ...r, roleLabel: t('roles.' + r.role) }))
  sel.value = []
  loading.value = false
}
onMounted(load)
async function act(list, status) {
  await setStatus(list.map((r) => r.id), status)
  toast.add({ severity: status === 'active' ? 'success' : 'info', summary: status === 'active' ? `فُعّل ${list.length} حساب — وصلتهم رسالة بمعلومات الدخول` : 'رُفض الطلب', life: 2800 })
  load()
}
</script>
