<template>
  <!-- TE17: الاختبارات الحضورية — ورقة اختبار مطبوعة بشعار المؤسسة والمدرسة، من بنك الأسئلة أو أسئلة حرة -->
  <div>
    <PageHeader title="الاختبارات الحضورية" subtitle="جهّز ورقة اختبار للقسم وتُطبع بترويسة المؤسسة والمدرسة، مع ورقة الإجابات للمعلم." />
    <div class="ot">
      <section class="panel">
        <h3 class="sec">أوراقي</h3>
        <ul class="papers">
          <li v-for="p in papers" :key="p.id" :class="{ on: p.id === f.id }" @click="edit(p)"><b>{{ p.title }}</b><small class="muted">{{ p.className }} · {{ p.items.length }} أسئلة</small></li>
          <li v-if="!papers.length" class="muted">لا أوراق بعد.</li>
        </ul>
        <Button label="ورقة جديدة" icon="pi pi-plus" text @click="reset" />
      </section>

      <section class="panel ed">
        <div class="grid2">
          <label class="fl full"><span>عنوان الورقة *</span><InputText v-model="f.title" fluid placeholder="مثال: الفرض الأول — الفصل الأول" /></label>
          <label class="fl"><span>القسم *</span><Select v-model="f.classId" :options="cat.classOptions(auth.active.classIds)" option-label="label" option-value="value" fluid /></label>
          <label class="fl"><span>المادة *</span><Select v-model="f.subjectId" :options="cat.subjectOptions(levelId)" option-label="label" option-value="value" fluid :disabled="!levelId" /></label>
          <label class="fl"><span>المدة</span><InputText v-model="f.duration" fluid placeholder="ساعة واحدة" /></label>
          <label class="fl"><span>التاريخ</span><InputText v-model="f.date" type="date" fluid /></label>
        </div>
        <div class="items-bar">
          <h3 class="sec">الأسئلة ({{ f.items.length }})</h3>
          <div>
            <Button label="من بنك الأسئلة" icon="pi pi-database" outlined size="small" :disabled="!levelId" @click="openBank" />
            <Button label="سؤال مقالي" icon="pi pi-plus" size="small" @click="f.items.push({ kind: 'open', q: '', points: 2, lines: 4 })" />
          </div>
        </div>
        <div v-for="(it, i) in f.items" :key="i" class="it">
          <span class="n">{{ i + 1 }}</span>
          <div class="it__b">
            <InputText v-model="it.q" fluid placeholder="نص السؤال" />
            <small v-if="it.kind === 'mcq'" class="muted">اختيار من متعدد: {{ it.options.join(' / ') }}</small>
          </div>
          <InputNumber v-model="it.points" :min="0.5" :step="0.5" input-class="pts" title="النقاط" />
          <button type="button" class="del" @click="f.items.splice(i, 1)"><i class="pi pi-trash" /></button>
        </div>
        <p class="muted total">المجموع: {{ f.items.reduce((n, x) => n + (x.points || 0), 0) }} نقطة</p>
        <div class="actions">
          <Button label="حفظ" severity="secondary" outlined :disabled="!valid" @click="persist(false)" />
          <Button label="حفظ ومعاينة الطباعة" icon="pi pi-print" :disabled="!valid" @click="persist(true)" />
        </div>
      </section>
    </div>

    <Dialog v-model:visible="bankDlg" modal header="بنك الأسئلة" :style="{ width: 'min(720px, 96vw)' }">
      <div class="bank">
        <label v-for="b in bank" :key="b.id" class="bq"><Checkbox v-model="picked" :value="b.id" /><div><b>{{ b.q }}</b><small class="muted">{{ b.lessonTitle }}</small></div></label>
      </div>
      <template #footer><Button :label="`إضافة ${picked.length}`" :disabled="!picked.length" @click="addFromBank" /></template>
    </Dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { questionBank, listOfflineTests, saveOfflineTest } from '@/api/teaching'

const auth = useAuthStore()
const cat = useCatalog()
const router = useRouter()
const toast = useToast()
const blank = () => ({ id: null, title: '', classId: auth.active.classIds?.[0] || null, subjectId: null, duration: 'ساعة واحدة', date: '', items: [] })
const f = reactive(blank())
const papers = ref([])
const bankDlg = ref(false)
const bank = ref([])
const picked = ref([])
const levelId = computed(() => cat.levelOfClass(f.classId))
const valid = computed(() => f.title.trim() && f.classId && f.subjectId && f.items.length)
const load = async () => (papers.value = await listOfflineTests(auth.person.id))
onMounted(load)
const reset = () => Object.assign(f, blank())
const edit = (p) => Object.assign(f, JSON.parse(JSON.stringify(p)))
async function openBank() {
  picked.value = []
  bank.value = await questionBank(levelId.value, f.subjectId)
  bankDlg.value = true
}
function addFromBank() {
  bank.value.filter((b) => picked.value.includes(b.id)).forEach((b) => f.items.push({ kind: 'mcq', q: b.q, options: b.options, answer: b.answer, points: 1 }))
  bankDlg.value = false
}
async function persist(print) {
  const saved = await saveOfflineTest(auth.person, { ...JSON.parse(JSON.stringify(f)), className: cat.classes.find((c) => c.id === f.classId)?.name, subjectName: cat.subjects.find((s) => s.id === f.subjectId)?.name, schoolId: auth.active.school?.id })
  f.id = saved.id
  await load()
  toast.add({ severity: 'success', summary: 'حُفظت الورقة', life: 1800 })
  if (print) router.push({ name: 'offline-print', params: { id: saved.id } })
}
</script>

<style scoped>
.ot { display: grid; grid-template-columns: 260px 1fr; gap: 1rem; align-items: start; }
.sec { font-size: 1rem; margin: 0 0 0.6rem; }
.papers { list-style: none; margin: 0 0 0.5rem; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.papers li { padding: 0.55rem 0.7rem; border-radius: 10px; cursor: pointer; border: 1px solid transparent; }
.papers li:hover, .papers li.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, #fff); }
.papers b { display: block; font-size: 0.88rem; }
.papers small { font-size: 0.76rem; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem 1rem; margin-bottom: 1rem; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.items-bar { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
.items-bar > div { display: flex; gap: 0.4rem; }
.it { display: grid; grid-template-columns: auto 1fr 90px auto; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
.it__b small { font-size: 0.76rem; }
.n { width: 26px; height: 26px; border-radius: 50%; background: var(--bg); display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; }
:deep(.pts) { width: 80px; }
.del { border: 0; background: none; color: #b42318; cursor: pointer; }
.total { text-align: end; margin: 0.5rem 0; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.bank { display: flex; flex-direction: column; gap: 0.4rem; max-height: 55vh; overflow: auto; }
.bq { display: flex; gap: 0.6rem; padding: 0.55rem; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }
.bq b { display: block; font-size: 0.88rem; }
@media (max-width: 900px) { .ot { grid-template-columns: 1fr; } .grid2 { grid-template-columns: 1fr; } }
</style>
