<template>
  <!-- ST07/ST08: الواجب / الاختبار — الإجابة بالأنواع الثمانية، والنتيجة وتفصيل كل سؤال -->
  <div v-if="a" class="av" :class="`av--${theme}`" :style="{ '--c': a.subject?.color || 'var(--brand)' }">
    <RouterLink to="/app/my-assignments" class="back"><i class="pi pi-arrow-right flip" /> {{ t('student.backToAssignments') }}</RouterLink>

    <header class="av__head">
      <span class="av__icon" :class="`av__icon--${a.type}`"><i :class="a.type === 'quiz' ? 'pi pi-question-circle' : 'pi pi-file-edit'" /></span>
      <div>
        <small>{{ t(`student.types.${a.type}`) }} · {{ a.subject?.name }}</small>
        <h1>{{ a.title }}</h1>
        <div class="av__chips">
          <span class="chip" :data-hue="due.hue"><i class="pi pi-clock" /> {{ due.text }}</span>
          <span v-if="a.required" class="chip" data-hue="red">{{ t('student.required') }}</span>
          <RouterLink v-if="a.lesson" :to="`/app/lesson/${a.lesson.id}`" class="chip"><i class="pi pi-book" /> {{ a.lesson.title }}</RouterLink>
        </div>
      </div>
    </header>

    <!-- ===================== Quiz ===================== -->
    <template v-if="a.type === 'quiz'">
      <!-- النتيجة والمراجعة -->
      <section v-if="a.submission" class="card result">
        <div class="result__top">
          <ProgressRing :value="Math.round((a.submission.score / a.maxScore) * 100)" :size="130" :stroke="13" :color="scoreColor">
            <div class="result__score"><b>{{ a.submission.score }}</b><small>/ {{ a.maxScore }}</small></div>
          </ProgressRing>
          <div>
            <h2>{{ a.submission.status === 'submitted' ? 'النتيجة الأولية' : t('student.score') }}</h2>
            <p class="muted">{{ correctCount }} / {{ a.questions.length }} ✓</p>
            <p v-if="a.submission.status === 'submitted'" class="waiting"><i class="pi pi-clock" /> بعض الأسئلة بانتظار تصحيح المعلم</p>
            <p v-else-if="a.submission.note" class="muted">ملاحظة المعلم: {{ a.submission.note }}</p>
            <RouterLink v-if="a.lesson" :to="`/app/lesson/${a.lesson.id}`"><Button :label="t('student.retryLater')" icon="pi pi-replay" severity="secondary" outlined size="small" /></RouterLink>
          </div>
        </div>
        <ol class="review">
          <li v-for="(q, i) in a.questions" :key="i" :class="reviewState(i)">
            <div class="review__q"><i :class="{ ok: 'pi pi-check-circle', ko: 'pi pi-times-circle', part: 'pi pi-minus-circle', wait: 'pi pi-clock' }[reviewState(i)]" /> <span>{{ q.q }}</span><small class="pts">{{ ptsText(i) }}</small></div>
            <div class="review__a">
              <span>{{ t('student.yourAnswer') }}: <b>{{ answerText(q, a.submission.answers[i]) }}</b></span>
              <span v-if="reviewState(i) !== 'ok' && reviewState(i) !== 'wait'">{{ t('student.rightAnswer') }}: <b>{{ correctText(q) }}</b></span>
              <span v-if="reviewState(i) === 'wait'">بانتظار تصحيح المعلم</span>
              <span v-if="q.explain" class="exp">💡 {{ q.explain }}</span>
            </div>
          </li>
        </ol>
      </section>

      <!-- البداية -->
      <section v-else-if="step === -1" class="card intro">
        <div v-if="theme === 'kids'" class="intro__mascot"><Mascot mood="think" bounce :color="'#ffd54a'" :accent="'var(--c)'" /></div>
        <h2>{{ a.questions.length }} {{ t('student.types.quiz') }} · {{ a.maxScore }} {{ t('student.points') }}</h2>
        <Button :label="t('student.startQuiz')" icon="pi pi-play" size="large" class="big" @click="step = 0" />
      </section>

      <!-- الأسئلة -->
      <section v-else class="card quiz">
        <!-- الشباب: شبكة التنقل بين الأسئلة -->
        <div v-if="theme === 'teens'" class="qnav">
          <button v-for="(qq, i) in a.questions" :key="i" type="button" :class="{ on: i === step, ans: isAnswered(i), flag: flags[i] }" @click="step = i">{{ i + 1 }}</button>
          <button type="button" class="qnav__flag" :class="{ on: flags[step] }" @click="flags[step] = !flags[step]"><i class="pi pi-flag" /> مراجعة لاحقاً</button>
        </div>
        <div class="quiz__progress">
          <span>{{ t('student.question', { n: step + 1, total: a.questions.length }) }}
            <span v-if="theme === 'juniors'" class="xp-chip"><i class="pi pi-clock" /> {{ fmt(elapsed) }}</span>
          </span>
          <div class="bar" :style="{ '--bar-color': 'var(--c)' }"><span :style="{ width: ((step + 1) / a.questions.length) * 100 + '%' }" /></div>
        </div>
        <Transition name="q" mode="out-in">
          <div :key="step">
            <h2 class="quiz__q">{{ q.q }}</h2>
            <QuestionField v-if="!isChoice(q)" v-model="answers[step]" :q="q" class="qfield" />
            <div v-else class="opts" :class="{ 'opts--two': q.options.length === 2 }">
              <button v-for="(o, k) in q.options" :key="k" type="button" class="opt" :class="[`opt--${k}`, { on: answers[step] === k, right: feedback && feedback.answer === k, wrong: feedback && !feedback.correct && answers[step] === k }]" :disabled="!!feedback" @click="pick(k)">
                <span class="opt__k">{{ letters[k] }}</span><span>{{ o }}</span>
              </button>
            </div>
          </div>
        </Transition>
        <div v-if="feedback" class="fb" :class="feedback.correct ? 'fb--ok' : 'fb--ko'">
          <i :class="feedback.correct ? 'pi pi-check-circle' : 'pi pi-heart'" /> {{ feedback.correct ? 'أحسنت! إجابة صحيحة' : 'لا بأس، الإجابة الصحيحة ملوّنة بالأخضر' }}
        </div>
        <div v-if="theme !== 'kids' || !isChoice(q)" class="quiz__nav">
          <Button v-if="step > 0" :label="t('common.back')" text severity="secondary" @click="step--" />
          <span />
          <Button v-if="step < a.questions.length - 1" :label="t('student.nextQ')" icon="pi pi-arrow-left flip" icon-pos="right" :disabled="!isAnswered(step)" @click="step++" />
          <Button v-else :label="t('student.finish')" icon="pi pi-check" :disabled="!a.questions.every((_, i) => isAnswered(i))" :loading="sending" @click="sendQuiz" />
        </div>
      </section>
    </template>

    <!-- ===================== واجب منزلي ===================== -->
    <template v-else>
      <div class="hw">
        <section class="card">
          <h2><i class="pi pi-list" /> {{ t('student.instructions') }}</h2>
          <p class="pre">{{ a.instructions }}</p>
          <h3>{{ t('student.attachments') }}</h3>
          <button v-for="f in a.attachments" :key="f.name" type="button" class="file" @click="soon">
            <i class="pi pi-file-pdf" /><span>{{ f.name }}</span><small>{{ f.size }}</small><i class="pi pi-download" />
          </button>
        </section>

        <section class="card">
          <h2><i class="pi pi-send" /> {{ t('student.myAnswer') }}</h2>
          <template v-if="!a.submission">
            <Textarea v-model="text" :placeholder="t('student.writeAnswer')" rows="5" auto-resize fluid />
            <label class="upload">
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" @change="onFiles" />
              <i class="pi pi-paperclip" /> {{ t('student.attachFile') }}
            </label>
            <div v-if="files.length" class="files">
              <span v-for="(f, i) in files" :key="i" class="chip"><i class="pi pi-file" /> {{ f }} <i class="pi pi-times x" @click="files.splice(i, 1)" /></span>
            </div>
            <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
            <Button :label="t('student.submit')" icon="pi pi-send" size="large" class="big" :loading="sending" @click="sendHomework" />
          </template>
          <template v-else>
            <div class="sub">
              <p v-if="a.submission.text" class="pre">{{ a.submission.text }}</p>
              <span v-for="f in a.submission.files" :key="f" class="chip"><i class="pi pi-image" /> {{ f }}</span>
              <small class="muted">{{ t('student.submittedAt', { d: gregorian(a.submission.at, locale) }) }}</small>
            </div>
            <div v-if="a.submission.status === 'submitted'" class="waiting"><i class="pi pi-clock" /> {{ t('student.state.submitted') }}</div>
            <div v-else class="graded">
              <div class="graded__score">{{ a.submission.score }}<small>/{{ a.maxScore }}</small></div>
              <div>
                <strong>{{ t('student.teacherNote') }}</strong>
                <p>{{ a.submission.note }}</p>
              </div>
            </div>
            <div v-if="a.modelAnswer" class="model"><strong>{{ t('student.modelAnswer') }}</strong><p class="pre">{{ a.modelAnswer }}</p></div>
          </template>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Mascot from '@/components/art/Mascot.vue'
