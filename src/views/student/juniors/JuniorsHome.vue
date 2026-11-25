<template>
  <div v-if="d" class="jh">
    <SchoolBanner :school="brand.school" :branding="brand.branding" variant="juniors" class="jh__banner" />
    <div class="jh__grid">
      <!-- بطاقة المستكشف -->
      <section class="card explorer">
        <div class="explorer__top">
          <span class="explorer__av">{{ auth.initials }}</span>
          <div>
            <small>{{ t('student.hello.juniors') }}</small>
            <h1>{{ auth.person.firstName }}</h1>
            <span class="muted">{{ auth.active.class?.name }}</span>
          </div>
        </div>
        <div class="explorer__lvl">
          <div class="lvl-badge"><b>{{ d.xp.level }}</b><small>المستوى</small></div>
          <div class="lvl-bar">
            <div class="lvl-bar__track"><span :style="{ width: d.xp.inLevel + '%' }" /></div>
            <small>{{ d.xp.inLevel }} / {{ d.xp.next }} نقطة للمستوى {{ d.xp.level + 1 }}</small>
          </div>
        </div>
        <div class="explorer__stats">
          <div><i class="pi pi-bolt" /><b>{{ d.streak }}</b><small>{{ t('student.streakShort') }}</small></div>
          <div><i class="pi pi-check-circle" /><b>{{ d.doneLessons }}</b><small>درساً</small></div>
          <div><i class="pi pi-trophy" /><b>{{ d.badges.length }}</b><small>شارة</small></div>
        </div>
      </section>

      <!-- مهام اليوم -->
      <section class="card quests">
        <header class="head"><h2><i class="pi pi-flag" /> مهامي</h2><RouterLink to="/app/my-assignments" class="link">سجل المهام</RouterLink></header>
        <RouterLink v-if="d.continueWith" :to="`/app/lesson/${d.continueWith.lessonId}`" class="quest quest--lesson" :style="{ '--c': d.continueWith.subject.color }">
          <span class="quest__check"><i class="pi pi-play" /></span>
          <div class="quest__body"><small>{{ d.continueWith.fromTeacher ? 'درس الأسبوع من معلمك' : 'استكشف درساً' }}</small><strong>{{ d.continueWith.title }}</strong><span>{{ d.continueWith.subject.name }}</span></div>
          <span class="quest__xp">+20 نقطة</span>
        </RouterLink>
        <RouterLink v-for="a in d.upcoming" :key="a.id" :to="`/app/activity/${a.id}`" class="quest" :style="{ '--c': a.subject.color }">
          <span class="quest__check" :class="{ late: a.state === 'late' }"><i :class="a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
          <div class="quest__body"><small>{{ a.type === 'quiz' ? 'اجتز التحدي' : 'أنجز المهمة' }} · {{ due(a).text }}</small><strong>{{ a.label }}</strong><span>{{ a.subject.name }}</span></div>
          <span class="quest__xp">{{ a.type === 'quiz' ? `حتى +${10 + 5 * (a.questionsCount || 0)}` : '+15' }} نقطة</span>
        </RouterLink>
      </section>
    </div>

    <!-- المناطق (المواد) -->
    <section>
      <header class="head"><h2><i class="pi pi-compass" /> مناطق الاستكشاف</h2></header>
      <div class="regions">
        <RouterLink v-for="s in d.subjects" :key="s.id" :to="`/app/subject/${s.id}`" class="region" :style="{ '--c': s.color }">
          <div class="region__head">
            <span class="region__icon"><i :class="s.icon" /></span>
            <span v-if="s.newCount" class="region__new">{{ s.newCount }} جديد</span>
          </div>
          <strong>{{ s.name }}</strong>
          <small class="muted">{{ s.axes?.length || 0 }} محاور · {{ s.lessonsCount }} درساً</small>
          <div class="region__bar"><span :style="{ width: s.progress + '%' }" /></div>
          <small class="region__pct">{{ s.progress }}% مستكشف</small>
        </RouterLink>
      </div>
    </section>

    <section class="card">
      <header class="head"><h2><i class="pi pi-trophy" /> {{ t('student.badges') }}</h2><RouterLink to="/app/my-progress" class="link">إنجازاتي</RouterLink></header>
      <div class="badges">
        <span v-for="b in d.badges" :key="b.id" class="badge" v-tooltip.top="b.hint"><i :class="b.icon" /> {{ b.title }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import { useBrandStore } from '@/stores/brand'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { dueInfo } from '@/utils/due'

const { t } = useI18n()
const auth = useAuthStore()
const brand = useBrandStore()
const student = useStudentStore()
const d = ref(null)
const due = (a) => dueInfo(a.due, t)
onMounted(async () => (d.value = await student.refresh()))
</script>

<style scoped>
.jh__banner { margin-bottom: 1.25rem; }
.jh { display: flex; flex-direction: column; gap: 1.25rem; }
.jh__grid { display: grid; grid-template-columns: 340px 1fr; gap: 1.25rem; align-items: start; }
.card { background: var(--surface); border-radius: var(--radius-lg); padding: 1.2rem; box-shadow: var(--shadow); }
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; }
.head h2 { margin: 0; font-size: 1.2rem; display: flex; gap: 0.5rem; align-items: center; }
.head h2 i { color: var(--brand); }
.link { color: var(--brand); font-weight: 700; text-decoration: none; font-size: 0.88rem; }

