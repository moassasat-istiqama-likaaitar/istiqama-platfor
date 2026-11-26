<template>
  <!-- TE11/ED02: المكتبة المركزية — شبكة مصفّاة (المستوى ← المادة ← الدرس + النوع والتصنيف)؛ المعلم يرى المعتمد فقط -->
  <div class="lib">
    <header class="lib__hero">
      <div>
        <h1>{{ t('library.title') }}</h1>
        <p>{{ t('library.subtitle') }}</p>
      </div>
      <div v-if="facets" class="lib__stats">
        <div><b>{{ facets.stats.total }}</b><span>{{ t('library.stats.total') }}</span></div>
        <div><b>{{ facets.stats.videos }}</b><span>{{ t('library.stats.videos') }}</span></div>
        <div v-if="curator"><b>{{ facets.stats.pending }}</b><span>{{ t('library.stats.pending') }}</span></div>
        <RouterLink to="/app/activities" class="lib__act"><i class="pi pi-pencil" /> الواجبات والاختبارات في «بنك الأنشطة»</RouterLink>
      </div>
    </header>

    <section class="filters panel">
      <IconField class="filters__search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="f.q" :placeholder="t('library.search')" fluid @input="reload" />
      </IconField>
      <Select v-model="f.level" :options="levelOpts" option-label="label" option-value="value" :placeholder="t('library.level')" show-clear class="sel" @change="reload" />
      <Select v-model="f.subjectKey" :options="subjectOpts" option-label="label" option-value="value" :placeholder="t('library.subject')" show-clear class="sel" @change="f.lessonId = null; reload()" />
      <Select v-model="f.lessonId" :options="lessonFilterOpts" option-label="label" option-value="value" placeholder="الدرس" show-clear filter class="sel sel--wide" :disabled="!f.subjectKey" />
      <Select v-if="curator" v-model="f.status" :options="statusOpts" option-label="label" option-value="value" :placeholder="t('library.status')" show-clear class="sel" @change="reload" />
      <Select v-else v-model="f.classification" :options="classOpts" option-label="label" option-value="value" placeholder="التصنيف" show-clear class="sel" @change="reload" />
      <div class="filters__types">
        <button v-for="ty in types" :key="ty.v" type="button" class="pill" :class="{ 'is-active': f.type === ty.v }" @click="f.type = ty.v; reload()">
          <i :class="ty.icon" /> {{ ty.v ? t(`student.types.${ty.v}`) : t('library.all') }}
        </button>
      </div>
    </section>

    <div class="lib__bar">
      <span class="muted">{{ t('library.results', { n: shownItems.length }) }}</span>
      <Button v-if="hasFilters" :label="t('library.reset')" icon="pi pi-filter-slash" text size="small" @click="reset" />
    </div>

    <!-- شبكة مصفّاة مثل بنك الأنشطة: المرشّحات (المستوى ← المادة ← الدرس) تحدد ما يظهر، مرتباً بترتيب الدروس -->
    <div class="grid">
      <button v-for="c in shownItems" :key="c.id" type="button" class="card" :style="{ '--c': c.subject.color }" @click="open(c)">
        <div class="card__thumb">
          <img v-if="c.payload?.poster" :src="c.payload.poster" alt="" />
          <LessonArt v-else :kind="thumbArt(c)" :color="c.subject.color" :accent="c.subject.accent" />
          <span class="card__type"><i :class="typeIcon[c.type]" /> {{ t(`student.types.${c.type}`) }}</span>
          <span v-if="c.type === 'video'" class="card__play"><i class="pi pi-play" /></span>
        </div>
        <div class="card__body">
          <div class="card__tags">
            <span v-if="curator" class="tag" :data-hue="statusHue[c.status]">{{ t(`library.statuses.${c.status}`) }}</span>
            <span class="tag tag--plain">{{ t(`student.classification.${c.classification}`) }}</span>
          </div>
          <strong class="card__title">{{ c.title }}</strong>
          <span class="card__lesson"><i class="pi pi-bookmark" /> {{ c.lesson.title }}</span>
          <span class="card__meta">{{ c.subject.name }} · {{ c.level.name }}</span>
          <span class="card__foot">
            <span><i class="pi pi-user" /> {{ c.authorName }}</span>
            <span v-if="c.views"><i class="pi pi-star-fill star" /> {{ c.rating.toFixed(1) }}</span>
          </span>
        </div>
      </button>
    </div>
    <div v-if="!items.length" class="panel"><EmptyState icon="pi pi-search" :text="t('library.empty')" /></div>

    <!-- المعاينة -->
    <Dialog v-model:visible="preview.open" modal dismissable-mask :header="preview.item?.title" :style="{ width: 'min(980px, 96vw)' }">
      <div v-if="preview.item" class="pv">
        <ContentViewer
          v-if="['video', 'slides', 'pdf', 'image'].includes(preview.item.type)"
          :item="preview.item" :color="preview.item.subject.color" :accent="preview.item.subject.accent" :art="preview.item.subject.art"
        />
        <div v-else class="pv__act">
          <p v-if="preview.item.payload.instructions" class="pre">{{ preview.item.payload.instructions }}</p>
          <ol v-if="preview.item.payload.questions">
            <li v-for="(q, i) in preview.item.payload.questions" :key="i">
              <strong>{{ q.q }}</strong>
              <span class="opts"><span v-for="(o, k) in q.options" :key="k" :class="{ ok: k === q.answer }">{{ o }}</span></span>
            </li>
          </ol>
        </div>
        <dl class="pv__meta">
          <div><dt>{{ t('library.subject') }}</dt><dd>{{ preview.item.subject.name }}</dd></div>
          <div><dt>{{ t('library.level') }}</dt><dd>{{ preview.item.level.name }}</dd></div>
          <div><dt>{{ t('library.lesson') }}</dt><dd>{{ preview.item.lesson.title }}</dd></div>
          <div><dt>{{ t('library.author') }}</dt><dd>{{ preview.item.authorName }}</dd></div>
          <div><dt>{{ t('library.status') }}</dt><dd><span class="tag" :data-hue="statusHue[preview.item.status]">{{ t(`library.statuses.${preview.item.status}`) }}</span></dd></div>
        </dl>
        <div class="pv__kw"><span v-for="k in preview.item.keywords" :key="k" class="chip"># {{ k }}</span></div>
      </div>
      <template #footer>
        <Button :label="t('common.close')" text severity="secondary" @click="preview.open = false" />
        <Button v-if="['teacher', 'editor'].includes(auth.role) && ['approved', 'temp'].includes(preview.item.status)" :label="t('library.addToClass')" icon="pi pi-plus" @click="add" />
      </template>
    </Dialog>
    <LinkDialog v-model:visible="linkOpen" :item="linkItem" :kind="linkItem && ['quiz', 'homework'].includes(linkItem.type) ? 'activity' : 'content'" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dialog from 'primevue/dialog'
