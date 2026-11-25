<template>
  <div v-if="l" class="lv" :style="{ '--c': l.subject.color, '--a': l.subject.accent }">
    <nav class="crumbs">
      <RouterLink to="/app/my-lessons">{{ t('student.nav.lessons') }}</RouterLink>
      <i class="pi pi-angle-left flip" />
      <RouterLink :to="`/app/subject/${l.subject.id}`">{{ l.subject.name }}</RouterLink>
    </nav>

    <header class="lv__head">
      <span class="lv__num">{{ t('student.lesson', { n: l.order }) }}</span>
      <h1>{{ l.title }}</h1>
    </header>

    <div class="lv__grid">
      <div class="lv__main">
        <!-- اختيار المحتوى -->
        <div class="tabs">
          <button v-for="(c, i) in l.contents" :key="c.id" type="button" class="tab" :class="{ on: i === sel }" @click="sel = i">
            <i :class="typeIcon[c.type]" />
            <span class="tab__t">{{ t(`student.types.${c.type}`) }}</span>
            <span class="tab__k" :class="`k-${c.classification}`">{{ t(`student.classification.${c.classification}`) }}</span>
          </button>
        </div>

        <div v-if="current" class="stage">
          <ContentViewer :key="current.id" :item="current" :color="l.subject.color" :accent="l.subject.accent" :art="l.subject.art" @ended="onEnded" />
          <div class="stage__meta">
            <strong>{{ current.title }}</strong>
            <span class="muted"><i class="pi pi-user" /> {{ current.authorName }}</span>
            <div class="rate">
              <span class="muted">{{ t('student.rate') }}</span>
              <button v-for="n in 5" :key="n" type="button" class="star" :class="{ on: n <= (current.myRating || hover) }" @mouseenter="hover = n" @mouseleave="hover = 0" @click="rate(n)">
                <i class="pi pi-star-fill" />
              </button>
            </div>
            <button type="button" class="report" @click="report"><i class="pi pi-flag" /> {{ t('student.report') }}</button>
          </div>
        </div>

        <!-- التعليقات -->
        <section class="comments">
          <h2><i class="pi pi-comments" /> {{ t('student.comments') }} <small class="muted">({{ l.comments.length }})</small></h2>
          <form class="comments__form" @submit.prevent="comment">
            <Avatar :label="auth.initials" shape="circle" class="me" />
            <input v-model="draft" :placeholder="t('student.commentPlaceholder')" />
            <Button type="submit" icon="pi pi-send" rounded :disabled="!draft.trim()" />
          </form>
          <div v-for="c in l.comments" :key="c.id" class="cmt" :class="{ 'cmt--teacher': c.role === 'teacher' }">
            <Avatar :label="c.author.charAt(0)" shape="circle" class="cmt__av" />
            <div class="cmt__bubble">
              <strong>{{ c.author }}</strong> <small class="muted">{{ timeAgo(c.at, t) }}</small>
              <p>{{ c.body }}</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="lv__side">
        <div class="side-card">
          <Button v-if="!l.done" :label="t('student.markDone')" icon="pi pi-check-circle" size="large" class="done-btn" :loading="completing" @click="complete" />
          <div v-else class="done-badge"><i class="pi pi-verified" /> {{ t('student.alreadyDone') }}</div>
        </div>

        <div v-if="l.activities.length" class="side-card">
          <h3><i class="pi pi-pencil" /> {{ t('student.lessonActivities') }}</h3>
          <div class="side-list"><ActivityCard v-for="a in l.activities" :key="a.id" :a="a" /></div>
        </div>

        <div class="side-card nav-card">
          <RouterLink v-if="l.prev" :to="`/app/lesson/${l.prev.id}`" class="nl"><i class="pi pi-arrow-right flip" /><span><small>{{ t('student.prev') }}</small>{{ l.prev.title }}</span></RouterLink>
          <RouterLink v-if="l.next" :to="`/app/lesson/${l.next.id}`" class="nl nl--next"><span><small>{{ t('student.next') }}</small>{{ l.next.title }}</span><i class="pi pi-arrow-left flip" /></RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import ActivityCard from '@/components/student/ActivityCard.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'
import { useAuthStore } from '@/stores/auth'
import { timeAgo } from '@/utils/dates'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const student = useStudentStore()
const auth = useAuthStore()

const l = ref(null)
const sel = ref(0)
const hover = ref(0)
const draft = ref('')
const completing = ref(false)
const typeIcon = { video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const current = computed(() => l.value?.contents[sel.value])

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    l.value = await learning.lesson(student.personId, id)
    const wanted = l.value.contents.findIndex((c) => c.id === route.query.c)
    sel.value = wanted >= 0 ? wanted : 0
  },
  { immediate: true }
)

async function complete() {
  completing.value = true
  try {
    const r = await learning.completeLesson(student.personId, l.value.id)
    l.value.done = true
    student.reward(r)
  } finally {
    completing.value = false
  }
}
function onEnded() {
  if (!l.value.done && sel.value === l.value.contents.length - 1) complete()
}
async function rate(n) {
  current.value.myRating = n
  await learning.rateContent(student.personId, current.value.id, n)
  toast.add({ severity: 'success', summary: t('student.thanksRating'), life: 1500 })
}
function report() {
  toast.add({ severity: 'info', summary: t('student.reportSent'), life: 2000 })
}
async function comment() {
  const r = await learning.addComment(student.personId, l.value.id, draft.value.trim())
  l.value.comments.unshift(r.comment)
  draft.value = ''
  if (r.badges.length) student.reward({ badges: r.badges })
}
</script>

