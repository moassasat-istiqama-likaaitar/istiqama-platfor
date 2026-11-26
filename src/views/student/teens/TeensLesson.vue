<template>
  <!-- الشباب: وضع القراءة + لوحة جانبية للمحتويات والملاحظات الشخصية -->
  <div class="tl" :style="{ '--c': l.subject.color }">
    <header class="tl__head">
      <div class="crumbs">
        <RouterLink :to="`/app/subject/${l.subject.id}`">{{ l.subject.name }}</RouterLink>
        <span>/</span><span>{{ l.axis }}</span>
      </div>
      <h1>{{ l.title }}</h1>
      <div class="tl__meta">
        <span><i class="pi pi-clock" /> {{ l.minutes }} دقيقة</span>
        <span><i class="pi pi-folder" /> {{ l.contents.length }} محتويات</span>
        <span v-if="l.done" class="ok"><i class="pi pi-check-circle" /> مكتمل</span>
        <button v-else type="button" class="mark" :disabled="completing" @click="complete"><i class="pi pi-check" /> تعليم كمكتمل</button>
      </div>
    </header>

    <div class="tl__grid">
      <article class="tl__reader">
        <ContentViewer :key="current.id" :item="current" :color="l.subject.color" :accent="l.subject.accent" :art="l.subject.art" />
        <div class="tl__bar">
          <strong>{{ current.title }}</strong>
          <span class="muted">{{ current.authorName }}</span>
          <span class="rate"><button v-for="n in 5" :key="n" type="button" :class="{ on: n <= (current.myRating || 0) }" @click="rate(current, n)"><i class="pi pi-star-fill" /></button></span>
          <button type="button" class="rep" @click="report"><i class="pi pi-flag" /></button>
        </div>
        <div class="tl__pn">
          <RouterLink v-if="l.prev" :to="`/app/lesson/${l.prev.id}`"><i class="pi pi-arrow-right flip" /> {{ l.prev.title }}</RouterLink><span v-else />
          <RouterLink v-if="l.next" :to="`/app/lesson/${l.next.id}`">{{ l.next.title }} <i class="pi pi-arrow-left flip" /></RouterLink>
        </div>
        <section class="tl__comments"><LessonComments :comments="l.comments" title="النقاش" placeholder="شارك سؤالاً أو فكرة..." @send="comment" /></section>
      </article>

      <aside class="tl__side">
        <section class="sp">
          <h3>محتويات الدرس</h3>
          <button v-for="(c, i) in l.contents" :key="c.id" type="button" class="ci" :class="{ on: sel === i }" @click="sel = i">
            <i :class="typeIcon[c.type]" />
            <span>{{ c.title }}</span>
            <small>{{ t(`student.classification.${c.classification}`) }}</small>
          </button>
        </section>
        <section v-if="l.activities.length" class="sp">
          <h3>الأعمال المطلوبة</h3>
          <RouterLink v-for="a in l.activities" :key="a.id" :to="`/app/activity/${a.id}`" class="ai">
            <span>{{ a.type === 'quiz' ? 'تقييم' : 'واجب' }}</span>
            <span class="ai__s" :class="`s-${a.state}`">{{ t(`student.state.${a.state}`) }}<template v-if="a.score !== null"> · {{ a.score }}/{{ a.maxScore }}</template></span>
          </RouterLink>
        </section>
        <section class="sp notes">
          <h3><i class="pi pi-pencil" /> ملاحظاتي <small v-if="savedAt" class="muted">· حُفظت</small></h3>
          <textarea v-model="note" placeholder="دوّن أفكارك وأسئلتك حول الدرس... (خاصة بك)" @input="queueSave" />
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import LessonComments from '@/components/student/LessonComments.vue'
import { useLesson } from '@/composables/useLesson'

const props = defineProps({ l: { type: Object, required: true }, initial: { type: Number, default: 0 } })
const { t } = useI18n()
const lRef = toRef(props, 'l')
const { completing, complete, rate, comment, saveNote, report } = useLesson(lRef)
const sel = ref(props.initial)
const current = computed(() => props.l.contents[sel.value])
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const note = ref(props.l.note || '')
const savedAt = ref(null)
let timer
function queueSave() {
  clearTimeout(timer)
  savedAt.value = null
  timer = setTimeout(async () => {
    const r = await saveNote(note.value)
    savedAt.value = r.savedAt
  }, 700)
}
</script>

<style scoped>
.tl { display: flex; flex-direction: column; gap: 1rem; }
.crumbs { display: flex; gap: 0.4rem; font-size: 0.8rem; color: var(--muted); flex-wrap: wrap; }
.crumbs a { color: var(--c); text-decoration: none; font-weight: 700; }
.tl__head h1 { margin: 0.25rem 0 0.4rem; font-size: clamp(1.4rem, 3.5vw, 1.9rem); }
.tl__meta { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; font-size: 0.85rem; color: var(--muted); }
.tl__meta .ok { color: #15803d; font-weight: 700; }
.mark { border: 1px solid var(--line); background: var(--surface); padding: 0.35rem 0.8rem; border-radius: 8px; font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; color: var(--ink); display: flex; gap: 0.35rem; align-items: center; }
.mark:hover { border-color: var(--c); color: var(--c); }
.tl__grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 1.1rem; align-items: start; }
.tl__reader { display: flex; flex-direction: column; gap: 0.8rem; min-width: 0; }
.tl__bar { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; padding-bottom: 0.7rem; border-bottom: 1px solid var(--line); }
.tl__bar strong { flex: 1 1 auto; }
.rate button { border: 0; background: none; color: #d9d9e3; cursor: pointer; padding: 0 1px; }
.rate button.on { color: #f5a400; }
.rep { border: 0; background: none; color: var(--muted); cursor: pointer; }
.tl__pn { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.85rem; }
.tl__pn a { color: var(--muted); text-decoration: none; display: flex; gap: 0.35rem; align-items: center; }
.tl__pn a:hover { color: var(--c); }
.tl__comments { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1rem; }
.tl__side { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 0.8rem; }
.sp { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 0.85rem; }
.sp h3 { margin: 0 0 0.6rem; font-size: 0.85rem; display: flex; gap: 0.4rem; align-items: center; }
.ci { width: 100%; display: grid; grid-template-columns: auto 1fr; gap: 0 0.55rem; padding: 0.5rem 0.6rem; border: 0; border-radius: 8px; background: none; cursor: pointer; text-align: start; font: inherit; color: inherit; }
.ci i { grid-row: span 2; color: var(--muted); margin-top: 0.25rem; }
.ci span { font-size: 0.85rem; font-weight: 600; }
.ci small { font-size: 0.7rem; color: var(--muted); }
.ci.on { background: color-mix(in srgb, var(--c) 9%, #fff); }
.ci.on i { color: var(--c); }
.ai { display: flex; justify-content: space-between; padding: 0.45rem 0.2rem; text-decoration: none; color: inherit; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--line); }
.ai:last-child { border-bottom: 0; }
.ai__s { font-size: 0.75rem; color: var(--muted); }
.s-late { color: #b42318; font-weight: 700; }
.s-graded { color: #15803d; }
.notes textarea { width: 100%; min-height: 160px; resize: vertical; border: 1px solid var(--line); border-radius: 8px; padding: 0.6rem; font: inherit; font-size: 0.88rem; background: #fffdf3; color: var(--ink); outline: none; line-height: 1.8; }
.notes textarea:focus { border-color: var(--c); }
@media (max-width: 960px) { .tl__grid { grid-template-columns: 1fr; } .tl__side { position: static; } }
</style>