import LessonArt from '@/components/art/LessonArt.vue'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import EmptyState from '@/components/EmptyState.vue'
import * as libraryApi from '@/api/library'
import { useAuthStore } from '@/stores/auth'
import { classes as classesAll } from '@/mock/db'
import LinkDialog from '@/components/library/LinkDialog.vue'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const items = ref([])
const facets = ref(null)
const f = reactive({ q: '', level: null, subjectKey: null, lessonId: null, status: null, type: null, classification: null })
const preview = reactive({ open: false, item: null })

const types = [
  { v: null, icon: 'pi pi-th-large' }, { v: 'video', icon: 'pi pi-video' }, { v: 'slides', icon: 'pi pi-images' },
  { v: 'pdf', icon: 'pi pi-file-pdf' }, { v: 'image', icon: 'pi pi-image' }
]
const curator = computed(() => ['editor', 'admin', 'super_admin'].includes(auth.role))
const classOpts = [{ label: 'رئيسي', value: 'main' }, { label: 'إثرائي', value: 'enrichment' }, { label: 'نشاط', value: 'activity' }]
// الدروس المتاحة في المادة المختارة (من النتائج نفسها، بترتيبها)
const lessonFilterOpts = computed(() => [...new Map(items.value.filter((c) => c.lesson.id).map((c) => [c.lesson.id, { label: c.lesson.title, value: c.lesson.id }])).values()])
const shownItems = computed(() => items.value.filter((c) => !f.lessonId || c.lesson.id === f.lessonId))
const typeIcon = Object.fromEntries(types.filter((x) => x.v).map((x) => [x.v, x.icon]))
const statusHue = { approved: 'green', temp: 'teal', pending: 'orange', draft: 'blue', rejected: 'red' }
const levelOpts = computed(() => facets.value?.levels.map((l) => ({ value: l.id, label: l.name })) || [])
const subjectOpts = computed(() => facets.value?.subjects.map((s) => ({ value: s, label: s })) || [])
const statusOpts = computed(() => Object.keys(statusHue).map((s) => ({ value: s, label: t(`library.statuses.${s}`) })))
const hasFilters = computed(() => f.q || f.subjectKey || f.lessonId || f.status || f.type || f.classification)
const thumbArt = (c) => (c.type === 'image' ? c.payload.art : c.type === 'quiz' ? 'idea' : c.type === 'homework' ? 'pen' : c.subject.art)

