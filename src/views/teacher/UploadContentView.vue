<template>
  <!-- TE13: رفع محتوى — كل محتوى هدفه المكتبة المركزية. المدير يصادق (معتمد مؤقتاً لأقسامك)، والمحرر يعتمد. -->
  <div class="up">
    <PageHeader title="رفع محتوى" :subtitle="isEditor ? 'ما يرفعه المحرر يُعتمد مباشرة في المكتبة المركزية.' : 'كل محتوى ترفعه هدفه المكتبة المركزية. احفظه مسودة أو أرسله للمراجعة.'" />

    <ol v-if="!isEditor" class="flow">
      <li><b>1</b> مسودة <small>عندك وحدك</small></li>
      <li><b>2</b> قيد المراجعة <small>بعد الإرسال</small></li>
      <li><b>3</b> معتمد مؤقتاً <small>صادق المدير ← يظهر في أقسامك</small></li>
      <li><b>4</b> معتمد <small>اعتمده المحرر ← المكتبة المركزية</small></li>
    </ol>

    <div class="up__grid">
      <form class="panel up__form" @submit.prevent="send(true)">
        <Message v-if="editing?.note" severity="warn" class="full">ملاحظة المحرر: {{ editing.note }}</Message>
        <label class="fl full"><span>العنوان *</span><InputText v-model="f.title" fluid placeholder="مثال: خريطة ذهنية لأحكام الطهارة" /></label>
        <label class="fl"><span>نوع المحتوى *</span><Select v-model="f.type" :options="cat.TYPE_OPTIONS" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>{{ isEditor ? 'التصنيف *' : 'التصنيف المقترح *' }}</span><Select v-model="f.proposedClass" :options="CLASSIFICATIONS" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>المستوى *</span><Select v-model="f.levelId" :options="levelOpts" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>المادة *</span><Select v-model="f.subjectId" :options="cat.subjectOptions(f.levelId)" option-label="label" option-value="value" fluid :disabled="!f.levelId" /></label>
        <label class="fl full"><span>الدرس</span><Select v-model="f.lessonId" placeholder="— بلا درس —" :options="[{ label: '— بلا درس —', value: null }, ...cat.lessonOptions(f.subjectId)]" option-label="label" option-value="value" filter fluid :disabled="!f.subjectId" /></label>
        <label v-if="!isEditor" class="fl full"><span>أقسامي التي يظهر فيها بعد مصادقة المدير</span><MultiSelect v-model="f.classIds" :options="myClassOpts" option-label="label" option-value="value" display="chip" fluid /></label>
        <label v-else class="fl full sw"><ToggleSwitch v-model="f.essential" /><span><b>أساسي للمستوى</b> — يُربط تلقائياً وإجبارياً بكل أقسام المستوى في درسه</span></label>
        <label class="fl full"><span>وصف قصير</span><Textarea v-model="f.description" rows="2" auto-resize fluid /></label>
        <div class="drop full" :class="{ has: f.file }" @dragover.prevent @drop.prevent="onDrop">
          <template v-if="f.type === 'link'"><InputText v-model="f.url" dir="ltr" placeholder="https://" fluid /></template>
          <template v-else>
            <i class="pi pi-cloud-upload" />
            <p v-if="!f.file">اسحب الملف هنا أو <label class="pick">اختر ملفاً<input type="file" @change="(e) => (f.file = e.target.files[0]?.name)" /></label></p>
            <p v-else><b>{{ f.file }}</b> <button type="button" class="x" @click="f.file = null"><i class="pi pi-times" /></button></p>
            <small class="muted">فيديو حتى 500MB · PDF وعروض حتى 50MB · صور حتى 10MB</small>
          </template>
        </div>
        <div class="actions full">
          <Button v-if="!isEditor" label="حفظ كمسودة" severity="secondary" text icon="pi pi-save" :disabled="!f.title.trim()" @click="send(false)" />
          <Button type="submit" :label="isEditor ? 'نشر في المكتبة' : 'إرسال للمراجعة'" icon="pi pi-send" :loading="busy" :disabled="!valid" />
        </div>
      </form>

      <aside class="panel">
        <h3 class="sec">آخر ما رفعت</h3>
        <ul class="recent">
          <li v-for="u in mine.slice(0, 7)" :key="u.id"><div><b>{{ u.title }}</b><small class="muted">{{ cat.TYPE_LABEL[u.type] }} · {{ u.levelName }}</small></div><StatusTag :status="u.status" /></li>
        </ul>
        <RouterLink to="/app/my-files" class="lnk">كل محتواي <i class="pi pi-arrow-left flip" /></RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import ToggleSwitch from 'primevue/toggleswitch'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { CLASSIFICATIONS } from '@/composables/useStatusLabels'
