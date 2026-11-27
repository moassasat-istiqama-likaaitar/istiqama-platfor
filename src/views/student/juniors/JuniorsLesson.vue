<template>
  <!-- المستكشفون: المحتوى + قائمة "مهام الدرس" تُشطب مع التقدم -->
  <div class="jl" :style="{ '--c': l.subject.color }">
    <nav class="crumbs">
      <RouterLink to="/app/my-lessons">المواد</RouterLink><i class="pi pi-angle-left flip" />
      <RouterLink :to="`/app/subject/${l.subject.id}`">{{ l.subject.name }}</RouterLink><i class="pi pi-angle-left flip" />
      <span>{{ axisName }}</span>
    </nav>
    <header class="jl__head">
      <span class="jl__icon"><i :class="l.subject.icon" /></span>
      <div><small>{{ l.label || `الدرس ${l.order}` }}</small><h1>{{ l.title }}</h1></div>
    </header>

    <div class="jl__grid">
      <div class="jl__main">
        <div class="tabs">
          <button v-for="(c, i) in l.contents" :key="c.id" type="button" class="tab" :class="{ on: sel === i, seen: seen.has(i) }" @click="pick(i)">
            <i :class="typeIcon[c.type]" /> {{ t(`student.types.${c.type}`) }}
            <i v-if="seen.has(i)" class="pi pi-check-circle ok" />
          </button>
        </div>
        <div class="stage">
          <ContentViewer :key="current.id" :item="current" :color="l.subject.color" :accent="l.subject.accent" :art="l.subject.art" />
          <div class="stage__foot">
            <strong>{{ current.title }}</strong>
            <span class="rate">
              <button v-for="n in 5" :key="n" type="button" :class="{ on: n <= (current.myRating || 0) }" @click="rate(current, n)"><i class="pi pi-star-fill" /></button>
            </span>
            <button type="button" class="rep" @click="report"><i class="pi pi-flag" /></button>
          </div>
        </div>
        <section class="box"><LessonComments :comments="l.comments" @send="comment" /></section>
      </div>

      <aside class="missions">
        <header><h3><i class="pi pi-list-check" /> مهام الدرس</h3><span>{{ doneCount }}/{{ tasks.length }}</span></header>
        <div class="missions__bar"><span :style="{ width: (doneCount / tasks.length) * 100 + '%' }" /></div>
        <component :is="tk.to ? 'RouterLink' : 'button'" v-for="(tk, i) in tasks" :key="i" :to="tk.to" type="button" class="task" :class="{ done: tk.done }" @click="tk.action && tk.action()">
          <span class="task__box"><i v-if="tk.done" class="pi pi-check" /></span>
          <span class="task__t">{{ tk.label }}</span>
          <span class="task__xp">+{{ tk.xp }}</span>
        </component>
        <Button v-if="!l.done" label="إنهاء الدرس" icon="pi pi-flag-fill" class="finish" :loading="completing" :disabled="seen.size < l.contents.length" @click="complete" />
        <p v-if="!l.done && seen.size < l.contents.length" class="hint">افتح كل محتويات الدرس لإنهائه</p>
        <RouterLink v-if="l.next" :to="`/app/lesson/${l.next.id}`" class="next">الدرس التالي: {{ l.next.title }} <i class="pi pi-arrow-left flip" /></RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import LessonComments from '@/components/student/LessonComments.vue'
import { useLesson } from '@/composables/useLesson'

const props = defineProps({ l: { type: Object, required: true }, initial: { type: Number, default: 0 } })
const { t } = useI18n()
const lRef = toRef(props, 'l')
const { completing, complete, rate, comment, report } = useLesson(lRef)
const sel = ref(props.initial)
const seen = reactive(new Set(props.l.done ? props.l.contents.map((_, i) => i) : [props.initial]))
const current = computed(() => props.l.contents[sel.value])
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const verbs = { video: 'شاهد الفيديو', slides: 'تصفّح العرض', pdf: 'اقرأ المذكرة', image: 'تأمّل الصورة' }
const axisName = computed(() => (props.l.axis.includes(':') ? props.l.axis.split(':').slice(1).join(':').trim() : props.l.axis))

