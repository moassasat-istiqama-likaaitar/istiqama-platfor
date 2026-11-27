<template>
  <!-- AD16: إعدادات التواصل — من يراسل من، متى، وبأي قناة -->
  <div v-if="f">
    <PageHeader title="إعدادات التواصل" subtitle="قواعد المراسلة داخل المنصة، أوقاتها، قنوات الإشعار، والرقابة." />
    <div class="cm">
      <section class="panel full">
        <h3>مصفوفة المراسلة: من يراسل من</h3>
        <p class="muted small">الصفوف = المرسِل، الأعمدة = المستقبِل. تفعّل الإدارة العامة أي خانة بنطاقها. الخانات المعلَّمة <i class="pi pi-exclamation-triangle warn" /> تخصّ القاصرين: يُنصح بإبقائها مغلقة.</p>
        <div class="mx-wrap">
          <table class="mx">
            <thead><tr><th>المرسِل ↓ / المستقبِل ←</th><th v-for="c in MSG_ROLES" :key="c.key">{{ c.label }}</th></tr></thead>
            <tbody>
              <tr v-for="r in MSG_ROLES" :key="r.key">
                <th>{{ r.label }}</th>
                <td v-for="c in MSG_ROLES" :key="c.key" :class="['cell', f.matrix[r.key][c.key], { warnc: sensitive(r.key, c.key) && f.matrix[r.key][c.key] !== 'off' }]">
                  <select v-model="f.matrix[r.key][c.key]" :aria-label="`${r.label} ← ${c.label}`">
                    <option v-for="sc in SCOPES" :key="sc.value" :value="sc.value">{{ sc.label }}</option>
                  </select>
                  <i v-if="sensitive(r.key, c.key)" class="pi pi-exclamation-triangle warn" title="خانة تخصّ القاصرين" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button label="استعادة القواعد الافتراضية" icon="pi pi-undo" text size="small" @click="f.matrix = JSON.parse(JSON.stringify(DEFAULT_MATRIX))" />
      </section>
      <section class="panel">
        <h3>أوقات المراسلة</h3>
        <label class="row"><ToggleSwitch v-model="f.hours.enabled" /><div><b>تقييد الرسائل بأوقات محددة</b><small class="muted">خارج الأوقات تُحفظ الرسالة وتُرسل لاحقاً</small></div></label>
        <div v-if="f.hours.enabled" class="hours"><label>من <InputText v-model="f.hours.from" type="time" /></label><label>إلى <InputText v-model="f.hours.to" type="time" /></label></div>
        <h3 class="mt">قنوات الإشعار</h3>
        <label v-for="c in CHANNELS" :key="c.key" class="row"><ToggleSwitch v-model="f.channels[c.key]" /><div><b>{{ c.label }}</b><small class="muted">{{ c.hint }}</small></div></label>
      </section>
      <section class="panel">
        <h3>الرقابة والحماية</h3>
        <label class="row"><ToggleSwitch v-model="f.moderation.badWords" /><div><b>تصفية الألفاظ غير اللائقة</b><small class="muted">في الرسائل والتعليقات</small></div></label>
        <label class="row"><ToggleSwitch v-model="f.moderation.attachmentsStudents" /><div><b>السماح للتلاميذ بإرسال مرفقات في الرسائل</b><small class="muted">التسليمات غير معنية</small></div></label>
        <label class="row"><span class="num">الحجم الأقصى للمرفق</span><InputNumber v-model="f.moderation.maxFileMb" :min="1" :max="100" suffix=" MB" /></label>
      </section>
    </div>
    <div class="act"><Button label="حفظ الإعدادات" icon="pi pi-check" :loading="busy" @click="save" /></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { getCommunication, saveCommunication } from '@/api/admin'
import { MSG_ROLES, SCOPES, DEFAULT_MATRIX, sensitive } from '@/config/messaging'

const toast = useToast()
const CHANNELS = [
  { key: 'inapp', label: 'داخل المنصة', hint: 'جرس الإشعارات' }, { key: 'push', label: 'إشعارات الهاتف', hint: 'عند تثبيت التطبيق' },
  { key: 'email', label: 'البريد الإلكتروني', hint: 'للمعلمين والأولياء' }, { key: 'sms', label: 'الرسائل القصيرة SMS', hint: 'بتكلفة — للتنبيهات المهمة فقط' }
]
const f = ref(null)
const busy = ref(false)
onMounted(async () => (f.value = await getCommunication()))
async function save() {
  busy.value = true
  await saveCommunication(f.value)
  busy.value = false
  toast.add({ severity: 'success', summary: 'حُفظت إعدادات التواصل', life: 2000 })
}
</script>

<style scoped>
.full { grid-column: 1 / -1; }
.small { font-size: 0.82rem; }
.warn { color: #c27c00; }
.mx-wrap { overflow-x: auto; }
.mx { border-collapse: separate; border-spacing: 4px; font-size: 0.84rem; }
.mx th { font-weight: 700; padding: 0.3rem 0.5rem; white-space: nowrap; text-align: start; }
.mx .cell { border-radius: 10px; padding: 0.25rem 0.35rem; white-space: nowrap; }
.mx .cell select { border: 0; background: transparent; font: inherit; font-size: 0.8rem; cursor: pointer; color: inherit; }
.mx .cell.off { background: #f1f2f5; color: #8a8f99; }
.mx .cell.class { background: #e6f2ff; color: #1d5fa8; }
.mx .cell.school { background: #e5f6ee; color: #17733f; }
.mx .cell.all { background: #f3ecff; color: #6a3fb5; }
.mx .cell.warnc { outline: 2px solid #e0a100; }
.cm { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; align-items: start; }
.cm h3 { margin: 0 0 0.75rem; font-size: 1rem; }
.mt { margin-top: 1.25rem !important; }
.row { display: flex; gap: 0.7rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px dashed var(--line); }
.row b { display: block; font-size: 0.88rem; font-weight: 600; }
.row small { font-size: 0.76rem; }
.num { font-size: 0.88rem; flex: 1; }
.hours { display: flex; flex-wrap: wrap; gap: 0.6rem 1rem; padding: 0.5rem 0; }
.hours label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
.act { display: flex; justify-content: flex-end; margin-top: 1rem; }
@media (max-width: 1100px) { .cm { grid-template-columns: minmax(0, 1fr); } }
</style>