.explorer { background: linear-gradient(160deg, #ffffff, #eef8ff); }
.explorer__top { display: flex; gap: 0.9rem; align-items: center; }
.explorer__av { width: 64px; height: 64px; border-radius: 20px; background: var(--brand); color: #fff; display: grid; place-items: center; font-size: 1.8rem; font-weight: 800; box-shadow: 0 5px 0 color-mix(in srgb, var(--brand) 60%, #000); }
.explorer__top small { color: var(--brand); font-weight: 800; }
.explorer__top h1 { margin: 0; font-size: 1.7rem; line-height: 1.1; }
.explorer__lvl { display: flex; align-items: center; gap: 0.8rem; margin: 1.1rem 0; padding: 0.8rem; border-radius: 16px; background: #f3fbe6; }
.lvl-badge { width: 64px; height: 64px; border-radius: 50%; background: #8ac926; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 4px 0 #5f9a12; flex-shrink: 0; }
.lvl-badge b { font-size: 1.6rem; }
.lvl-badge small { font-size: 0.62rem; }
.lvl-bar { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }
.lvl-bar__track { height: 12px; border-radius: 999px; background: #dcefc0; overflow: hidden; }
.lvl-bar__track span { display: block; height: 100%; background: linear-gradient(90deg, #8ac926, #5fb31a); border-radius: inherit; }
.lvl-bar small { font-size: 0.75rem; color: #4a6b1a; font-weight: 700; }
.explorer__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.explorer__stats div { display: flex; flex-direction: column; align-items: center; padding: 0.6rem 0.3rem; border-radius: 14px; background: var(--bg); }
.explorer__stats i { color: var(--brand); }
.explorer__stats b { font-size: 1.3rem; }
.explorer__stats small { font-size: 0.72rem; color: var(--muted); }

.quests { display: flex; flex-direction: column; gap: 0.55rem; }
.quest { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 0.9rem; border-radius: 16px; border: 2px solid var(--line); text-decoration: none; color: inherit; transition: border-color 0.15s, transform 0.15s; }
.quest:hover { border-color: var(--c); transform: translateX(-3px); }
.quest--lesson { border-color: var(--c); background: color-mix(in srgb, var(--c) 6%, #fff); }
.quest__check { width: 42px; height: 42px; border-radius: 12px; border: 2.5px solid var(--c); color: var(--c); display: grid; place-items: center; flex-shrink: 0; }
.quest__check.late { border-color: #ef4444; color: #ef4444; }
.quest__body { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.35; }
.quest__body small { color: var(--muted); font-weight: 700; font-size: 0.75rem; }
.quest__body strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.quest__body span { font-size: 0.78rem; color: var(--c); font-weight: 700; }
.quest__xp { font-weight: 800; color: #5f9a12; background: #effad9; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; white-space: nowrap; }

.regions { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1rem; }
.region { display: flex; flex-direction: column; gap: 0.3rem; padding: 1.1rem; border-radius: var(--radius-lg); background: var(--surface); text-decoration: none; color: inherit; box-shadow: var(--shadow); border-top: 6px solid var(--c); transition: transform 0.15s; }
.region:hover { transform: translateY(-3px); }
.region__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
.region__icon { width: 48px; height: 48px; border-radius: 14px; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); display: grid; place-items: center; }
.region__icon i { font-size: 1.3rem; }
.region__new { font-size: 0.72rem; font-weight: 800; color: #fff; background: #ff5a5f; padding: 0.1rem 0.55rem; border-radius: 999px; }
.region strong { font-size: 1.1rem; font-family: var(--font-display); }
.region__bar { height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--c) 15%, #fff); overflow: hidden; margin-top: 0.4rem; }
.region__bar span { display: block; height: 100%; background: var(--c); border-radius: inherit; }
.region__pct { font-size: 0.75rem; font-weight: 700; color: var(--c); }
.badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.badge { display: inline-flex; gap: 0.4rem; align-items: center; padding: 0.4rem 0.85rem; border-radius: 999px; background: #effad9; color: #4a7a10; font-weight: 700; font-size: 0.85rem; }
@media (max-width: 900px) { .jh__grid { grid-template-columns: 1fr; } }
</style>
