<template>
  <!-- TE04/TE05: مكتبة القسم — نفس ترتيب المكتبة المركزية (مادة ← محور ← درس) بتصميم مختلف: شجرة دروس بمحتواها وأنشطتها -->
  <div class="cl">
    <PageHeader title="مكتبة القسم" :subtitle="isEditor ? 'اختر قسماً بعينه، أو المستوى كقسم واحد: ما تدرجه فيه يصل كل أقسامه إجبارياً.' : 'ما يصل تلاميذ القسم، مرتباً كالمكتبة المركزية. الأساسي ثابت، وما أدرجته أنت يمكنك إزالته.'" />

    <div class="bar panel">
      <Select v-model="target" :options="targetOpts" option-label="label" option-value="value" option-group-label="label" option-group-children="items" class="bar__sel" />
      <IconField class="bar__q"><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="ابحث في الدروس والمحتوى" fluid /></IconField>
      <div class="bar__chips">
        <button v-for="f in FILTERS" :key="f.key" type="button" class="pill" :class="{ 'is-active': show === f.key }" @click="show = f.key">{{ f.label }}</button>
      </div>
      <div class="bar__links">
        <RouterLink to="/app/central-library" class="p-button p-component p-button-outlined p-button-sm"><i class="pi pi-book" />&nbsp;من المكتبة المركزية</RouterLink>
        <RouterLink to="/app/activities" class="p-button p-component p-button-outlined p-button-sm"><i class="pi pi-pencil" />&nbsp;من بنك الأنشطة</RouterLink>
        <RouterLink to="/app/upload-content" class="p-button p-component p-button-sm"><i class="pi pi-upload" />&nbsp;رفع</RouterLink>
      </div>
    </div>

    <div class="legend muted">
      <span><i class="pi pi-lock" /> أساسي / إجباري</span><span><i class="pi pi-link" /> أدرجته</span><span><i class="pi pi-hourglass" /> معتمد مؤقتاً</span><span><i class="pi pi-user" /> من رفعي</span>
    </div>

    <p v-if="loading" class="muted">...</p>
    <div v-else-if="!tree.length" class="panel empty">لا شيء يطابق.</div>

    <section v-for="s in tree" :key="s.name" class="subj" :style="{ '--sc': s.color || 'var(--brand)' }">
      <button type="button" class="subj__head" @click="toggle(s.name)">
        <i :class="s.icon || 'pi pi-book'" /><h2>{{ s.name }}</h2><span class="cnt">{{ s.count }} عنصر</span><i class="pi chev" :class="closed.has(s.name) ? 'pi-chevron-down' : 'pi-chevron-up'" />
      </button>
      <div v-if="!closed.has(s.name)" class="subj__body">
        <div v-for="ax in s.axes" :key="ax.name" class="axis">
          <h3 class="axis__t">{{ ax.name }}</h3>
          <div v-for="l in ax.lessons" :key="l.key" class="lesson">
            <div class="lesson__rail"><span class="dot" /></div>
            <div class="lesson__main">
              <h4>{{ l.title }}</h4>
              <ul class="items">
                <li v-for="it in l.items" :key="it.key" class="it" :data-src="it.source">
                  <i :class="iconOf(it)" class="it__ic" />
                  <div class="it__txt">
                    <b>{{ it.title }}</b>
                    <small class="muted">{{ it.isAct ? (it.type === 'quiz' ? 'اختبار' : 'واجب') : cat.TYPE_LABEL[it.type] }}<template v-if="it.classification && !it.isAct"> · {{ classLabel(it.classification) }}</template><template v-if="it.due"> · آخر أجل {{ fmt(it.due) }}</template><template v-if="it.linkedBy"> · أدرجه {{ it.linkedBy }}</template></small>
                  </div>
                  <span class="badges">
                    <span v-if="it.mandatory" class="bd bd--lock" title="أساسي — إجباري"><i class="pi pi-lock" /> {{ it.source === 'level' ? 'إجباري للمستوى' : 'أساسي' }}</span>
                    <span v-else-if="it.source === 'link'" class="bd bd--link"><i class="pi pi-link" /> أدرجته</span>
                    <span v-if="it.source === 'mine'" class="bd bd--mine"><i class="pi pi-user" /> من رفعي</span>
                    <span v-if="it.temp" class="bd bd--temp"><i class="pi pi-hourglass" /> مؤقت</span>
                  </span>
                  <Button v-if="it.linkId && (!it.mandatory || isEditor)" icon="pi pi-times" text rounded size="small" severity="secondary" title="إزالة من القسم" @click="unlink(it)" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
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
const closed = ref(new Set())

async function load() {
  if (!target.value) return
  loading.value = true
  const [k, id] = [target.value.slice(0, 1), target.value.slice(2)]
  data.value = await (k === 'L' ? levelLibrary(id) : classLibrary(id))
  // تُفتح المادة الأولى فقط؛ البقية مطوية حتى لا تطول الصفحة
  closed.value = new Set(tree.value.slice(1).map((s) => s.name))
  loading.value = false
}
onMounted(() => {
  target.value = targetOpts.value[0]?.items[0]?.value || null
})
watch(target, load)

