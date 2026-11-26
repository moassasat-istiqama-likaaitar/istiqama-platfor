<template>
  <!-- TE04/TE05: مكتبة القسم — شبكة مصفّاة مثل بنك الأنشطة: المادة ← الدرس ← النوع، محتوى وأنشطة القسم -->
  <div class="cl">
    <PageHeader title="مكتبة القسم" :subtitle="isEditor ? 'اختر قسماً بعينه، أو المستوى كقسم واحد: ما تدرجه فيه يصل كل أقسامه إجبارياً.' : 'ما يصل تلاميذ القسم من محتوى وأنشطة. صفِّ بالمادة والدرس. الأساسي ثابت، وما أدرجته أنت يمكنك إزالته.'" />

    <div class="clbar panel">
      <Select v-model="target" :options="targetOpts" option-label="label" option-value="value" option-group-label="label" option-group-children="items" class="clbar__sel" />
      <Select v-model="fSubject" :options="subjectOpts" placeholder="المادة" show-clear class="clbar__s" @change="fLesson = null" />
      <Select v-model="fLesson" :options="lessonOpts" option-label="label" option-value="value" placeholder="الدرس" show-clear filter class="clbar__s" :disabled="!fSubject" />
      <IconField class="clbar__q"><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="ابحث في الدروس والمحتوى" fluid /></IconField>
      <div class="clbar__chips">
        <button v-for="f in FILTERS" :key="f.key" type="button" class="pill" :class="{ 'is-active': show === f.key }" @click="show = f.key">{{ f.label }}</button>
      </div>
      <div class="clbar__links">
        <RouterLink to="/app/central-library" class="p-button p-component p-button-outlined p-button-sm"><i class="pi pi-book" />&nbsp;من المكتبة المركزية</RouterLink>
        <RouterLink to="/app/activities" class="p-button p-component p-button-outlined p-button-sm"><i class="pi pi-pencil" />&nbsp;من بنك الأنشطة</RouterLink>
        <RouterLink to="/app/upload-content" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع</RouterLink>
      </div>
    </div>

    <div class="legend muted">
      <span><i class="pi pi-lock" /> أساسي / إجباري</span><span><i class="pi pi-link" /> أدرجته</span><span><i class="pi pi-hourglass" /> معتمد مؤقتاً</span><span><i class="pi pi-user" /> من رفعي</span>
    </div>

    <p v-if="loading" class="muted">...</p>
    <div v-else-if="!flat.length" class="panel empty">لا شيء يطابق.</div>

    <div class="cgrid">
      <article v-for="it in flat" :key="it.key" class="cc" :data-src="it.source" :style="{ '--sc': it.subjectColor || 'var(--brand)' }">
        <header>
          <span class="cc__ic"><i :class="iconOf(it)" /></span>
          <div class="cc__t"><b>{{ it.title }}</b><small class="muted">{{ it.isAct ? (it.type === 'quiz' ? 'تقييم' : 'واجب') : cat.TYPE_LABEL[it.type] }}<template v-if="it.classification && !it.isAct"> · {{ classLabel(it.classification) }}</template></small></div>
          <Button v-if="it.linkId && (!it.mandatory || isEditor)" icon="pi pi-times" text rounded size="small" severity="secondary" title="إزالة من القسم" @click="unlink(it)" />
        </header>
        <span class="cc__lesson"><i class="pi pi-bookmark" /> {{ it.lessonTitle || 'بلا درس — عام للقسم' }}</span>
        <small class="muted">{{ it.subjectName }}<template v-if="it.due"> · آخر أجل {{ fmt(it.due) }}</template><template v-if="it.linkedBy"> · أدرجه {{ it.linkedBy }}</template></small>
        <span class="badges">
          <span v-if="it.mandatory" class="bd bd--lock"><i class="pi pi-lock" /> {{ it.source === 'level' ? 'إجباري للمستوى' : 'أساسي' }}</span>
          <span v-else-if="it.source === 'link'" class="bd bd--link"><i class="pi pi-link" /> أدرجته</span>
          <span v-if="it.source === 'mine'" class="bd bd--mine"><i class="pi pi-user" /> من رفعي</span>
          <span v-if="it.temp" class="bd bd--temp"><i class="pi pi-hourglass" /> مؤقت</span>
          <span v-if="it.isAct && it.visibleToStudents === false" class="bd bd--wait" title="لا يراه التلاميذ حتى يصادق عليه المدير أو يعتمده المحرر"><i class="pi pi-eye-slash" /> بانتظار المصادقة</span>
        </span>
      </article>
    </div>
    <p v-if="!loading" class="muted cnt">{{ flat.length }} عنصر</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { classLabel } from '@/composables/useStatusLabels'