let timer
function reload() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    items.value = await libraryApi.list({ ...f }, { curator: curator.value })
  }, 150)
}
function reset() {
  Object.assign(f, { q: '', level: myLevel(), subjectKey: null, lessonId: null, status: null, type: null, classification: null })
  reload()
}
function open(c) {
  preview.item = c
  preview.open = true
}
// يفتح المعلم/المحرر على مستواه الأول (يغيّره من القائمة)
function myLevel() {
  if (auth.role === 'editor') return auth.active.levels?.[0]?.id || null
  if (auth.role === 'teacher') return classesAll.find((c) => c.id === auth.active.classIds?.[0])?.levelId || null
  return null
}
// الإدراج في القسم: يسأل في أي قسم وأي درس
const linkOpen = ref(false)
const linkItem = ref(null)
function add() {
  linkItem.value = { ...preview.item, levelId: preview.item.level.id, subjectId: preview.item.subject.id, lessonId: preview.item.lesson.id, levelName: preview.item.level.name }
  preview.open = false
  linkOpen.value = true
}

onMounted(async () => {
  facets.value = await libraryApi.facets({ curator: curator.value })
  f.level = myLevel()
  reload()
})
</script>

<style scoped>
.lib { display: flex; flex-direction: column; gap: 1rem; }
.lib__hero { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 1.5rem 1.75rem; border-radius: var(--radius-lg); color: #fff; background: linear-gradient(120deg, var(--p-primary-600), var(--p-primary-800)); box-shadow: 0 14px 34px color-mix(in srgb, var(--brand) 25%, transparent); }
.lib__hero h1 { margin: 0; font-size: 1.7rem; }
.lib__hero p { margin: 0.25rem 0 0; opacity: 0.9; }
.lib__stats { display: flex; gap: 0.6rem; }
.lib__stats div { display: flex; flex-direction: column; align-items: center; padding: 0.6rem 1rem; border-radius: 14px; background: rgba(255, 255, 255, 0.14); min-width: 90px; }
.lib__stats b { font-size: 1.5rem; line-height: 1.1; }
.lib__stats span { font-size: 0.75rem; opacity: 0.9; }
.filters { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 0.6rem; }
.filters__types { grid-column: 1 / -1; display: flex; gap: 0.4rem; flex-wrap: wrap; }
.sel { width: 100%; }
.lib__bar { display: flex; justify-content: space-between; align-items: center; }
.lib__act { align-self: center; color: #fff; text-decoration: none; font-size: 0.82rem; background: rgba(255, 255, 255, 0.14); border-radius: 14px; padding: 0.6rem 0.9rem; max-width: 170px; }
.card__lesson { font-size: 0.78rem; color: var(--c); font-weight: 700; display: flex; gap: 0.3rem; align-items: center; }
.sel--wide { min-width: 220px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1rem; }
.card { display: flex; flex-direction: column; text-align: start; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); cursor: pointer; font: inherit; color: inherit; box-shadow: var(--shadow); transition: transform 0.15s, border-color 0.15s; }
.card:hover { transform: translateY(-3px); border-color: var(--c); }
.card__thumb { position: relative; aspect-ratio: 200 / 120; overflow: hidden; background: #f4f4f8; }
.card__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card__type { position: absolute; top: 8px; inset-inline-start: 8px; background: rgba(15, 20, 35, 0.72); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 999px; display: flex; gap: 0.3rem; align-items: center; }
.card__play { position: absolute; inset: 0; margin: auto; width: 46px; height: 46px; border-radius: 50%; background: rgba(255, 255, 255, 0.92); color: var(--c); display: grid; place-items: center; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
.card__body { padding: 0.75rem 0.9rem 0.9rem; display: flex; flex-direction: column; gap: 0.3rem; }
.card__tags { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.tag { font-size: 0.68rem; font-weight: 700; padding: 0.05rem 0.5rem; border-radius: 999px; }
.tag--plain { background: var(--bg); color: var(--muted); }
.card__title { font-size: 0.95rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card__meta { font-size: 0.78rem; color: var(--c); font-weight: 700; }
.card__foot { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
.star { color: #f5a400; }
.pv { display: flex; flex-direction: column; gap: 1rem; }
.pv__meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.6rem; margin: 0; }
.pv__meta div { background: var(--bg); padding: 0.55rem 0.8rem; border-radius: 12px; }
.pv__meta dt { font-size: 0.72rem; color: var(--muted); }
.pv__meta dd { margin: 0; font-weight: 700; }
.pv__kw { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.pv__act ol { display: flex; flex-direction: column; gap: 0.7rem; padding-inline-start: 1.2rem; }
.pv__act .opts { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.3rem; }
.pv__act .opts span { padding: 0.15rem 0.6rem; border-radius: 8px; background: var(--bg); font-size: 0.85rem; }
.pv__act .opts span.ok { background: #dcf7e3; color: #16803c; font-weight: 700; }
.pre { white-space: pre-wrap; }
@media (max-width: 860px) { .filters { grid-template-columns: 1fr 1fr; } .filters__search { grid-column: 1 / -1; } }
</style>
