<template>
  <!-- SU02: البلاغات — قائمة + محادثة البلاغ وحالته -->
  <div>
    <PageHeader title="البلاغات" :subtitle="SUBS[auth.role] || SUBS.admin" />
    <StatTiles :items="[
      { label: 'مفتوحة', value: rows.filter((r) => r.status === 'open').length, icon: 'pi pi-circle', tone: 'blue' },
      { label: 'قيد المعالجة', value: rows.filter((r) => r.status === 'in_progress').length, icon: 'pi pi-spinner', tone: 'amber' },
      { label: 'بانتظار المستخدم', value: rows.filter((r) => r.status === 'waiting').length, icon: 'pi pi-user', tone: 'purple' },
      { label: 'أولوية عالية', value: rows.filter((r) => r.priority === 'high' && r.status !== 'resolved').length, icon: 'pi pi-exclamation-triangle', tone: 'red' }
    ]" />
    <div class="tk">
      <RecordTable :rows="rows" :columns="[{ field: 'id', label: 'الرقم', width: '80px' }, { field: 'title', label: 'البلاغ' }, { field: 'typeLabel', label: 'النوع' }, { field: 'priorityLabel', label: 'الأولوية' }, { field: 'status', label: 'الحالة', type: 'status' }]" :search-keys="['title', 'person', 'id']" :filters="[{ key: 'status', label: 'الحالة', options: STATUS_OPTS }, { key: 'type', label: 'النوع', options: TYPE_OPTS }]" unit="بلاغ" :row-class="(r) => (cur?.id === r.id ? 'row-on' : '')" @row-click="open">
        <template #cell-title="{ row }"><b>{{ row.title }}</b><small class="muted d">{{ row.person }} · {{ row.school }} · {{ ago(row.at) }}</small></template>
        <template #cell-priorityLabel="{ row }"><span class="pr" :class="row.priority">{{ row.priorityLabel }}</span></template>
      </RecordTable>
      <aside v-if="cur" class="panel th">
        <header><div><small class="muted">{{ cur.id }} · {{ cur.typeLabel }}</small><h3>{{ cur.title }}</h3></div><Button icon="pi pi-times" text rounded @click="cur = null" /></header>
        <div class="meta">
          <span><i class="pi pi-user" /> {{ cur.person }} ({{ cur.role ? t('roles.' + cur.role) : '—' }})</span>
          <span><i class="pi pi-building" /> {{ cur.school }}</span>
          <span><i class="pi pi-user-edit" /> {{ cur.assignee || 'غير مسند' }}</span>
        </div>
        <div class="msgs">
          <div v-for="(m, i) in cur.thread" :key="i" class="m" :class="m.from"><b>{{ m.name }}</b><p>{{ m.body }}</p><small>{{ new Date(m.at).toLocaleString('ar-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</small></div>
        </div>
        <Textarea v-model="reply" rows="3" auto-resize fluid placeholder="اكتب ردّك…" />
        <div class="reply">
          <Select v-model="nextStatus" :options="STATUS_OPTS" option-label="label" option-value="value" placeholder="الحالة" />
          <Button label="إرسال" icon="pi pi-send" :disabled="!reply.trim() && nextStatus === cur.status" :loading="busy" @click="send" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import { useAuthStore } from '@/stores/auth'
import { listTickets, replyTicket } from '@/api/support'

const { t } = useI18n()
const auth = useAuthStore()
const SUBS = {
  support: 'الملاحظات التقنية ومشاكل الحسابات. بلاغات المحتوى تذهب إلى المحرر، والمقترحات إلى الإدارة العامة. ردّك يصل صاحب البلاغ كإشعار.',
  editor: 'بلاغات المحتوى الواردة من المستخدمين. ردّك يصل صاحب البلاغ كإشعار.',
  admin: 'كل البلاغات: التقنية، والمحتوى، والحسابات، والمقترحات. ردّك يصل صاحب البلاغ كإشعار.'
}
const toast = useToast()
const STATUS_OPTS = [{ label: 'مفتوح', value: 'open' }, { label: 'قيد المعالجة', value: 'in_progress' }, { label: 'بانتظار المستخدم', value: 'waiting' }, { label: 'تم الحل', value: 'resolved' }]
const TYPE_OPTS = [{ label: 'تقني', value: 'technical' }, { label: 'محتوى', value: 'content' }, { label: 'حساب', value: 'account' }, { label: 'مقترح', value: 'suggestion' }]
const rows = ref([])
const cur = ref(null)
const reply = ref('')
const nextStatus = ref(null)
const busy = ref(false)
const decorate = (r) => ({ ...r, typeLabel: TYPE_OPTS.find((x) => x.value === r.type)?.label || r.type, priorityLabel: { high: 'عالية', normal: 'عادية', low: 'منخفضة' }[r.priority] })
const load = async () => (rows.value = (await listTickets(auth.role)).map(decorate))
onMounted(load)
function open(r) {
  cur.value = r
  reply.value = ''
  nextStatus.value = r.status === 'open' ? 'in_progress' : r.status
}
async function send() {
  busy.value = true
  cur.value = decorate(await replyTicket(cur.value.id, auth.person, reply.value, nextStatus.value))
  reply.value = ''
  busy.value = false
  toast.add({ severity: 'success', summary: 'أُرسل الرد', detail: 'وصل صاحب البلاغ إشعار', life: 2200 })
  load()
}
const ago = (iso) => {
  const h = Math.round((Date.now() - new Date(iso)) / 36e5)
  return h < 1 ? 'الآن' : h < 24 ? `منذ ${h} سا` : `منذ ${Math.round(h / 24)} يوم`
}
</script>

<style scoped>
.tk { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; align-items: start; }
.tk:has(.th) { grid-template-columns: 1.3fr 1fr; }
.d { display: block; font-size: 0.76rem; }
:deep(.row-on) { background: color-mix(in srgb, var(--brand) 7%, #fff) !important; }
:deep(tbody tr) { cursor: pointer !important; }
.pr { font-size: 0.78rem; font-weight: 700; }
.pr.high { color: #b42318; } .pr.normal { color: #8a5a00; } .pr.low { color: #4b5565; }
.th { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 0.75rem; max-height: calc(100vh - 100px); }
.th header { display: flex; justify-content: space-between; gap: 0.5rem; }
.th h3 { margin: 0.15rem 0 0; font-size: 1.05rem; }
.meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: 0.82rem; color: var(--p-text-muted-color); }
.msgs { overflow: auto; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; min-height: 120px; }
.m { padding: 0.6rem 0.8rem; border-radius: 12px; background: var(--bg); max-width: 92%; }
.m.support { align-self: flex-end; background: color-mix(in srgb, var(--brand) 10%, #fff); }
.m b { font-size: 0.8rem; }
.m p { margin: 0.2rem 0; font-size: 0.9rem; }
.m small { font-size: 0.72rem; color: var(--p-text-muted-color); }
.reply { display: flex; justify-content: space-between; gap: 0.5rem; }
@media (max-width: 1000px) { .tk:has(.th) { grid-template-columns: minmax(0, 1fr); } .th { position: static; max-height: none; } }
</style>
