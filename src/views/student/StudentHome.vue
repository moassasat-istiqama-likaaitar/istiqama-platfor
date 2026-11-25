<template>
  <div v-if="d" class="sh">
    <!-- البطاقة الترحيبية -->
    <section class="hero" :class="`hero--${theme}`">
      <div class="hero__text">
        <span class="hero__hello">{{ t(`student.hello.${theme}`) }}</span>
        <h1>{{ auth.person.firstName }}</h1>
        <p class="hero__class"><i class="pi pi-users" /> {{ auth.active.class?.name }} · {{ auth.active.school?.name }}</p>
        <div class="hero__stats">
          <span class="hs"><i class="pi pi-bolt" /><b>{{ d.streak }}</b> {{ t('student.streak') }}</span>
          <span class="hs"><i class="pi pi-star-fill" /><b>{{ d.stars }}</b> {{ t('student.stars') }}</span>
        </div>
      </div>
      <div class="hero__goal">
        <ProgressRing :value="goalPct" :size="theme === 'teens' ? 112 : 124" :stroke="12" color="#fff" track="rgba(255,255,255,0.25)">
          <div class="goal-label"><b>{{ d.dailyGoal.done }}/{{ d.dailyGoal.target }}</b><small>{{ t('student.todayGoal') }}</small></div>
        </ProgressRing>
      </div>
      <div v-if="theme !== 'teens'" class="hero__mascot"><Mascot bounce :mood="goalPct >= 100 ? 'happy' : 'normal'" :color="'#ffd54a'" :accent="'#fff'" /></div>
    </section>

    <div class="sh__grid">
      <!-- تابع -->
      <RouterLink v-if="d.continueWith" :to="`/app/lesson/${d.continueWith.lessonId}`" class="cont" :style="{ '--c': d.continueWith.subject.color }">
        <div class="cont__art"><LessonArt :kind="d.continueWith.subject.art" :color="d.continueWith.subject.color" :accent="d.continueWith.subject.accent" /></div>
        <div class="cont__body">
          <small>{{ t('student.continue') }}</small>
          <strong>{{ d.continueWith.title }}</strong>
          <span class="muted">{{ d.continueWith.subject.name }}</span>
          <div class="bar" :style="{ '--bar-color': d.continueWith.subject.color }"><span :style="{ width: d.continueWith.subject.progress + '%' }" /></div>
        </div>
        <span class="cont__play"><i class="pi pi-play" /></span>
      </RouterLink>

      <!-- ينتظرك -->
      <section class="box">
        <header class="box__head">
          <h2><i class="pi pi-calendar-clock" /> {{ t('student.upcoming') }} <span v-if="d.todoCount" class="count">{{ d.todoCount }}</span></h2>
          <RouterLink to="/app/my-assignments" class="link">{{ t('student.seeAll') }}</RouterLink>
        </header>
        <div v-if="d.upcoming.length" class="list">
          <ActivityCard v-for="a in d.upcoming" :key="a.id" :a="a" />
        </div>
        <p v-else class="empty-note"><i class="pi pi-check-circle" /> {{ t('student.noUpcoming') }}</p>
      </section>
    </div>

    <!-- المواد -->
    <section>
      <header class="box__head">
        <h2><i class="pi pi-book" /> {{ t('student.mySubjects') }}</h2>
        <span class="chip"><i class="pi pi-chart-pie" /> {{ t('student.overall') }}: {{ d.progress }}%</span>
      </header>
      <div class="subjects">
        <SubjectCard v-for="s in d.subjects" :key="s.id" :s="s" />
      </div>
    </section>

    <!-- الشارات -->
    <section class="box badges-box">
      <header class="box__head">
        <h2><i class="pi pi-trophy" /> {{ t('student.badges') }}</h2>
        <RouterLink to="/app/my-progress" class="link">{{ t('student.seeAll') }}</RouterLink>
      </header>
      <div class="badges">
        <div v-for="b in d.badges" :key="b.id" class="badge" v-tooltip.top="b.hint">
          <span class="badge__icon"><i :class="b.icon" /></span>
          <small>{{ b.title }}</small>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="loading"><i class="pi pi-spin pi-spinner" /></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Mascot from '@/components/art/Mascot.vue'
import LessonArt from '@/components/art/LessonArt.vue'
import ProgressRing from '@/components/student/ProgressRing.vue'
import SubjectCard from '@/components/student/SubjectCard.vue'
import ActivityCard from '@/components/student/ActivityCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const auth = useAuthStore()
const student = useStudentStore()
const d = ref(null)
const theme = computed(() => auth.themeKey)
const goalPct = computed(() => (d.value ? Math.round((d.value.dailyGoal.done / d.value.dailyGoal.target) * 100) : 0))

onMounted(async () => {
  d.value = await student.refresh()
})
</script>

