<template>
  <!-- TE13: رفع محتوى — لأقسامي (بمصادقة مدير المدرسة) أو اقتراح للمكتبة المركزية (بمراجعة المحرر) -->
  <div class="up">
    <PageHeader title="رفع محتوى" subtitle="ارفع ملفاً أو رابطاً وحدّد لمن يصل. كل محتوى يمرّ بالمراجعة قبل أن يراه التلاميذ." />
    <div class="up__grid">
      <form class="panel up__form" @submit.prevent="submit">
        <div class="target">
          <button type="button" :class="{ on: f.target === 'class' }" @click="f.target = 'class'"><i class="pi pi-th-large" /><b>لأقسامي فقط</b><small>يراجعه مدير المدرسة</small></button>
          <button type="button" :class="{ on: f.target === 'library' }" @click="f.target = 'library'"><i class="pi pi-globe" /><b>اقتراح للمكتبة المركزية</b><small>يراجعه المحرر، ثم يصل لكل المدارس</small></button>
        </div>
        <label class="fl full"><span>العنوان *</span><InputText v-model="f.title" fluid placeholder="مثال: خريطة ذهنية لأحكام الطهارة" /></label>
        <label class="fl"><span>نوع المحتوى *</span><Select v-model="f.type" :options="cat.TYPE_OPTIONS" option-label="label" option-value="value" fluid /></label>
        <label class="fl"><span>الأقسام</span><MultiSelect v-model="f.classIds" :options="cat.classOptions(auth.active.classIds)" option-label="label" option-value="value" display="chip" fluid /></label>
        <label class="fl"><span>المادة *</span><Select v-model="f.subjectId" :options="cat.subjectOptions(levelId)" option-label="label" option-value="value" fluid :disabled="!levelId" placeholder="اختر قسماً أولاً" /></label>
        <label class="fl"><span>الدرس</span><Select v-model="f.lessonId" :options="cat.lessonOptions(f.subjectId)" option-label="label" option-value="value" filter fluid :disabled="!f.subjectId" /></label>
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
          <Button type="submit" :label="f.target === 'library' ? 'إرسال للمراجعة' : 'رفع للمصادقة'" icon="pi pi-send" :loading="busy" :disabled="!valid" />
        </div>
      </form>

      <aside class="panel">
        <h3 class="sec">آخر ما رفعت</h3>
        <ul class="recent">
          <li v-for="u in mine.slice(0, 6)" :key="u.id"><div><b>{{ u.title }}</b><small class="muted">{{ cat.TYPE_LABEL[u.type] }} · {{ u.target === 'library' ? 'المكتبة المركزية' : 'أقسامي' }}</small></div><StatusTag :status="u.status" /></li>
        </ul>
        <RouterLink to="/app/my-files" class="lnk">كل ملفاتي <i class="pi pi-arrow-left flip" /></RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { createUpload, myUploads } from '@/api/teaching'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const blank = () => ({ target: 'class', title: '', type: 'pdf', classIds: [...(auth.active.classIds || []).slice(0, 1)], subjectId: null, lessonId: null, description: '', file: null, url: '' })
const f = reactive(blank())
const busy = ref(false)
const mine = ref([])
const levelId = computed(() => cat.levelOfClass(f.classIds[0]))
const valid = computed(() => f.title.trim() && f.type && f.subjectId && (f.type === 'link' ? f.url : f.file))
const load = async () => (mine.value = await myUploads(auth.person.id))
onMounted(load)
const onDrop = (e) => (f.file = e.dataTransfer.files[0]?.name || null)

async function submit() {
  busy.value = true
  const sub = cat.subjects.find((s) => s.id === f.subjectId)
  await createUpload(auth.person, { title: f.title.trim(), type: f.type, target: f.target, classIds: f.classIds, levelId: sub.levelId, subjectName: sub.name, lessonId: f.lessonId, description: f.description, file: f.file, url: f.url })
  busy.value = false
  toast.add({ severity: 'success', summary: 'أُرسل المحتوى', detail: f.target === 'library' ? 'سيراجعه المحرر قبل نشره في المكتبة المركزية' : 'سيصل تلاميذك بعد مصادقة مدير المدرسة', life: 3500 })
  Object.assign(f, blank())
  load()
}
</script>

<style scoped>
.up__grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
.up__form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1rem; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.target { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.target button { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem; padding: 0.8rem; border: 1.5px solid var(--line); border-radius: 12px; background: var(--surface); cursor: pointer; font: inherit; color: inherit; text-align: start; }
.target button i { font-size: 1.2rem; color: var(--brand); }
.target button small { color: var(--p-text-muted-color); }
.target button.on { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 6%, #fff); }
.drop { border: 2px dashed var(--line); border-radius: 14px; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.drop.has { border-color: var(--brand); }
.drop > i { font-size: 2rem; color: var(--brand); }
.drop p { margin: 0; }
.pick { color: var(--brand); font-weight: 700; cursor: pointer; }
.pick input { display: none; }
.x { border: 0; background: none; cursor: pointer; color: #b42318; }
.actions { display: flex; justify-content: flex-end; }
.sec { font-size: 1rem; margin: 0 0 0.75rem; }
.recent { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.recent li { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; }
.recent b { display: block; font-size: 0.86rem; }
.recent small { font-size: 0.76rem; }
.lnk { font-size: 0.86rem; color: var(--brand); text-decoration: none; font-weight: 700; }
@media (max-width: 960px) { .up__grid { grid-template-columns: 1fr; } .up__form, .target { grid-template-columns: 1fr; } }
</style>
