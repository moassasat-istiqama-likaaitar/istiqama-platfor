<template>
  <!-- ST: مكتبة القسم — كل ما أدرجه المعلم والمحرر لقسمي، بتصفية بالمادة والنوع والتصنيف -->
  <div class="sl" :class="`sl--${theme}`">
    <h1>{{ theme === 'kids' ? 'مكتبتي 📚' : 'مكتبة القسم' }}</h1>
    <p class="muted sub">{{ theme === 'kids' ? 'كل الفيديوهات والصور والقصص التي اختارها لك معلمك' : 'كل ما أدرجه معلمك لقسمك — صفِّ بالمادة أو النوع.' }}</p>

    <div class="fl">
      <div class="chips">
        <button type="button" class="chip" :class="{ on: !subject }" @click="subject = null">كل المواد</button>
        <button v-for="s in subjects" :key="s.name" type="button" class="chip" :class="{ on: subject === s.name }" :style="{ '--c': s.color }" @click="subject = s.name"><i :class="s.icon" /> {{ s.name }}</button>
      </div>
      <div v-if="theme !== 'kids'" class="row">
        <Select v-model="type" :options="[{ label: 'كل الأنواع', value: null }, ...cat.TYPE_OPTIONS]" option-label="label" option-value="value" />
        <Select v-model="klass" :options="[{ label: 'كل التصنيفات', value: null }, ...CLASSIFICATIONS]" option-label="label" option-value="value" />
        <IconField class="q"><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="ابحث" fluid /></IconField>
      </div>
      <div v-else class="chips">
        <button v-for="t in KIDS_TYPES" :key="t.value || 'all'" type="button" class="chip big" :class="{ on: type === t.value }" @click="type = t.value"><i :class="t.icon" /> {{ t.label }}</button>
      </div>
    </div>

    <p v-if="loading" class="muted">...</p>
    <div v-else-if="!list.length" class="empty">لا شيء هنا بعد.</div>
    <div v-else class="grid">
      <button v-for="c in list" :key="c.id + (c.lessonId || '')" type="button" class="card" :style="{ '--c': c.subjectColor || 'var(--brand)' }" @click="cur = c">
        <span class="card__ic"><i :class="ICON[c.type] || 'pi pi-file'" /></span>
        <b>{{ c.title }}</b>
        <small>{{ c.subjectName }}<template v-if="c.lessonTitle"> · {{ c.lessonTitle }}</template></small>
        <span v-if="theme !== 'kids'" class="tag">{{ classLabel(c.classification) }}</span>
      </button>
    </div>

    <Dialog :visible="!!cur" modal :header="cur?.title" :style="{ width: 'min(860px, 96vw)' }" @update:visible="cur = null">
      <ContentViewer v-if="cur" :item="cur" :color="cur.subjectColor" />
      <RouterLink v-if="cur?.lessonId" :to="`/app/lesson/${cur.lessonId}`" class="go">اذهب إلى الدرس <i class="pi pi-arrow-left flip" /></RouterLink>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useCatalog } from '@/composables/useCatalog'
import { CLASSIFICATIONS, classLabel } from '@/composables/useStatusLabels'
import { studentLibrary } from '@/api/bank'

const auth = useAuthStore()
const student = useStudentStore()
const cat = useCatalog()
const theme = computed(() => student.theme)
const ICON = { video: 'pi pi-video', pdf: 'pi pi-file-pdf', slides: 'pi pi-images', image: 'pi pi-image', audio: 'pi pi-volume-up', link: 'pi pi-link' }
const KIDS_TYPES = [{ label: 'الكل', value: null, icon: 'pi pi-th-large' }, { label: 'فيديو', value: 'video', icon: 'pi pi-video' }, { label: 'صور', value: 'image', icon: 'pi pi-image' }, { label: 'عروض', value: 'slides', icon: 'pi pi-images' }]
const items = ref([])
const loading = ref(true)
const subject = ref(null)
const type = ref(null)
const klass = ref(null)
const q = ref('')
const cur = ref(null)
onMounted(async () => {
  items.value = await studentLibrary(auth.person.id)
  loading.value = false
})
const subjects = computed(() => [...new Map(items.value.map((c) => [c.subjectName, { name: c.subjectName, color: c.subjectColor, icon: c.subjectIcon, order: c.subjectOrder }])).values()].sort((a, b) => a.order - b.order))
// نفس ترتيب المكتبة المركزية: مادة ← محور ← درس ← رئيسي قبل الإثرائي
const list = computed(() => items.value
  .filter((c) => (!subject.value || c.subjectName === subject.value) && (!type.value || c.type === type.value) && (!klass.value || c.classification === klass.value) && (!q.value || c.title.includes(q.value)))
  .sort((a, b) => a.subjectOrder - b.subjectOrder || a.axisIndex - b.axisIndex || a.lessonOrder - b.lessonOrder || (a.classification === 'main' ? -1 : 1)))
</script>

<style scoped>
.sl { max-width: 1180px; margin: 0 auto; }
h1 { margin: 0; font-family: var(--font-display); }
.sub { margin: 0.25rem 0 1rem; }
.fl { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.2rem; }
.chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.chip { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 0.4rem 0.9rem; cursor: pointer; font: inherit; font-size: 0.88rem; color: inherit; display: inline-flex; gap: 0.35rem; align-items: center; }
.chip i { color: var(--c, var(--brand)); }
.chip.on { background: var(--c, var(--brand)); color: #fff; border-color: transparent; }
.chip.on i { color: #fff; }
.chip.big { padding: 0.6rem 1.1rem; font-size: 1rem; font-weight: 700; }
.row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.q { flex: 1; min-width: 180px; }
.empty { text-align: center; padding: 3rem; color: var(--p-text-muted-color); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.8rem; }
.card { text-align: start; border: 1px solid var(--line); background: var(--surface); border-radius: 16px; padding: 1rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.35rem; font: inherit; color: inherit; border-top: 4px solid var(--c); }
.card:hover { box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08); }
.card__ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); font-size: 1.2rem; }
.card small { color: var(--p-text-muted-color); font-size: 0.8rem; }
.tag { align-self: flex-start; font-size: 0.72rem; background: #f0f2f6; padding: 0.1rem 0.5rem; border-radius: 999px; }
.sl--kids .card { border-radius: 24px; border-top-width: 6px; align-items: center; text-align: center; }
.sl--kids .card__ic { width: 64px; height: 64px; font-size: 1.8rem; border-radius: 20px; }
.sl--kids .grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
.sl--teens .card { border-top: 0; border-inline-start: 4px solid var(--c); }
.go { display: inline-flex; gap: 0.4rem; margin-top: 0.8rem; color: var(--brand); font-weight: 700; text-decoration: none; }
</style>
