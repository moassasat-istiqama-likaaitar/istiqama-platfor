<template>
  <!-- البراعم: الدرس خطوات واحدة تلو الأخرى، بأزرار كبيرة، دون تبويبات -->
  <div class="kl" :style="{ '--c': l.subject.color, '--a': l.subject.accent }">
    <header class="kl__head">
      <RouterLink :to="`/app/subject/${l.subject.id}`" class="kl__x" aria-label="رجوع"><i class="pi pi-times" /></RouterLink>
      <div class="kl__steps">
        <span v-for="n in total" :key="n" :class="{ on: n - 1 <= step, done: n - 1 < step }" />
      </div>
      <span class="kl__count">{{ Math.min(step + 1, total) }}/{{ total }}</span>
    </header>

    <h1 class="kl__title">{{ l.title }}</h1>

    <Transition name="pop" mode="out-in">
      <!-- خطوة محتوى -->
      <section v-if="step < l.contents.length" :key="step" class="kl__card">
        <span class="kl__kind"><i :class="kindIcon[current.type]" /> {{ kindLabel[current.type] }}</span>
        <ContentViewer :item="current" :color="l.subject.color" :accent="l.subject.accent" :art="l.subject.art" />
        <div class="faces">
          <span>هل أعجبك؟</span>
          <button v-for="f in faces" :key="f.n" type="button" class="face" :class="{ on: current.myRating === f.n }" @click="rate(current, f.n)">{{ f.e }}</button>
        </div>
      </section>

      <!-- الخطوة الأخيرة -->
      <section v-else key="end" class="kl__card kl__end">
        <div class="kl__mascot"><Mascot :mood="l.done ? 'happy' : 'normal'" bounce :color="'#ffd54a'" :accent="'var(--c)'" /></div>
        <template v-if="!l.done">
          <h2>أنهيت الدرس؟</h2>
          <button type="button" class="big big--ok" :disabled="completing" @click="finish"><i class="pi pi-check" /> نعم، أنهيته!</button>
        </template>
        <template v-else>
          <h2>أحسنت يا بطل!</h2>
          <RouterLink v-for="a in l.activities" :key="a.id" :to="`/app/activity/${a.id}`" class="big big--play"><i class="pi pi-flag" /> {{ a.type === 'quiz' ? 'العب لعبة الأسئلة' : 'أنجز الواجب' }}</RouterLink>
          <RouterLink v-if="l.next" :to="`/app/lesson/${l.next.id}`" class="big big--next">الدرس التالي <i class="pi pi-arrow-left flip" /></RouterLink>
        </template>
        <button type="button" class="ask" @click="askOpen = !askOpen"><i class="pi pi-comments" /> أسأل معلمي</button>
        <LessonComments v-if="askOpen" :comments="l.comments" title="أسئلتي" placeholder="اكتب سؤالك لمعلمك..." @send="comment" />
      </section>
    </Transition>

    <nav class="kl__nav">
      <button type="button" class="arrow" :disabled="step === 0" @click="go(-1)"><i class="pi pi-arrow-right flip" /></button>
      <button type="button" class="arrow arrow--next" :disabled="step >= total - 1" @click="go(1)"><i class="pi pi-arrow-left flip" /></button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import Mascot from '@/components/art/Mascot.vue'
import LessonComments from '@/components/student/LessonComments.vue'
import { useLesson } from '@/composables/useLesson'
import { chime } from '@/utils/celebrate'

const props = defineProps({ l: { type: Object, required: true } })
const lRef = toRef(props, 'l')
const { completing, complete, rate, comment } = useLesson(lRef)
const step = ref(0)
const askOpen = ref(false)
const total = computed(() => props.l.contents.length + 1)
const current = computed(() => props.l.contents[step.value])
const kindIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file', image: 'pi pi-image' }
const kindLabel = { video: 'شاهد', slides: 'تصفّح', pdf: 'اقرأ', image: 'تأمّل' }
const faces = [{ n: 1, e: '😕' }, { n: 3, e: '🙂' }, { n: 5, e: '😍' }]

