<template>
  <!-- ST01 (البراعم): رئيسية البراعم — الأولى إلى الثالثة ابتدائي -->
  <div v-if="d" class="kh">
    <SchoolBanner :school="brand.school" :branding="brand.branding" variant="kids" class="kh__banner" />
    <!-- نور تقدّم مهمة اليوم -->
    <section class="mission">
      <div class="mission__mascot"><Mascot bounce :mood="d.continueWith ? 'normal' : 'happy'" :color="'#ffd54a'" :accent="'#ff6b4a'" /></div>
      <div class="mission__bubble">
        <span class="mission__hello">مرحباً يا {{ auth.person.firstName }}!</span>
        <template v-if="d.continueWith">
          <p>{{ d.continueWith.fromTeacher ? 'معلمك اختار لك درس اليوم في' : 'مهمة اليوم: نتعلّم درساً جديداً في' }} <b :style="{ color: d.continueWith.subject.color }">{{ d.continueWith.subject.name }}</b></p>
          <RouterLink :to="`/app/lesson/${d.continueWith.lessonId}`" class="mission__go" :style="{ '--c': d.continueWith.subject.color }" @click="tap">
            <span class="mission__play"><i class="pi pi-play" /></span>
            <span>{{ d.continueWith.title }}</span>
          </RouterLink>
        </template>
        <p v-else>أنهيت كل دروسك، أنت بطل!</p>
      </div>
    </section>

    <!-- المواد: مربعات كبيرة -->
    <h2 class="kh__title">دروسي</h2>
    <div class="tiles">
      <RouterLink v-for="s in d.subjects" :key="s.id" :to="`/app/subject/${s.id}`" class="tile" :style="{ '--c': s.color }" @click="tap">
        <span v-if="s.newCount" class="tile__new">{{ s.newCount }}</span>
        <span class="tile__icon"><i :class="s.icon" /></span>
        <strong>{{ s.name }}</strong>
        <span class="tile__stars">
          <i v-for="n in 5" :key="n" class="pi" :class="n <= Math.round(s.progress / 20) ? 'pi-star-fill' : 'pi-star'" />
        </span>
      </RouterLink>
    </div>

    <!-- التحديات: فقاعات -->
    <h2 class="kh__title">تحدياتي <span v-if="d.todoCount" class="dot">{{ d.todoCount }}</span></h2>
    <div class="bubbles">
      <RouterLink v-for="a in d.upcoming" :key="a.id" :to="`/app/activity/${a.id}`" class="bubble" :style="{ '--c': a.subject.color }" @click="tap">
        <span class="bubble__icon"><i :class="a.type === 'quiz' ? 'pi pi-question' : 'pi pi-pencil'" /></span>
        <span class="bubble__t">{{ a.type === 'quiz' ? 'لعبة أسئلة' : 'واجب' }}</span>
        <small>{{ a.label }}</small>
      </RouterLink>
      <div v-if="!d.upcoming.length" class="bubble bubble--done"><i class="pi pi-check" /> لا تحديات الآن</div>
    </div>
  </div>
</template>

<script setup>
import SchoolBanner from '@/components/brand/SchoolBanner.vue'
import { useBrandStore } from '@/stores/brand'
import { ref, onMounted } from 'vue'
import Mascot from '@/components/art/Mascot.vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { chime } from '@/utils/celebrate'

const auth = useAuthStore()
const brand = useBrandStore()
const student = useStudentStore()
const d = ref(null)
const tap = () => chime('tap', 'kids')
onMounted(async () => (d.value = await student.refresh()))
</script>

<style scoped>
.kh__banner { margin-bottom: 1.25rem; }
.kh { display: flex; flex-direction: column; gap: 1.25rem; }
.mission { display: flex; align-items: center; gap: 1rem; }
.mission__mascot { width: clamp(110px, 18vw, 170px); flex-shrink: 0; aspect-ratio: 1; }
.mission__bubble { position: relative; flex: 1; background: var(--surface); border-radius: 32px; padding: 1.25rem 1.5rem; box-shadow: var(--shadow); }
.mission__bubble::before { content: ''; position: absolute; top: 50%; inset-inline-start: -14px; width: 28px; height: 28px; background: var(--surface); transform: translateY(-50%) rotate(45deg); border-radius: 6px; }
.mission__hello { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--brand); }
.mission__bubble p { margin: 0.2rem 0 0.9rem; font-size: 1.15rem; }
.mission__go { display: flex; align-items: center; gap: 0.9rem; padding: 0.6rem 1.2rem 0.6rem 0.6rem; border-radius: 999px; background: var(--c); color: #fff; text-decoration: none; font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; box-shadow: 0 6px 0 color-mix(in srgb, var(--c) 60%, #000); width: fit-content; max-width: 100%; }
[dir='rtl'] .mission__go { padding: 0.6rem 0.6rem 0.6rem 1.2rem; }
.mission__go:active { transform: translateY(4px); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 60%, #000); }
.mission__play { width: 54px; height: 54px; border-radius: 50%; background: #fff; color: var(--c); display: grid; place-items: center; flex-shrink: 0; }
.mission__play i { font-size: 1.4rem; margin-inline-start: 4px; }
.kh__title { margin: 0.5rem 0 0; font-size: 1.6rem; display: flex; align-items: center; gap: 0.5rem; }
.dot { background: #ef4444; color: #fff; font-size: 0.9rem; min-width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; font-family: var(--font); }
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.75rem 1rem 1.25rem; border-radius: 32px; background: var(--c); color: #fff; text-decoration: none; box-shadow: 0 8px 0 color-mix(in srgb, var(--c) 60%, #000); transition: transform 0.15s; }
.tile:hover { transform: translateY(-4px) rotate(-1deg); }
.tile:active { transform: translateY(6px); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 60%, #000); }
.tile__icon { width: 92px; height: 92px; border-radius: 50%; background: rgba(255, 255, 255, 0.22); display: grid; place-items: center; }
.tile__icon i { font-size: 2.6rem; }
.tile strong { font-family: var(--font-display); font-size: 1.5rem; }
.tile__stars { display: flex; gap: 3px; }
.tile__stars i { font-size: 1.1rem; color: #ffe066; }
.tile__new { position: absolute; top: 12px; inset-inline-end: 12px; background: #fff; color: #ef4444; font-weight: 800; min-width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center; font-size: 1rem; }
.bubbles { display: flex; gap: 1rem; flex-wrap: wrap; }
.bubble { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; width: 150px; padding: 1rem 0.5rem; border-radius: 28px; background: var(--surface); text-decoration: none; color: var(--ink); text-align: center; box-shadow: var(--shadow); border-bottom: 6px solid var(--c); }
.bubble__icon { width: 60px; height: 60px; border-radius: 50%; background: var(--c); color: #fff; display: grid; place-items: center; }
.bubble__icon i { font-size: 1.5rem; }
.bubble__t { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
.bubble small { color: var(--muted); font-size: 0.8rem; line-height: 1.3; }
.bubble--done { width: auto; flex-direction: row; padding: 1rem 1.5rem; font-weight: 800; color: #16a34a; border-color: #16a34a; }
@media (max-width: 560px) {
  .mission { flex-direction: column; text-align: center; }
  .mission__bubble::before { display: none; }
  .mission__go { margin: 0 auto; font-size: 1.1rem; }
  .tiles { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .tile { padding: 1.25rem 0.5rem 1rem; }
  .tile__icon { width: 70px; height: 70px; }
  .tile strong { font-size: 1.15rem; text-align: center; }
  .bubble { width: calc(50% - 0.5rem); }
}
</style>
