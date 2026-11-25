<template>
  <!-- SM10 / AD14: الإشعارات والإعلانات — رسالة لفئة محددة (أولياء/تلاميذ/معلمين، كل المدرسة أو أقسام بعينها) -->
  <div>
    <PageHeader :title="scope === 'all' ? 'الإعلانات العامة' : 'إشعار للمدرسة'" :subtitle="scope === 'all' ? 'إعلانات تصل كل المدارس أو مدارس محددة.' : 'أرسل إشعاراً لفئة من مدرستك. يظهر في جرس الإشعارات وفي رئيسية المعنيين.'" />
    <div class="nt">
      <form class="panel nt__form" @submit.prevent="send">
        <label class="fl"><span>العنوان *</span><InputText v-model="f.title" fluid /></label>
        <label class="fl"><span>النص *</span><Textarea v-model="f.body" rows="5" auto-resize fluid /></label>
        <div class="fl"><span>الفئة المستهدفة *</span>
          <div class="aud"><label v-for="a in AUD" :key="a.value" :class="{ on: f.audience.includes(a.value) }"><Checkbox v-model="f.audience" :value="a.value" /> <i :class="a.icon" /> {{ a.label }}</label></div>
        </div>
        <label v-if="scope === 'school'" class="fl"><span>الأقسام (اتركها فارغة لكل المدرسة)</span><MultiSelect v-model="f.classIds" :options="classOpts" option-label="label" option-value="value" display="chip" fluid /></label>
        <label v-else class="fl"><span>المدارس (اتركها فارغة لكل المدارس)</span><MultiSelect v-model="f.schoolIds" :options="cat.schoolOptions" option-label="label" option-value="value" display="chip" filter fluid /></label>
        <label class="fl"><span>جدولة الإرسال (اختياري)</span><InputText v-model="f.schedule" type="datetime-local" fluid /></label>
        <div class="foot">
          <span class="muted"><i class="pi pi-users" /> يصل إلى نحو <b>{{ reach }}</b> شخص</span>
          <Button type="submit" :label="f.schedule ? 'جدولة' : 'إرسال الآن'" icon="pi pi-send" :loading="busy" />
        </div>
      </form>
      <section>
        <h3 class="sec">المرسلة سابقاً</h3>
        <div v-for="n in list" :key="n.id" class="panel item">
          <div class="item__h"><b>{{ n.title }}</b><StatusTag :status="n.status" /></div>
          <p>{{ n.body }}</p>
          <small class="muted">{{ new Date(n.at).toLocaleString('ar-DZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }} · {{ n.audience.map((a) => AUD.find((x) => x.value === a)?.label).join('، ') }}<template v-if="n.reach"> · {{ n.reach }} مستلم</template></small>
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" class="del" @click="del(n)" />
        </div>
        <p v-if="!list.length" class="muted">لا إشعارات بعد.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { listNotices, createNotice, removeNotice, estimateReach } from '@/api/school'

const props = defineProps({ scope: { type: String, default: 'school' } })
const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const AUD = [{ value: 'parents', label: 'الأولياء', icon: 'pi pi-heart' }, { value: 'students', label: 'التلاميذ', icon: 'pi pi-book' }, { value: 'teachers', label: 'المعلمون', icon: 'pi pi-graduation-cap' }]
const blank = () => ({ title: '', body: '', audience: ['parents'], classIds: [], schoolIds: [], schedule: '' })
const f = reactive(blank())
const list = ref([])
const busy = ref(false)
const sid = computed(() => (props.scope === 'school' ? auth.active.school?.id : 'all'))
const classOpts = computed(() => cat.classOptions().filter((c) => cat.classes.find((x) => x.id === c.value)?.schoolId === sid.value))
const reach = computed(() => (props.scope === 'school' ? estimateReach(sid.value, f.audience, f.classIds) : (f.schoolIds.length ? f.schoolIds : cat.schools.map((s) => s.id)).reduce((n, id) => n + estimateReach(id, f.audience, []), 0)))
const load = async () => (list.value = await listNotices(sid.value))
onMounted(load)
async function send() {
  busy.value = true
  try {
    await createNotice(sid.value, auth.person, { ...f })
    toast.add({ severity: 'success', summary: f.schedule ? 'جُدول الإشعار' : 'أُرسل الإشعار', detail: `إلى نحو ${reach.value} شخص`, life: 2600 })
    Object.assign(f, blank())
    load()
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = false
  }
}
async function del(n) {
  await removeNotice(n.id)
  load()
}
</script>

<style scoped>
.nt { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; align-items: start; }
.nt__form { display: flex; flex-direction: column; gap: 0.9rem; }
.fl { display: flex; flex-direction: column; gap: 0.35rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.aud { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.aud label { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.8rem; border: 1.5px solid var(--line); border-radius: 10px; cursor: pointer; }
.aud label.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 6%, #fff); }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.sec { font-size: 1rem; margin: 0 0 0.6rem; }
.item { position: relative; margin-bottom: 0.6rem; }
.item__h { display: flex; justify-content: space-between; gap: 0.5rem; padding-inline-end: 2rem; }
.item p { margin: 0.4rem 0; font-size: 0.9rem; line-height: 1.7; }
.item small { font-size: 0.78rem; }
.del { position: absolute; top: 0.5rem; inset-inline-end: 0.4rem; }
@media (max-width: 900px) { .nt { grid-template-columns: 1fr; } }
</style>