import { classLibrary, levelLibrary, unlinkItem } from '@/api/bank'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const isEditor = computed(() => auth.role === 'editor')
const FILTERS = [
  { key: 'all', label: 'الكل' }, { key: 'main', label: 'رئيسي' }, { key: 'enrichment', label: 'إثرائي' }, { key: 'activity', label: 'أنشطة' }, { key: 'mine', label: 'ما أدرجته/رفعته' }
]
const targetOpts = computed(() => {
  const groups = []
  if (isEditor.value) groups.push({ label: 'المستوى كقسم واحد', items: (auth.active.levels || []).map((l) => ({ label: `كل أقسام ${l.name}`, value: `L:${l.id}` })) })
  groups.push({ label: 'قسم بعينه', items: cat.classOptions(auth.active.classIds || []).map((o) => ({ ...o, value: `C:${o.value}` })) })
  return groups.filter((g) => g.items.length)
})
const target = ref(null)
const q = ref('')
const show = ref('all')
const data = ref({ contents: [], activities: [] })
const loading = ref(true)

async function load() {
  if (!target.value) return
  loading.value = true
  const [k, id] = [target.value.slice(0, 1), target.value.slice(2)]
  data.value = await (k === 'L' ? levelLibrary(id) : classLibrary(id, auth.person.id))
  loading.value = false
}
onMounted(() => {
  target.value = targetOpts.value[0]?.items[0]?.value || null
})
watch(target, load)

const fSubject = ref(null)
const fLesson = ref(null)
const allItems = computed(() => [...data.value.contents.map((x) => ({ ...x, isAct: false })), ...data.value.activities.map((x) => ({ ...x, isAct: true }))])
const subjectOpts = computed(() => [...new Set(allItems.value.map((x) => x.subjectName))])
const lessonOpts = computed(() => [...new Map(allItems.value.filter((x) => x.subjectName === fSubject.value && x.lessonId).sort((a, b) => a.lessonOrder - b.lessonOrder).map((x) => [x.lessonId, { label: x.lessonTitle, value: x.lessonId }])).values()])
// ترتيب الدروس نفسه في المكتبة المركزية، والرئيسي قبل الإثرائي ثم الأنشطة
const flat = computed(() => {
  const term = q.value.trim()
  const rank = (it) => (it.isAct ? 3 : { main: 0, enrichment: 1, activity: 2 }[it.classification] ?? 1)
  return allItems.value
    .filter((x) => !fSubject.value || x.subjectName === fSubject.value)
    .filter((x) => !fLesson.value || x.lessonId === fLesson.value)
    .filter((x) => show.value === 'all' || (show.value === 'mine' ? ['link', 'mine'].includes(x.source) : (x.isAct ? 'activity' : x.classification) === show.value))
    .filter((x) => !term || [x.title, x.lessonTitle, x.subjectName].some((v) => v?.includes(term)))
    .sort((a, b) => (a.subjectOrder ?? 99) - (b.subjectOrder ?? 99) || (a.lessonId ? a.lessonOrder : 999) - (b.lessonId ? b.lessonOrder : 999) || rank(a) - rank(b))
    .map((x, i) => ({ ...x, key: `${x.id}-${x.linkId || i}` }))
})
const iconOf = (it) => (it.isAct ? (it.type === 'quiz' ? 'pi pi-question-circle' : 'pi pi-pencil') : { video: 'pi pi-video', pdf: 'pi pi-file-pdf', slides: 'pi pi-images', image: 'pi pi-image', audio: 'pi pi-volume-up', link: 'pi pi-link' }[it.type] || 'pi pi-file')
const fmt = (d) => new Date(d).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' })
async function unlink(it) {
  try {
    await unlinkItem(it.linkId, auth.person.id, auth.role)
    toast.add({ severity: 'info', summary: 'أُزيل من القسم', life: 1800 })
    load()
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 2500 })
  }
}
</script>

<style scoped>
.clbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 0.6rem; }
.clbar__sel { min-width: 240px; }
.clbar__q { flex: 1; min-width: 200px; }
.clbar__chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.clbar__links { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; margin-bottom: 1rem; }
.empty { text-align: center; padding: 2rem; }
.clbar__s { min-width: 170px; }
.cnt { font-size: 0.82rem; margin-top: 0.8rem; }
.cgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; }
.cc { background: var(--surface); border: 1px solid var(--line); border-top: 4px solid var(--sc); border-radius: 16px; padding: 0.9rem; display: flex; flex-direction: column; gap: 0.4rem; }
.cc[data-src='link'], .cc[data-src='mine'] { border-style: dashed; border-top-style: solid; }
.cc header { display: flex; gap: 0.6rem; align-items: flex-start; }
.cc__ic { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: color-mix(in srgb, var(--sc) 15%, transparent); color: var(--sc); flex-shrink: 0; }
.cc__t { flex: 1; min-width: 0; }
.cc__t b { display: block; font-size: 0.9rem; }
.cc__t small { font-size: 0.76rem; }
.cc__lesson { font-size: 0.8rem; font-weight: 700; color: var(--sc); display: flex; gap: 0.3rem; align-items: center; }
.cc small { font-size: 0.76rem; }
.cnt { font-size: 0.8rem; color: var(--p-text-muted-color); }
.badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.bd { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px; white-space: nowrap; }
.bd--lock { background: #eef1f6; color: #3d4a5c; }
.bd--link { background: #e8f3ff; color: #1d5fa8; }
.bd--mine { background: #f3ecff; color: #6a3fb5; }
.bd--wait { background: #f1f1f4; color: #6b6b7b; }
.bd--temp { background: #fff3d6; color: #8a5a00; }
</style>