<style scoped>
.sh { display: flex; flex-direction: column; gap: 1.5rem; }
.loading { display: grid; place-items: center; min-height: 50vh; font-size: 2rem; color: var(--brand); }

.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2.25rem);
  border-radius: var(--radius-lg);
  color: #fff;
  overflow: hidden;
  background: linear-gradient(120deg, var(--brand), color-mix(in srgb, var(--brand) 65%, #2a0a4a));
  box-shadow: 0 16px 40px color-mix(in srgb, var(--brand) 35%, transparent);
  min-height: 190px;
}
.hero::before { content: ''; position: absolute; width: 340px; height: 340px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); top: -160px; inset-inline-start: 38%; }
.hero::after { content: ''; position: absolute; width: 180px; height: 180px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); bottom: -90px; inset-inline-start: 12%; }
.hero--kids { background: linear-gradient(120deg, #ff6b4a, #ff9a3d 60%, #ffc23c); }
.hero--juniors { background: linear-gradient(120deg, #0a9bdc, #2bb8c9 55%, #6fcf5a); }
.hero--teens { background: linear-gradient(120deg, #4b3bc4, #6550e0 50%, #8e6cf0); }
.hero__text { position: relative; z-index: 1; flex: 1; }
.hero__hello { font-family: var(--font-display); font-size: 1.1rem; opacity: 0.95; }
.hero h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }
.hero__class { margin: 0.35rem 0 0.9rem; opacity: 0.9; display: flex; gap: 0.4rem; align-items: center; font-size: 0.9rem; }
.hero__stats { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.hs { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(255, 255, 255, 0.2); padding: 0.35rem 0.85rem; border-radius: 999px; font-size: 0.85rem; backdrop-filter: blur(4px); }
.hs b { font-size: 1.05rem; }
.hero__goal { position: relative; z-index: 1; }
.goal-label { display: flex; flex-direction: column; align-items: center; line-height: 1.1; color: #fff; }
.goal-label b { font-size: 1.5rem; }
.goal-label small { font-size: 0.7rem; opacity: 0.9; font-weight: 600; }
.hero__mascot { position: relative; z-index: 1; width: 150px; height: 150px; margin-block: -20px; }

.sh__grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.25rem; align-items: start; }

.cont { position: relative; display: flex; flex-direction: column; background: var(--surface); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; color: inherit; box-shadow: var(--shadow); border: 2px solid transparent; transition: transform 0.2s, border-color 0.2s; }
.cont:hover { transform: translateY(-3px); border-color: var(--c); }
.cont__art { aspect-ratio: 200 / 110; overflow: hidden; }
.cont__body { padding: 1rem 1.2rem 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; }
.cont__body small { color: var(--c); font-weight: 800; }
.cont__body strong { font-family: var(--font-display); font-size: 1.3rem; }
.cont__play { position: absolute; top: 14px; inset-inline-end: 14px; width: 54px; height: 54px; border-radius: 50%; background: var(--c); color: #fff; display: grid; place-items: center; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2); }
.cont__play i { font-size: 1.2rem; margin-inline-start: 3px; }

.box { background: color-mix(in srgb, var(--surface) 60%, transparent); border-radius: var(--radius-lg); }
.box__head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; }
.box__head h2 { margin: 0; font-size: 1.2rem; display: flex; gap: 0.5rem; align-items: center; }
.box__head h2 i { color: var(--brand); }
.count { background: #ef4444; color: #fff; font-size: 0.75rem; padding: 0 0.5rem; border-radius: 999px; font-family: var(--font); }
.link { color: var(--brand); font-weight: 700; text-decoration: none; font-size: 0.9rem; }
.list { display: flex; flex-direction: column; gap: 0.6rem; }
.empty-note { background: var(--surface); padding: 1.25rem; border-radius: var(--radius); display: flex; gap: 0.5rem; align-items: center; color: #16803c; font-weight: 700; margin: 0; }

.subjects { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }

.badges-box { background: var(--surface); padding: 1.1rem 1.25rem; box-shadow: var(--shadow); }
.badges { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.25rem; }
.badge { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; min-width: 84px; text-align: center; }
.badge__icon { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, var(--brand))); color: #fff; box-shadow: 0 4px 0 color-mix(in srgb, var(--accent) 50%, #000); }
.badge__icon i { font-size: 1.4rem; }
.badge small { font-weight: 700; font-size: 0.75rem; }

@media (max-width: 900px) {
  .sh__grid { grid-template-columns: 1fr; }
  .hero__mascot { width: 110px; height: 110px; position: absolute; bottom: 4px; inset-inline-end: 4px; opacity: 0.95; }
  .hero { flex-wrap: wrap; padding-bottom: 1.5rem; }
}
@media (max-width: 560px) {
  .hero__goal { order: -1; }
  .subjects { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
}
</style>
