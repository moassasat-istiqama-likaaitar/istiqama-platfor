<template>
  <RouterLink :to="`/app/subject/${s.id}`" class="subj" :style="{ '--c': s.color, '--a': s.accent }">
    <span v-if="s.newCount" class="subj__new">{{ t('student.newLessons', { n: s.newCount }) }}</span>
    <div class="subj__art"><LessonArt :kind="s.art" :color="s.color" :accent="s.accent" /></div>
    <div class="subj__body">
      <strong class="subj__name">{{ s.name }}</strong>
      <small class="muted">{{ t('student.lessonsDone', { done: s.doneCount, total: s.lessonsCount }) }}</small>
      <div class="bar" :style="{ '--bar-color': s.color }"><span :style="{ width: s.progress + '%' }" /></div>
    </div>
  </RouterLink>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LessonArt from '@/components/art/LessonArt.vue'
defineProps({ s: { type: Object, required: true } })
const { t } = useI18n()
</script>

<style scoped>
.subj {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}
.subj:hover { transform: translateY(-4px) rotate(-0.4deg); border-color: var(--c); }
.subj__art { aspect-ratio: 200 / 120; overflow: hidden; }
.subj__art :deep(svg) { margin-top: -6%; }
.subj__body { padding: 0.75rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.subj__name { font-family: var(--font-display); font-size: 1.08rem; color: var(--ink); }
.subj__new { position: absolute; top: 10px; inset-inline-start: 10px; z-index: 1; background: #ef4444; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.6rem; border-radius: 999px; box-shadow: 0 3px 8px rgba(239, 68, 68, 0.35); }
</style>
