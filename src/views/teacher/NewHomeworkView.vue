<template>
  <!-- TE14: واجب منزلي جديد — مع معاينة كما يراه التلميذ -->
  <div>
    <PageHeader title="واجب منزلي جديد" subtitle="يصل الواجب لتلاميذ الأقسام المختارة ويظهر في «أعمالي» ومخطط الأسبوع عندهم، ويُشعَر أولياؤهم." />
    <div class="hw">
      <form class="panel hw__form" @submit.prevent="submit(true)">
        <label class="fl full"><span>عنوان الواجب *</span><InputText v-model="f.title" fluid placeholder="مثال: تمارين التاء المربوطة" /></label>
        <label class="fl"><span>{{ tg.isEditor.value ? 'أين يُنشر؟ *' : 'الأقسام *' }}</span><MultiSelect v-model="f.targets" :options="tg.options()" option-label="label" option-value="value" display="chip" fluid /></label>
        <label class="fl"><span>المادة *</span><Select v-model="f.subjectId" :options="cat.subjectOptions(levelId)" option-label="label" option-value="value" fluid :disabled="!levelId" /></label>
        <label class="fl"><span>الدرس المرتبط</span><Select v-model="f.lessonId" :options="[{ label: '— بلا درس —', value: null }, ...cat.lessonOptions(f.subjectId)]" option-label="label" option-value="value" filter fluid :disabled="!f.subjectId" /></label>
        <label class="fl"><span>آخر أجل *</span><InputText v-model="f.due" type="datetime-local" fluid /></label>
        <label class="fl full"><span>التعليمات *</span><Textarea v-model="f.instructions" rows="4" auto-resize fluid placeholder="ماذا يجب أن ينجز التلميذ؟ وكيف يسلّم (نص، صورة الكراس…)" /></label>
        <label class="fl"><span>العلامة القصوى</span><InputNumber v-model="f.maxScore" :min="1" :max="100" fluid /></label>
        <label class="fl"><span>طريقة التسليم</span><Select v-model="f.mode" :options="[{ label: 'نص أو صورة', value: 'any' }, { label: 'صورة الكراس فقط', value: 'photo' }, { label: 'نص فقط', value: 'text' }, { label: 'بلا تسليم (للمتابعة)', value: 'none' }]" option-label="label" option-value="value" fluid /></label>
        <label class="fl full sw"><ToggleSwitch v-model="f.required" /> <span>واجب إجباري (يُحتسب في التقرير)</span></label>
        <label class="fl full sw"><ToggleSwitch v-model="f.notifyParents" /> <span>إشعار الأولياء</span></label>
        <label v-if="!tg.isEditor.value" class="fl full sw"><ToggleSwitch v-model="toCentral" /> <span>إرساله للمكتبة المركزية (بنك الأنشطة)</span></label>
        <div class="full actions">
          <Button label="حفظ كمسودة" severity="secondary" text @click="submit(false)" />
          <Button type="submit" label="نشر الواجب" icon="pi pi-send" :loading="busy" :disabled="!valid" />
        </div>
      </form>

      <aside class="preview">
        <small class="muted">معاينة كما يراه التلميذ</small>
        <div class="panel pv">
          <span class="chip"><i class="pi pi-pencil" /> واجب</span>
          <h3>{{ f.title || 'عنوان الواجب' }}</h3>
          <p class="muted">{{ subjectName || 'المادة' }}<template v-if="f.due"> · آخر أجل {{ new Date(f.due).toLocaleString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }}</template></p>
          <p class="ins">{{ f.instructions || 'التعليمات تظهر هنا…' }}</p>
          <div class="fake">{{ f.mode === 'none' ? 'لا يُطلب تسليم' : f.mode === 'photo' ? '📷 أرفق صورة كراسك' : f.mode === 'text' ? '✍️ اكتب إجابتك' : '✍️ اكتب إجابتك أو 📷 أرفق صورة' }}</div>
        </div>
        <h4 class="sec">واجباتي المنشورة</h4>
        <ul class="mine">
          <li v-for="a in mine.filter((x) => x.kind === 'homework').slice(0, 5)" :key="a.id"><b>{{ a.title }}</b><StatusTag :status="a.status" /></li>
          <li v-if="!mine.length" class="muted">لا شيء بعد.</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { createActivity, listMyActivities } from '@/api/teaching'
import { useTargets } from '@/composables/useTargets'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const tg = useTargets()
const toCentral = ref(true)
const blank = () => ({ title: '', targets: tg.options().slice(0, 1).map((o) => o.value), subjectId: null, lessonId: null, due: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16), instructions: '', maxScore: 20, mode: 'any', required: true, notifyParents: true })
const f = reactive(blank())
const busy = ref(false)
const mine = ref([])
const levelId = computed(() => tg.levelOf(f.targets[0]))
const subjectName = computed(() => cat.subjects.find((s) => s.id === f.subjectId)?.name)
const valid = computed(() => f.title.trim() && f.targets.length && f.subjectId && f.due && f.instructions.trim())
const load = async () => (mine.value = await listMyActivities(auth.person.id))
onMounted(load)
async function submit(publish) {
  if (publish && !valid.value) return
  busy.value = true
  const { targets, due, ...data } = JSON.parse(JSON.stringify(f))
  const r = await createActivity(auth.person, { ...data, kind: 'homework', levelId: levelId.value }, { targets: publish ? tg.decode(targets) : [], due, submit: publish && toCentral.value, byRole: auth.role })
  busy.value = false
  toast.add({ severity: 'success', summary: !publish ? 'حُفظت المسودة' : `نُشر الواجب في ${r.reached} قسم`, detail: !publish ? '' : 'وصل التلاميذ وأولياءهم إشعار', life: 3000 })
  Object.assign(f, blank())
  load()
}
</script>

<style scoped>
.hw { display: grid; grid-template-columns: 3fr 2fr; gap: 1rem; align-items: start; }
.hw__form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1rem; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.fl.sw { flex-direction: row; align-items: center; gap: 0.6rem; }
.fl.sw > span { font-weight: 500; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.preview { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 0.5rem; }
.pv h3 { margin: 0.5rem 0 0.2rem; }
.pv p { margin: 0; }
.ins { margin: 0.75rem 0 !important; white-space: pre-wrap; line-height: 1.8; }
.fake { border: 2px dashed var(--line); border-radius: 12px; padding: 0.9rem; text-align: center; color: var(--p-text-muted-color); }
.sec { font-size: 0.95rem; margin: 0.75rem 0 0.4rem; }
.mine { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
.mine li { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.86rem; }
@media (max-width: 960px) { .hw { grid-template-columns: 1fr; } .preview { position: static; } }
</style>
