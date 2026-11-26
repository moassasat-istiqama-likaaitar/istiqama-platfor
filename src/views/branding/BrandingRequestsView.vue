<template>
  <!-- AD19: طلبات هوية المدارس — اعتماد أو رفض -->
  <div>
    <PageHeader :title="t('menu.branding-requests')" subtitle="طلبات مديري المدارس لتعديل الشعار والألوان والغلاف. لا يظهر أي تعديل للتلاميذ قبل الاعتماد." />

    <Message v-if="!canDecide" severity="info" class="ro"><i class="pi pi-lock" /> الاعتماد والرفض من صلاحية المدير العام. يمكنك الاطلاع على الطلبات فقط.</Message>

    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'pending' }" @click="tab = 'pending'">بانتظار الاعتماد <span class="pill__count">{{ pending.length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'history' }" @click="tab = 'history'">السجل <span class="pill__count">{{ history.length }}</span></button>
    </div>

    <EmptyState v-if="!shown.length" icon="pi pi-verified" :title="tab === 'pending' ? 'لا توجد طلبات معلّقة' : 'لا يوجد سجل بعد'" text="" class="panel" />

    <article v-for="r in shown" :key="r.id" class="panel req">
      <header class="req__h">
        <div class="req__who">
          <SchoolLogo :school="r.school" :branding="r.data" :size="40" />
          <div>
            <strong>{{ r.school.name }}</strong>
            <small class="muted">{{ r.submittedBy }} · {{ fmt(r.submittedAt) }}</small>
          </div>
        </div>
        <Tag :value="STATUS[r.status].label" :severity="STATUS[r.status].sev" />
      </header>

      <div class="cmp">
        <div class="cmp__col">
          <h4>{{ r.status === 'approved' ? 'قبل' : 'المعتمدة حالياً' }}</h4>
          <SchoolBanner :school="r.school" :branding="r.status === 'approved' ? r.data : r.current" variant="compact" />
          <ColorChips v-if="r.status !== 'approved'" :b="r.current" />
        </div>
        <i class="pi pi-arrow-left cmp__arrow flip" />
        <div class="cmp__col">
          <h4>المقترحة</h4>
          <SchoolBanner :school="r.school" :branding="r.data" variant="compact" />
          <ColorChips :b="r.data" />
        </div>
      </div>

      <details class="more">
        <summary>معاينة داخل القوالب</summary>
        <div class="more__grid">
          <div v-for="m in ['kids', 'juniors', 'teens', 'login']" :key="m"><small>{{ MODE_LABELS[m] }}</small><BrandPreview :school="r.school" :branding="r.data" :mode="m" /></div>
        </div>
      </details>

      <p v-if="r.status === 'rejected'" class="note"><i class="pi pi-comment" /> سبب الرفض: {{ r.note }}</p>

      <footer v-if="r.status === 'pending' && canDecide" class="req__f">
        <Button label="رفض مع ملاحظة" icon="pi pi-times" severity="danger" outlined @click="openReject(r)" />
        <Button label="اعتماد ونشر" icon="pi pi-check" severity="success" :loading="busy === r.id" @click="approve(r)" />
      </footer>
    </article>

    <Dialog v-model:visible="rejectDlg" modal header="رفض الطلب" :style="{ width: 'min(480px, 94vw)' }">
      <p class="muted">اكتب للمدير ما يجب تعديله (مثال: الشعار غير واضح، اللون قريب من ألوان مدرسة أخرى…)</p>
      <Textarea v-model="note" rows="3" auto-resize fluid autofocus />
      <template #footer>
        <Button label="إلغاء" text severity="secondary" @click="rejectDlg = false" />
        <Button label="رفض" severity="danger" icon="pi pi-times" :loading="!!busy" :disabled="!note.trim()" @click="reject" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { isTop } from '@/config/roles'
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import BrandPreview from '@/components/brand/BrandPreview.vue'
import { useAuthStore } from '@/stores/auth'
import { listRequests, approveRequest, rejectRequest } from '@/api/branding'
import { contrast } from '@/utils/color'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const STATUS = { pending: { label: 'بانتظار الاعتماد', sev: 'warn' }, approved: { label: 'معتمد', sev: 'success' }, rejected: { label: 'مرفوض', sev: 'danger' } }
const MODE_LABELS = { kids: 'البراعم', juniors: 'المستكشفون', teens: 'الشباب', login: 'صفحة الدخول' }