function pick(i) {
  sel.value = i
  seen.add(i)
}
const tasks = computed(() => [
  ...props.l.contents.map((c, i) => ({ label: verbs[c.type], xp: 5, done: seen.has(i), action: () => pick(i) })),
  ...props.l.activities.map((a) => ({ label: a.type === 'quiz' ? 'اجتز تحدي الأسئلة' : 'أنجز الواجب', xp: a.type === 'quiz' ? 25 : 15, done: ['graded', 'submitted'].includes(a.state), to: `/app/activity/${a.id}` }))
])
const doneCount = computed(() => tasks.value.filter((x) => x.done).length)
</script>

<style scoped>
.jl { display: flex; flex-direction: column; gap: 0.9rem; }
.crumbs { display: flex; gap: 0.45rem; align-items: center; font-size: 0.85rem; font-weight: 700; color: var(--muted); flex-wrap: wrap; }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:nth-child(3) { color: var(--c); }
.crumbs i { font-size: 0.65rem; }
.jl__head { display: flex; align-items: center; gap: 0.9rem; }
.jl__icon { width: 58px; height: 58px; border-radius: 18px; background: var(--c); color: #fff; display: grid; place-items: center; box-shadow: 0 5px 0 color-mix(in srgb, var(--c) 60%, #000); }
.jl__icon i { font-size: 1.5rem; }
.jl__head small { color: var(--c); font-weight: 800; }
.jl__head h1 { margin: 0; font-size: clamp(1.4rem, 4vw, 2rem); }
.jl__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 1.1rem; align-items: start; }
.jl__main { display: flex; flex-direction: column; gap: 0.9rem; min-width: 0; }
.tabs { display: flex; gap: 0.4rem; overflow-x: auto; }
.tab { display: flex; gap: 0.4rem; align-items: center; padding: 0.55rem 1rem; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); font: inherit; font-weight: 700; cursor: pointer; white-space: nowrap; color: var(--ink); }
.tab.on { border-color: var(--c); color: var(--c); }
.tab .ok { color: #5fb31a; }
.stage { background: var(--surface); border-radius: var(--radius-lg); padding: 0.75rem; box-shadow: var(--shadow); }
.stage__foot { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0.3rem 0.1rem; }
.stage__foot strong { flex: 1; }
.rate button { border: 0; background: none; color: #d9d9e3; cursor: pointer; font-size: 1.1rem; }
.rate button.on { color: #f5a400; }
.rep { border: 0; background: none; color: var(--muted); cursor: pointer; }
.box { background: var(--surface); border-radius: var(--radius-lg); padding: 1rem 1.15rem; box-shadow: var(--shadow); }
.missions { position: sticky; top: 130px; background: var(--surface); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 0.5rem; border-top: 6px solid #8ac926; }
.missions header { display: flex; justify-content: space-between; align-items: center; }
.missions h3 { margin: 0; font-size: 1.05rem; display: flex; gap: 0.4rem; align-items: center; }
.missions header span { font-weight: 800; color: #5f9a12; }
.missions__bar { height: 10px; border-radius: 999px; background: #e6f3d3; overflow: hidden; margin-bottom: 0.3rem; }
.missions__bar span { display: block; height: 100%; background: #8ac926; transition: width 0.4s; }
.task { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.7rem; border-radius: 12px; background: var(--bg); border: 0; font: inherit; color: inherit; text-decoration: none; cursor: pointer; text-align: start; }
.task__box { width: 26px; height: 26px; border-radius: 8px; border: 2.5px solid #b8d98a; display: grid; place-items: center; flex-shrink: 0; color: #fff; font-size: 0.75rem; }
.task.done .task__box { background: #8ac926; border-color: #8ac926; }
.task.done .task__t { text-decoration: line-through; color: var(--muted); }
.task__t { flex: 1; font-weight: 700; font-size: 0.9rem; }
.task__xp { font-size: 0.75rem; font-weight: 800; color: #5f9a12; }
.finish { margin-top: 0.4rem; background: #8ac926 !important; border-color: #8ac926 !important; box-shadow: 0 4px 0 #5f9a12; }
.hint { margin: 0; font-size: 0.75rem; color: var(--muted); text-align: center; }
.next { margin-top: 0.3rem; font-weight: 700; font-size: 0.85rem; color: var(--c); text-decoration: none; display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.7rem; border-radius: 12px; background: color-mix(in srgb, var(--c) 8%, #fff); }
@media (max-width: 960px) { .jl__grid { grid-template-columns: minmax(0, 1fr); } .missions { position: static; order: -1; } }
</style>