const tree = computed(() => {
  const term = q.value.trim()
  const all = [...data.value.contents.map((x) => ({ ...x, isAct: false })), ...data.value.activities.map((x) => ({ ...x, isAct: true }))]
    .filter((x) => show.value === 'all' || (show.value === 'mine' ? ['link', 'mine'].includes(x.source) : (x.isAct ? 'activity' : x.classification) === show.value))
    .filter((x) => !term || [x.title, x.lessonTitle, x.subjectName].some((v) => v?.includes(term)))
  const subjects = new Map()
  all.forEach((x, i) => {
    if (!subjects.has(x.subjectName)) subjects.set(x.subjectName, { name: x.subjectName, color: x.subjectColor, icon: x.subjectIcon, order: x.subjectOrder, count: 0, axes: new Map() })
    const s = subjects.get(x.subjectName)
    s.count++
    const axName = x.lessonTitle ? x.axis || 'دروس' : 'بلا درس — عام للقسم'
    if (!s.axes.has(axName)) s.axes.set(axName, { name: axName, order: x.lessonTitle ? x.axisIndex : 999, lessons: new Map() })
    const ax = s.axes.get(axName)
    const lk = x.lessonId || 'none'
    if (!ax.lessons.has(lk)) ax.lessons.set(lk, { key: lk, title: x.lessonTitle || 'محتوى عام', order: x.lessonOrder, items: [] })
    ax.lessons.get(lk).items.push({ ...x, key: `${x.id}-${x.linkId || i}` })
  })
  const rank = (it) => (it.isAct ? 3 : { main: 0, enrichment: 1, activity: 2 }[it.classification] ?? 1)
  return [...subjects.values()].sort((a, b) => a.order - b.order).map((s) => ({
    ...s,
    axes: [...s.axes.values()].sort((a, b) => a.order - b.order).map((ax) => ({ ...ax, lessons: [...ax.lessons.values()].sort((a, b) => a.order - b.order).map((l) => ({ ...l, items: l.items.sort((a, b) => rank(a) - rank(b)) })) }))
  }))
})
const toggle = (n) => {
  const s = new Set(closed.value)
  s.has(n) ? s.delete(n) : s.add(n)
  closed.value = s
}
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
.bar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 0.6rem; }
.bar__sel { min-width: 240px; }
.bar__q { flex: 1; min-width: 200px; }
.bar__chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.bar__links { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; margin-bottom: 1rem; }
.empty { text-align: center; padding: 2rem; }
.subj { border-radius: 18px; background: var(--surface); border: 1px solid var(--line); margin-bottom: 1rem; overflow: hidden; }
.subj__head { width: 100%; display: flex; align-items: center; gap: 0.7rem; padding: 0.9rem 1.1rem; border: 0; cursor: pointer; background: color-mix(in srgb, var(--sc) 10%, transparent); border-inline-start: 6px solid var(--sc); font: inherit; color: inherit; text-align: start; }
.subj__head > i:first-child { color: var(--sc); font-size: 1.2rem; }
.subj__head h2 { margin: 0; font-size: 1.05rem; flex: 1; }
.cnt { font-size: 0.8rem; color: var(--p-text-muted-color); }
.subj__body { padding: 0.5rem 1.1rem 1rem; }
.axis__t { font-size: 0.82rem; letter-spacing: 0.02em; color: var(--sc); margin: 0.9rem 0 0.3rem; }
.lesson { display: grid; grid-template-columns: 20px 1fr; gap: 0.6rem; }
.lesson__rail { position: relative; }
.lesson__rail::before { content: ''; position: absolute; inset-inline-start: 8px; top: 0; bottom: 0; width: 2px; background: var(--line); }
.dot { position: absolute; inset-inline-start: 3px; top: 0.7rem; width: 12px; height: 12px; border-radius: 50%; background: var(--surface); border: 3px solid var(--sc); }
.lesson__main h4 { margin: 0.55rem 0 0.35rem; font-size: 0.95rem; }
.items { list-style: none; margin: 0 0 0.4rem; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.it { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.7rem; border-radius: 12px; background: color-mix(in srgb, var(--sc) 4%, var(--surface)); border: 1px solid var(--line); }
.it[data-src='link'], .it[data-src='mine'] { border-style: dashed; }
.it__ic { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; background: color-mix(in srgb, var(--sc) 15%, transparent); color: var(--sc); flex-shrink: 0; }
.it__txt { flex: 1; min-width: 0; }
.it__txt b { display: block; font-size: 0.88rem; }
.it__txt small { font-size: 0.76rem; }
.badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.bd { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px; white-space: nowrap; }
.bd--lock { background: #eef1f6; color: #3d4a5c; }
.bd--link { background: #e8f3ff; color: #1d5fa8; }
.bd--mine { background: #f3ecff; color: #6a3fb5; }
.bd--temp { background: #fff3d6; color: #8a5a00; }
</style>