// شارات الألوان مع مؤشر الوضوح
const ColorChips = (props) => {
  const r = contrast(props.b.primary, '#ffffff')
  return h('div', { class: 'chips' }, [
    h('span', { class: 'chip' }, [h('i', { style: { background: props.b.primary } }), h('bdi', { dir: 'ltr' }, props.b.primary)]),
    h('span', { class: 'chip' }, [h('i', { style: { background: props.b.secondary } }), h('bdi', { dir: 'ltr' }, props.b.secondary)]),
    h('span', { class: ['chip', r >= 3 ? 'ok' : 'warn'] }, `تباين ${r}`)
  ])
}
ColorChips.props = ['b']

const canDecide = computed(() => isTop(auth.role))
const all = ref([])
const tab = ref('pending')
const busy = ref(null)
const rejectDlg = ref(false)
const note = ref('')
const target = ref(null)

const pending = computed(() => all.value.filter((r) => r.status === 'pending'))
const history = computed(() => all.value.filter((r) => r.status !== 'pending'))
const shown = computed(() => (tab.value === 'pending' ? pending.value : history.value))

const load = async () => (all.value = await listRequests())
onMounted(load)

async function approve(r) {
  busy.value = r.id
  try {
    await approveRequest(r.id, auth.role)
    toast.add({ severity: 'success', summary: 'اعتُمدت الهوية', detail: `تظهر الآن لكل مستخدمي ${r.school.name}`, life: 3000 })
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  } finally {
    busy.value = null
  }
}
function openReject(r) {
  target.value = r
  note.value = ''
  rejectDlg.value = true
}
async function reject() {
  busy.value = target.value.id
  try {
    await rejectRequest(target.value.id, note.value, auth.role)
    rejectDlg.value = false
    toast.add({ severity: 'info', summary: 'رُفض الطلب', detail: 'سيرى المدير ملاحظتك', life: 3000 })
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  } finally {
    busy.value = null
  }
}
const fmt = (iso) => new Date(iso).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.ro { margin-bottom: 1rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.req { margin-bottom: 1rem; }
.req__h { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.req__who { display: flex; align-items: center; gap: 0.75rem; }
.req__who strong { display: block; }
.cmp { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; }
.cmp__col h4 { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--p-text-muted-color); }
.cmp__arrow { font-size: 1.3rem; color: var(--p-text-muted-color); }
.cmp :deep(.chips) { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.5rem; }
.cmp :deep(.chip) { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-family: monospace; padding: 0.15rem 0.55rem; border-radius: 999px; background: var(--bg); }
.cmp :deep(.chip i) { width: 12px; height: 12px; border-radius: 50%; }
.cmp :deep(.chip.ok) { color: #146c3c; font-family: inherit; }
.cmp :deep(.chip.warn) { color: #a15c00; font-family: inherit; }
.more { margin-top: 1rem; }
.more summary { cursor: pointer; font-weight: 700; color: var(--brand); font-size: 0.9rem; }
.more__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
.more__grid small { display: block; margin-bottom: 0.3rem; font-weight: 700; }
.note { margin: 0.75rem 0 0; color: #a12a2a; font-size: 0.9rem; }
.req__f { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--line); }
@media (max-width: 760px) {
  .cmp { grid-template-columns: 1fr; }
  .cmp__arrow { transform: rotate(-90deg); justify-self: center; }
}
</style>