<style scoped>
.lv { display: flex; flex-direction: column; gap: 1rem; }
.crumbs { display: flex; gap: 0.5rem; align-items: center; font-weight: 700; font-size: 0.9rem; }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:last-child { color: var(--c); }
.crumbs i { font-size: 0.7rem; color: var(--muted); }
.lv__head h1 { margin: 0; font-size: clamp(1.6rem, 4vw, 2.4rem); line-height: 1.2; }
.lv__num { display: inline-block; font-weight: 800; color: var(--c); background: color-mix(in srgb, var(--c) 12%, #fff); padding: 0.1rem 0.7rem; border-radius: 999px; font-size: 0.85rem; margin-bottom: 0.35rem; }
.lv__grid { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 1.25rem; align-items: start; }
.lv__main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }

.tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 2px; }
.tab { display: flex; align-items: center; gap: 0.45rem; padding: 0.55rem 0.9rem; border-radius: var(--radius); border: 2px solid var(--line); background: var(--surface); cursor: pointer; font: inherit; font-weight: 700; color: var(--ink); white-space: nowrap; transition: all 0.15s; }
.tab i { color: var(--c); }
.tab.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, #fff); }
.tab__k { font-size: 0.66rem; padding: 0 0.45rem; border-radius: 999px; }
.k-main { background: color-mix(in srgb, var(--c) 18%, #fff); color: color-mix(in srgb, var(--c) 80%, #000); }
.k-enrichment { background: #fff3c9; color: #8a5f00; }

.stage { background: var(--surface); border-radius: var(--radius-lg); padding: 0.75rem; box-shadow: var(--shadow); }
.stage__meta { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; padding: 0.75rem 0.4rem 0.2rem; }
.stage__meta strong { flex: 1 1 100%; font-size: 1.05rem; }
.rate { display: flex; align-items: center; gap: 0.15rem; margin-inline-start: auto; }
.rate .muted { font-size: 0.8rem; margin-inline-end: 0.35rem; }
.star { border: 0; background: none; cursor: pointer; color: #d9d9e3; font-size: 1.15rem; padding: 0.1rem; transition: transform 0.1s; }
.star:hover { transform: scale(1.2); }
.star.on { color: #f5a400; }
.report { border: 0; background: none; color: var(--muted); cursor: pointer; font: inherit; font-size: 0.8rem; display: flex; gap: 0.3rem; align-items: center; }

.comments { background: var(--surface); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow); }
.comments h2 { font-size: 1.1rem; margin: 0 0 0.9rem; display: flex; gap: 0.5rem; align-items: center; }
.comments h2 i { color: var(--c); }
.comments__form { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem; }
.comments__form input { flex: 1; padding: 0.7rem 1rem; border-radius: 999px; border: 2px solid var(--line); font: inherit; background: var(--bg); color: var(--ink); outline: none; }
.comments__form input:focus { border-color: var(--c); }
.me, .cmt__av { background: var(--c); color: #fff; font-weight: 800; flex-shrink: 0; }
.cmt { display: flex; gap: 0.6rem; margin-bottom: 0.75rem; }
.cmt__bubble { background: var(--bg); padding: 0.6rem 0.9rem; border-radius: 16px; border-start-start-radius: 4px; flex: 1; }
.cmt--teacher .cmt__bubble { background: color-mix(in srgb, var(--c) 10%, #fff); }
.cmt--teacher .cmt__av { background: var(--a); }
.cmt__bubble p { margin: 0.2rem 0 0; }

.lv__side { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 84px; }
.side-card { background: var(--surface); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow); }
.side-card h3 { margin: 0 0 0.7rem; font-size: 1rem; display: flex; gap: 0.4rem; align-items: center; }
.side-card h3 i { color: var(--c); }
.side-list { display: flex; flex-direction: column; gap: 0.5rem; }
.side-list :deep(.act) { box-shadow: none; border: 1px solid var(--line); border-inline-start-width: 5px; }
.done-btn { width: 100%; background: var(--c) !important; border-color: var(--c) !important; font-size: 1.05rem !important; padding: 0.9rem !important; box-shadow: 0 5px 0 color-mix(in srgb, var(--c) 60%, #000); }
.done-badge { display: flex; gap: 0.5rem; align-items: center; justify-content: center; padding: 0.8rem; border-radius: var(--radius); background: #dcf7e3; color: #16803c; font-weight: 800; }
.nav-card { display: flex; flex-direction: column; gap: 0.5rem; }
.nl { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.75rem; border-radius: var(--radius); text-decoration: none; color: inherit; background: var(--bg); font-weight: 700; }
.nl small { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 600; }
.nl--next { justify-content: space-between; background: color-mix(in srgb, var(--c) 10%, #fff); }
.nl i { color: var(--c); }
@media (max-width: 980px) {
  .lv__grid { grid-template-columns: 1fr; }
  .lv__side { position: static; }
}
</style>