import ProgressRing from '@/components/student/ProgressRing.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'
import { dueInfo } from '@/utils/due'
import { gregorian } from '@/utils/dates'
import { chime } from '@/utils/celebrate'
import QuestionField from '@/components/quiz/QuestionField.vue'
import { qtype, answerText, correctText } from '@/utils/quiz'

const { t, locale } = useI18n()
const route = useRoute()
const toast = useToast()
const student = useStudentStore()

const a = ref(null)
const step = ref(-1)
const answers = ref([])
const text = ref('')
const files = ref([])
const sending = ref(false)
const error = ref('')
const letters = ['أ', 'ب', 'ج', 'د']
const theme = computed(() => student.theme)
const feedback = ref(null)
const flags = ref([])
const elapsed = ref(0)
let clock
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
watch(step, (v) => {
  feedback.value = null
  if (v === 0 && !clock) clock = setInterval(() => elapsed.value++, 1000)
})
onBeforeUnmount(() => clearInterval(clock))

const q = computed(() => a.value?.questions?.[step.value] || { q: '', options: [] })
const due = computed(() => dueInfo(a.value.due, t))
const pq = (i) => a.value?.submission?.perQuestion?.[i]
const correctCount = computed(() => a.value?.questions?.filter((x, i) => (pq(i) ? pq(i).correct : a.value.submission?.answers[i] === x.answer)).length || 0)
const isChoice = (x) => ['mcq', 'tf'].includes(qtype(x))
function isAnswered(i) {
  const v = answers.value[i]
  const x = a.value?.questions?.[i]
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v)) {
    if (qtype(x) === 'multi') return v.length > 0
    const n = x.lefts?.length || x.items?.length || x.blanks || v.length
    return v.filter((y) => y !== undefined && y !== null && y !== '').length >= n
  }
  return true
}
function reviewState(i) {
  const r = pq(i)
  if (!r) return a.value.submission.answers[i] === a.value.questions[i].answer ? 'ok' : 'ko'
  if (r.manual) return 'wait'
  return r.correct ? 'ok' : r.score > 0 ? 'part' : 'ko'
}
function ptsText(i) {
  const r = pq(i)
  if (!r) return ''
  return r.manual ? `— / ${r.max}` : `${r.score} / ${r.max}`
}
const scoreColor = computed(() => {
  const r = a.value.submission.score / a.value.maxScore
  return r >= 0.8 ? '#16a34a' : r >= 0.5 ? '#f59e0b' : '#ef4444'
})