function go(d) {
  step.value = Math.max(0, Math.min(total.value - 1, step.value + d))
  chime('tap', 'kids')
}
async function finish() {
  await complete()
}
</script>

<style scoped>
.kl { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.9rem; }
.kl__head { display: flex; align-items: center; gap: 0.8rem; }
.kl__x { width: 48px; height: 48px; border-radius: 50%; background: var(--surface); color: var(--muted); display: grid; place-items: center; text-decoration: none; box-shadow: var(--shadow); font-size: 1.2rem; }
.kl__steps { flex: 1; display: flex; gap: 6px; }
.kl__steps span { flex: 1; height: 16px; border-radius: 999px; background: color-mix(in srgb, var(--c) 15%, #fff); transition: background 0.3s; }
.kl__steps span.on { background: var(--c); }
.kl__count { font-weight: 800; color: var(--muted); font-size: 1.05rem; }
.kl__title { margin: 0; text-align: center; font-size: clamp(1.7rem, 5vw, 2.4rem); color: color-mix(in srgb, var(--c) 70%, #000); }
.kl__card { position: relative; background: var(--surface); border-radius: 32px; padding: 1rem; box-shadow: var(--shadow); }
.kl__kind { position: absolute; top: -14px; inset-inline-start: 24px; z-index: 2; background: var(--c); color: #fff; font-family: var(--font-display); font-weight: 700; padding: 0.3rem 1.1rem; border-radius: 999px; font-size: 1.05rem; display: flex; gap: 0.4rem; align-items: center; }
.faces { display: flex; align-items: center; justify-content: center; gap: 0.6rem; margin-top: 0.9rem; font-weight: 700; color: var(--muted); }
.face { width: 56px; height: 56px; border-radius: 50%; border: 3px solid transparent; background: var(--bg); font-size: 1.8rem; cursor: pointer; transition: transform 0.12s; }
.face:hover { transform: scale(1.12); }
.face.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, #fff); transform: scale(1.15); }
.kl__end { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; }
.kl__mascot { width: 160px; height: 160px; }
.kl__end h2 { margin: 0; font-size: 2rem; }
.big { display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; width: min(420px, 100%); padding: 1.1rem 1.5rem; border-radius: 999px; border: 0; font-family: var(--font-display); font-size: 1.45rem; font-weight: 700; color: #fff; cursor: pointer; text-decoration: none; transition: transform 0.12s; }
.big:active { transform: translateY(5px); }
.big--ok { background: #22b35e; box-shadow: 0 7px 0 #158a43; }
.big--play { background: #9b6bff; box-shadow: 0 7px 0 #6d3fe0; }
.big--next { background: var(--c); box-shadow: 0 7px 0 color-mix(in srgb, var(--c) 60%, #000); }
.ask { border: 0; background: none; color: var(--muted); font: inherit; font-weight: 700; cursor: pointer; display: flex; gap: 0.4rem; align-items: center; margin-top: 0.5rem; }
.kl__end :deep(.lc) { width: 100%; text-align: start; }
.kl__nav { display: flex; justify-content: space-between; }
.arrow { width: 76px; height: 76px; border-radius: 50%; border: 0; background: var(--surface); color: var(--c); font-size: 1.8rem; cursor: pointer; box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 20%, #ddd); }
.arrow i { font-size: 1.8rem; }
.arrow--next { background: var(--c); color: #fff; box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 60%, #000); }
.arrow:disabled { opacity: 0.3; cursor: default; }
.pop-enter-active, .pop-leave-active { transition: all 0.25s; }
.pop-enter-from { opacity: 0; transform: scale(0.94); }
.pop-leave-to { opacity: 0; transform: scale(1.03); }
</style>
