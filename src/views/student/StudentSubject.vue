<template>
  <div v-if="s" class="ss" :style="{ '--c': s.color, '--a': s.accent }">
    <RouterLink to="/app/my-lessons" class="back"><i class="pi pi-arrow-right flip" /> {{ t('student.nav.lessons') }}</RouterLink>

    <header class="ss__hero">
      <div class="ss__art"><LessonArt :kind="s.art" :color="s.color" :accent="s.accent" bare /></div>
      <div class="ss__info">
        <h1>{{ s.name }}</h1>
        <p>{{ t('student.lessonsDone', { done: s.doneCount, total: s.lessonsCount }) }}</p>
        <div class="bar bar--lg" :style="{ '--bar-color': '#fff' }"><span :style="{ width: s.progress + '%' }" /></div>
      </div>
      <ProgressRing :value="s.progress" :size="92" color="#fff" track="rgba(255,255,255,0.25)" class="ss__ring" />
    </header>

    <!-- رحلة (للطورين الأولين) -->
    <div v-if="playful" class="path">
      <div v-for="(l, i) in s.lessons" :key="l.id" class="node" :class="`node--${l.state}`" :style="{ '--x': offset(i) }">
        <RouterLink :to="`/app/lesson/${l.id}`" class="node__btn" @click="tap">
          <i v-if="l.state === 'done'" class="pi pi-star-fill" />
          <i v-else-if="l.state === 'current'" class="pi pi-play" />
          <span v-else>{{ l.order }}</span>
        </RouterLink>
        <RouterLink :to="`/app/lesson/${l.id}`" class="node__card">
          <span v-if="l.state === 'current'" class="node__here">{{ t('student.current') }}</span>
          <strong>{{ l.title }}</strong>
          <span class="node__meta">
            <i v-for="ty in l.types" :key="ty" :class="typeIcon[ty]" />
            <span>· {{ t('student.minutes', { n: l.minutes }) }}</span>
            <span v-if="l.isNew && l.state !== 'done'" class="new">{{ t('student.new') }}</span>
          </span>
        </RouterLink>
      </div>
      <div class="path__end"><i class="pi pi-trophy" /></div>
    </div>

    <!-- قائمة (للشباب) -->
    <ol v-else class="tl">
      <li v-for="l in s.lessons" :key="l.id" :class="`tl--${l.state}`">
        <RouterLink :to="`/app/lesson/${l.id}`" class="tl__row">
          <span class="tl__mark">
            <i v-if="l.state === 'done'" class="pi pi-check" />
            <span v-else>{{ l.order }}</span>
          </span>
          <div class="tl__body">
            <strong>{{ l.title }} <span v-if="l.isNew && l.state !== 'done'" class="new">{{ t('student.new') }}</span></strong>
            <span class="tl__meta">
              <span v-for="ty in l.types" :key="ty" class="tl__type"><i :class="typeIcon[ty]" /> {{ t(`student.types.${ty}`) }}</span>
              <span>· {{ t('student.minutes', { n: l.minutes }) }}</span>
            </span>
          </div>
          <span class="tl__state">{{ t(`student.${l.state}`) }}</span>
        </RouterLink>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LessonArt from '@/components/art/LessonArt.vue'
import ProgressRing from '@/components/student/ProgressRing.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'
import { chime } from '@/utils/celebrate'

const { t } = useI18n()
const route = useRoute()
const student = useStudentStore()
const s = ref(null)
const playful = computed(() => ['kids', 'juniors'].includes(student.theme))
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const offset = (i) => `${[0, 70, 110, 70, 0, -70, -110, -70][i % 8]}px`
const tap = () => chime('tap', student.theme)

watch(() => route.params.id, async (id) => { if (id) s.value = await learning.subject(student.personId, id) }, { immediate: true })
</script>