import { createUpload, myUploads } from '@/api/teaching'
import { decide } from '@/api/editorial'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const route = useRoute()
const isEditor = computed(() => auth.role === 'editor')
const myLevels = computed(() => (isEditor.value ? (auth.active.levels || []).map((l) => l.id) : [...new Set((auth.active.classIds || []).map(cat.levelOfClass))]))
const levelOpts = computed(() => cat.levelOptions.filter((o) => myLevels.value.includes(o.value)))
const blank = () => ({ id: null, title: '', type: 'pdf', proposedClass: 'enrichment', levelId: myLevels.value[0] || null, subjectId: null, lessonId: null, classIds: [], description: '', file: null, url: '', essential: false })
const f = reactive(blank())
const editing = ref(null)
const busy = ref(false)
const mine = ref([])
const myClassOpts = computed(() => cat.classOptions(auth.active.classIds).filter((o) => cat.levelOfClass(o.value) === f.levelId))
const valid = computed(() => f.title.trim() && f.type && f.subjectId && (f.type === 'link' ? f.url : f.file))
const load = async () => {
  mine.value = await myUploads(auth.person.id)
  // تعديل مسودة (أو ما طُلب تعديله): #/app/upload-content?edit=<id>
  const e = route.query.edit && mine.value.find((u) => u.id === route.query.edit)
  if (e && !editing.value) {
    editing.value = e
    Object.assign(f, { ...blank(), ...e, file: e.file || 'الملف السابق' })
  }
}
onMounted(load)
const onDrop = (e) => (f.file = e.dataTransfer.files[0]?.name || null)

async function send(submit) {
  busy.value = true
  const sub = cat.subjects.find((s) => s.id === f.subjectId)
  const data = { ...f, subjectName: sub?.name, classIds: isEditor.value ? [] : f.classIds.length ? f.classIds : myClassOpts.value.map((o) => o.value) }
  if (!data.id) delete data.id
  const row = await createUpload(auth.person, data, submit)
  if (isEditor.value && submit) await decide({ ...row, kind: 'upload' }, 'approved', { classification: f.proposedClass, essential: f.essential })
  busy.value = false
  toast.add({ severity: 'success', summary: !submit ? 'حُفظت المسودة' : isEditor.value ? 'نُشر في المكتبة المركزية' : 'أُرسل للمراجعة', detail: !submit ? 'تبقى عندك حتى ترسلها' : isEditor.value ? (f.essential ? 'ورُبط بكل أقسام المستوى' : '') : 'يصادق عليه مدير مدرستك أو يعتمده المحرر', life: 3200 })
  editing.value = null
  Object.assign(f, blank())
  load()
}
</script>

<style scoped>
.flow { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; padding: 0; margin: 0 0 1rem; }
.flow li { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 0.6rem 0.8rem; font-weight: 700; font-size: 0.9rem; position: relative; }
.flow b { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 0.75rem; margin-inline-end: 0.35rem; }
.flow small { display: block; font-weight: 400; font-size: 0.76rem; color: var(--p-text-muted-color); margin-top: 0.15rem; }
.up__grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
.up__form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1rem; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.fl.sw { flex-direction: row; align-items: center; gap: 0.6rem; }
.fl.sw > span { font-weight: 400; }
.drop { border: 2px dashed var(--line); border-radius: 14px; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.drop.has { border-color: var(--brand); }
.drop > i { font-size: 2rem; color: var(--brand); }
.drop p { margin: 0; }
.pick { color: var(--brand); font-weight: 700; cursor: pointer; }
.pick input { display: none; }
.x { border: 0; background: none; cursor: pointer; color: #b42318; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.sec { font-size: 1rem; margin: 0 0 0.75rem; }
.recent { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.recent li { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; }
.recent b { display: block; font-size: 0.86rem; }
.recent small { font-size: 0.76rem; }
.lnk { font-size: 0.86rem; color: var(--brand); text-decoration: none; font-weight: 700; }
@media (max-width: 960px) { .up__grid, .flow { grid-template-columns: 1fr; } .up__form { grid-template-columns: 1fr; } }
</style>