async function load(id) {
  a.value = await learning.activity(student.personId, id)
  step.value = -1
  answers.value = []
  feedback.value = null
}
watch(() => route.params.id, (id) => id && load(id), { immediate: true })

async function pick(k) {
  answers.value[step.value] = k
  answers.value = [...answers.value]
  if (theme.value !== 'kids') return chime('tap', theme.value)
  // البراعم: تصحيح فوري لكل سؤال، ثم الانتقال تلقائياً
  feedback.value = await learning.checkAnswer(a.value.id, step.value, k)
  chime(feedback.value.correct ? 'success' : 'error', 'kids')
  setTimeout(() => {
    if (step.value < a.value.questions.length - 1) step.value++
    else sendQuiz()
  }, 1400)
}
async function sendQuiz() {
  sending.value = true
  try {
    const r = await learning.submitQuiz(student.personId, a.value.id, answers.value)
    await load(a.value.id)
    student.reward(r)
  } finally {
    sending.value = false
  }
}
function onFiles(e) {
  files.value.push(...[...e.target.files].map((f) => f.name))
  e.target.value = ''
}
async function sendHomework() {
  error.value = ''
  sending.value = true
  try {
    const r = await learning.submitHomework(student.personId, a.value.id, { text: text.value, files: files.value })
    await load(a.value.id)
    student.reward(r, t('student.submitted'))
  } catch (e) {
    error.value = e.message
  } finally {
    sending.value = false
  }
}
const soon = () => toast.add({ severity: 'info', summary: t('common.comingSoon'), life: 1800 })
</script>