<style scoped>
.ss { display: flex; flex-direction: column; gap: 1.25rem; }
.back { color: var(--muted); text-decoration: none; font-weight: 700; display: inline-flex; gap: 0.4rem; align-items: center; }
.ss__hero { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; border-radius: var(--radius-lg); background: linear-gradient(120deg, var(--c), color-mix(in srgb, var(--c) 60%, #1a1030)); color: #fff; box-shadow: 0 14px 34px color-mix(in srgb, var(--c) 35%, transparent); }
.ss__art { width: 150px; aspect-ratio: 200 / 140; background: rgba(255, 255, 255, 0.92); border-radius: var(--radius); flex-shrink: 0; }
.ss__info { flex: 1; min-width: 0; }
.ss__info h1 { margin: 0; font-size: clamp(1.5rem, 4vw, 2.2rem); }
.ss__info p { margin: 0.2rem 0 0.7rem; opacity: 0.9; }
.bar--lg { height: 12px; background: rgba(255, 255, 255, 0.25); }
.ss__ring { color: #fff; }

/* الرحلة */
.path { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.4rem; padding: 1rem 0 2rem; }
.path::before { content: ''; position: absolute; top: 20px; bottom: 40px; width: 6px; border-radius: 6px; background: repeating-linear-gradient(to bottom, color-mix(in srgb, var(--c) 30%, transparent) 0 14px, transparent 14px 26px); }
.node { position: relative; display: flex; align-items: center; gap: 1rem; transform: translateX(var(--x)); width: min(520px, 100%); }
.node__btn { position: relative; z-index: 1; flex-shrink: 0; display: grid; place-items: center; width: 76px; height: 76px; border-radius: 50%; text-decoration: none; font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; background: #fff; color: var(--c); border: 4px solid color-mix(in srgb, var(--c) 30%, #fff); box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 25%, #ddd); transition: transform 0.15s; }
.node__btn:active { transform: translateY(4px); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 25%, #ddd); }
.node--done .node__btn { background: var(--a); color: #fff; border-color: #fff; box-shadow: 0 6px 0 color-mix(in srgb, var(--a) 60%, #000); }
.node--current .node__btn { background: var(--c); color: #fff; border-color: #fff; box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 60%, #000), 0 0 0 10px color-mix(in srgb, var(--c) 18%, transparent); animation: pulse 1.8s infinite; }
.node__btn i { font-size: 1.6rem; }
@keyframes pulse { 0%, 100% { box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 60%, #000), 0 0 0 6px color-mix(in srgb, var(--c) 22%, transparent); } 50% { box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 60%, #000), 0 0 0 16px color-mix(in srgb, var(--c) 6%, transparent); } }
.node__card { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.7rem 1rem; border-radius: var(--radius); background: var(--surface); text-decoration: none; color: inherit; box-shadow: var(--shadow); }
.node__card strong { font-family: var(--font-display); font-size: 1.05rem; }
.node__here { align-self: flex-start; font-size: 0.7rem; font-weight: 800; color: #fff; background: var(--c); padding: 0 0.55rem; border-radius: 999px; }
.node__meta { display: flex; gap: 0.4rem; align-items: center; color: var(--muted); font-size: 0.8rem; }
.new { background: #ef4444; color: #fff; font-size: 0.66rem; font-weight: 800; padding: 0 0.45rem; border-radius: 999px; }
.path__end { position: relative; z-index: 1; display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #ffd54a, #ff9f1c); color: #fff; box-shadow: 0 6px 0 #c77700; }
.path__end i { font-size: 1.6rem; }

/* قائمة الشباب */
.tl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.tl__row { display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.1rem; background: var(--surface); border-radius: var(--radius); text-decoration: none; color: inherit; box-shadow: var(--shadow); border: 1.5px solid transparent; transition: border-color 0.15s; }
.tl__row:hover { border-color: var(--c); }
.tl__mark { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-weight: 800; background: color-mix(in srgb, var(--c) 10%, #fff); color: var(--c); flex-shrink: 0; }
.tl--done .tl__mark { background: var(--c); color: #fff; }
.tl--current .tl__row { border-color: var(--c); }
.tl__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.tl__meta { display: flex; gap: 0.6rem; flex-wrap: wrap; color: var(--muted); font-size: 0.8rem; }
.tl__type i { font-size: 0.75rem; }
.tl__state { font-size: 0.78rem; font-weight: 700; color: var(--muted); }
.tl--current .tl__state { color: var(--c); }
@media (max-width: 560px) {
  .ss__art, .ss__ring { display: none; }
  .node { transform: translateX(calc(var(--x) * 0.35)); }
  .node__btn { width: 64px; height: 64px; }
}
</style>
