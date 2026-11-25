<template>
  <!-- SU03: الحوادث — أعطال عامة تمسّ عدداً كبيراً من المستخدمين، مع سجل تحديثات -->
  <div>
    <PageHeader title="الحوادث" subtitle="الأعطال العامة وحالتها. التحديثات تظهر للمستخدمين في شريط تنبيه أعلى المنصة." />
    <div class="bar"><Button label="تسجيل حادث" icon="pi pi-plus" size="small" severity="danger" @click="dlg = true" /></div>
    <div v-for="i in rows" :key="i.id" class="panel inc" :class="i.severity">
      <header><div><small class="muted">{{ i.id }} · {{ i.affected }}</small><h3>{{ i.title }}</h3></div><StatusTag :status="i.status" /></header>
      <ol class="tl"><li v-for="(u, k) in i.updates" :key="k"><small>{{ new Date(u.at).toLocaleString('ar-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</small><p>{{ u.text }}</p></li></ol>
      <div v-if="i.status !== 'resolved'" class="up">
        <InputText v-model="notes[i.id]" placeholder="تحديث جديد…" fluid />
        <Select v-model="st[i.id]" :options="STATUS" option-label="label" option-value="value" placeholder="الحالة" />
        <Button label="نشر التحديث" size="small" :disabled="!notes[i.id]" @click="update(i)" />
      </div>
    </div>
    <FormDialog v-model:visible="dlg" title="حادث جديد" :fields="[{ key: 'title', label: 'العنوان', required: true, full: true }, { key: 'affected', label: 'المتأثرون', required: true, placeholder: 'كل المدارس / خدمة معينة' }, { key: 'severity', label: 'الخطورة', type: 'select', options: [{ label: 'كبيرة', value: 'major' }, { label: 'صغيرة', value: 'minor' }], required: true }, { key: 'note', label: 'الوصف الأولي', type: 'textarea' }]" :value="{ severity: 'minor' }" @save="create" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { listIncidents, saveIncident, addIncidentUpdate } from '@/api/support'

const STATUS = [{ label: 'قيد التحقيق', value: 'investigating' }, { label: 'تحت المراقبة', value: 'monitoring' }, { label: 'تم الحل', value: 'resolved' }]
const rows = ref([])
const notes = reactive({})
const st = reactive({})
const dlg = ref(false)
const load = async () => (rows.value = await listIncidents())
onMounted(load)
async function update(i) {
  await addIncidentUpdate(i.id, notes[i.id], st[i.id])
  notes[i.id] = ''
  load()
}
async function create(v) {
  await saveIncident({ ...v, status: 'investigating' })
  dlg.value = false
  load()
}
</script>

<style scoped>
.bar { display: flex; justify-content: flex-end; margin-bottom: 0.75rem; }
.inc { margin-bottom: 0.85rem; border-inline-start: 5px solid #b8c0cc; }
.inc.major { border-inline-start-color: #e5484d; }
.inc.minor { border-inline-start-color: #f5a400; }
.inc header { display: flex; justify-content: space-between; align-items: flex-start; }
.inc h3 { margin: 0.15rem 0 0; font-size: 1.05rem; }
.tl { list-style: none; padding: 0; margin: 0.75rem 0; border-inline-start: 2px solid var(--line); }
.tl li { padding: 0 0.9rem 0.6rem; position: relative; }
.tl li::before { content: ''; position: absolute; inset-inline-start: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--brand); }
.tl small { font-size: 0.75rem; color: var(--p-text-muted-color); }
.tl p { margin: 0.1rem 0 0; font-size: 0.9rem; }
.up { display: flex; gap: 0.5rem; align-items: center; }
</style>