<style scoped>
.av { display: flex; flex-direction: column; gap: 1rem; max-width: 920px; margin: 0 auto; width: 100%; }
.back { color: var(--muted); text-decoration: none; font-weight: 700; display: inline-flex; gap: 0.4rem; align-items: center; }
.av__head { display: flex; gap: 1rem; align-items: flex-start; }
.av__head small { color: var(--c); font-weight: 800; }
.av__head h1 { margin: 0.1rem 0 0.5rem; font-size: clamp(1.4rem, 4vw, 2rem); line-height: 1.25; }
.av__icon { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 18px; flex-shrink: 0; }
.av__icon i { font-size: 1.6rem; }
.av__icon--quiz { background: #ece6ff; color: #6a3fe0; }
.av__icon--homework { background: #ffe9d4; color: #d0570c; }
.av__chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.av__chips a { text-decoration: none; }
.card { background: var(--surface); border-radius: var(--radius-lg); padding: clamp(1rem, 3vw, 1.75rem); box-shadow: var(--shadow); }
.card h2 { margin: 0 0 0.75rem; font-size: 1.15rem; display: flex; gap: 0.5rem; align-items: center; }
.card h2 i { color: var(--c); }
.big { margin-top: 1rem; width: 100%; font-size: 1.1rem !important; padding: 0.9rem !important; background: var(--c) !important; border-color: var(--c) !important; box-shadow: 0 5px 0 color-mix(in srgb, var(--c) 60%, #000); }

.intro { text-align: center; }
.intro__mascot { width: 150px; height: 150px; margin: 0 auto; }
.intro .big { max-width: 320px; }

.quiz__progress { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 800; color: var(--muted); margin-bottom: 1.25rem; }
.quiz__q { font-size: clamp(1.25rem, 3.5vw, 1.7rem) !important; line-height: 1.4; margin-bottom: 1.25rem !important; }
.opts { display: grid; gap: 0.75rem; }
.opts--two { grid-template-columns: 1fr 1fr; }
.opt { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.1rem; border-radius: var(--radius); border: 2.5px solid var(--line); background: var(--surface); cursor: pointer; font: inherit; font-size: 1.08rem; font-weight: 700; color: var(--ink); text-align: start; box-shadow: 0 4px 0 var(--line); transition: all 0.12s; }
.opt:hover { border-color: color-mix(in srgb, var(--c) 50%, var(--line)); }
.opt:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--line); }
.opt.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, #fff); box-shadow: 0 4px 0 color-mix(in srgb, var(--c) 45%, #fff); }
.opt__k { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--bg); font-weight: 800; flex-shrink: 0; }
.opt.on .opt__k { background: var(--c); color: #fff; }
.qnav { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; padding-bottom: 0.9rem; border-bottom: 1px solid var(--line); }
.qnav button { min-width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: inherit; font-weight: 700; cursor: pointer; color: var(--ink); }
.qnav button.ans { background: color-mix(in srgb, var(--c) 12%, #fff); border-color: var(--c); }
.qnav button.on { outline: 2px solid var(--c); }
.qnav button.flag { border-color: #f59e0b; color: #b45309; }
.qnav__flag { margin-inline-start: auto; padding: 0 0.7rem; font-size: 0.8rem !important; }
.qnav__flag.on { background: #fff7e6 !important; border-color: #f59e0b !important; }
.xp-chip { margin-inline-start: 0.6rem; font-size: 0.75rem; background: #effad9; color: #5f9a12; padding: 0.1rem 0.6rem; border-radius: 999px; }
.fb { margin-top: 1rem; padding: 0.9rem 1.1rem; border-radius: var(--radius); font-weight: 800; font-size: 1.15rem; display: flex; gap: 0.5rem; align-items: center; animation: bounce 0.4s; }
.fb--ok { background: #dcf7e3; color: #15803d; }
.fb--ko { background: #fff1e6; color: #c2520c; }
@keyframes bounce { 0% { transform: scale(0.9); } 60% { transform: scale(1.04); } 100% { transform: scale(1); } }
.opt.right { border-color: #22a35a !important; background: #dcf7e3 !important; box-shadow: 0 4px 0 #9fdcb4 !important; }
.opt.wrong { border-color: #ef4444 !important; background: #ffe7e7 !important; animation: shake 0.35s; }
@keyframes shake { 25% { transform: translateX(6px); } 75% { transform: translateX(-6px); } }
/* البراعم: خيارات ملوّنة كبيرة */
.av--kids .opts { grid-template-columns: 1fr 1fr; }
.av--kids .opt { flex-direction: column; justify-content: center; text-align: center; min-height: 120px; font-size: 1.35rem; color: #fff; border: 0; border-radius: 28px; font-family: var(--font-display); }
.av--kids .opt__k { display: none; }
.av--kids .opt--0 { background: #ff6b4a; box-shadow: 0 7px 0 #c94a2e; }
.av--kids .opt--1 { background: #3ec1f3; box-shadow: 0 7px 0 #1f93c2; }
.av--kids .opt--2 { background: #9b6bff; box-shadow: 0 7px 0 #6d3fe0; }
.av--kids .opt--3 { background: #4cd07d; box-shadow: 0 7px 0 #2e9e58; }
.av--kids .opt.right { color: #15803d; }
.av--kids .opt.wrong { color: #b91c1c; }
.av--kids .quiz__q { text-align: center; font-size: 1.9rem !important; }
.av--teens .card { border-radius: 14px; box-shadow: none; border: 1px solid var(--line); }
.av--teens .opt { box-shadow: none; border-width: 1.5px; border-radius: 10px; font-size: 1rem; }
.quiz__nav { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
.q-enter-active, .q-leave-active { transition: all 0.25s; }
.q-enter-from { opacity: 0; transform: translateX(-24px); }
.q-leave-to { opacity: 0; transform: translateX(24px); }

.result__top { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.25rem; }
.result__score { display: flex; flex-direction: column; align-items: center; line-height: 1; }
.result__score b { font-size: 2.3rem; }
.result__score small { color: var(--muted); }
.review { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.review li { padding: 0.8rem 1rem; border-radius: var(--radius); border-inline-start: 5px solid; }
.review li.ok { background: #effbf2; border-color: #22a35a; }
.review li.ko { background: #fff2f2; border-color: #ef4444; }
.review li.part { background: #fff8e6; border-color: #e0a100; }
.review li.wait { background: #f4f5f8; border-color: #94a3b8; }
.part .review__q i { color: #e0a100; margin-top: 0.3rem; }
.wait .review__q i { color: #64748b; margin-top: 0.3rem; }
.review__q span { flex: 1; }
.review__q .pts { font-weight: 700; color: var(--muted); white-space: nowrap; }
.review__a .exp { color: inherit; margin-top: 0.2rem; }
.qfield { margin-top: 0.5rem; }
.review__q { font-weight: 800; display: flex; gap: 0.5rem; align-items: flex-start; }
.ok .review__q i { color: #22a35a; margin-top: 0.3rem; }
.ko .review__q i { color: #ef4444; margin-top: 0.3rem; }
.review__a { display: flex; flex-direction: column; font-size: 0.88rem; color: var(--muted); padding-inline-start: 1.5rem; margin-top: 0.2rem; }

.hw { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
.hw h3 { font-size: 0.95rem; margin: 1rem 0 0.5rem; }
.pre { white-space: pre-wrap; line-height: 1.9; margin: 0; }
.file { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.7rem 0.9rem; border-radius: var(--radius); border: 1.5px dashed var(--line); background: var(--bg); cursor: pointer; font: inherit; color: inherit; }
.file span { flex: 1; text-align: start; font-weight: 700; }
.file .pi-file-pdf { color: #ef4444; }
.upload { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.75rem; padding: 1rem; border-radius: var(--radius); border: 2px dashed color-mix(in srgb, var(--c) 40%, var(--line)); color: var(--c); font-weight: 800; cursor: pointer; background: color-mix(in srgb, var(--c) 5%, #fff); }
.upload input { display: none; }
.files { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.6rem; }
.x { cursor: pointer; margin-inline-start: 0.2rem; }
.sub { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; padding: 0.8rem; background: var(--bg); border-radius: var(--radius); }
.waiting { margin-top: 0.75rem; padding: 0.8rem; border-radius: var(--radius); background: #dbe8ff; color: #1d55d1; font-weight: 800; display: flex; gap: 0.5rem; align-items: center; }
.graded { margin-top: 0.75rem; display: flex; gap: 1rem; align-items: center; padding: 0.9rem; border-radius: var(--radius); background: #effbf2; }
.graded__score { font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #16803c; }
.graded__score small { font-size: 0.9rem; color: var(--muted); }
.graded p { margin: 0.2rem 0 0; }
.model { margin-top: 0.75rem; padding: 0.9rem; border-radius: var(--radius); background: #fff8e1; }
@media (max-width: 760px) { .hw { grid-template-columns: 1fr; } .opts--two { grid-template-columns: 1fr; } }
</style>
