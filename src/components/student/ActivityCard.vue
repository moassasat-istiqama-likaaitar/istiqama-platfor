<template>
  <RouterLink :to="`/app/activity/${a.id}`" class="act" :style="{ '--c': a.subject?.color }">
    <span class="act__icon" :class="`act__icon--${a.type}`">
      <i :class="a.type === 'quiz' ? 'pi pi-question-circle' : 'pi pi-file-edit'" />
    </span>
    <div class="act__body">
      <div class="act__top">
        <span class="act__type">{{ t(`student.types.${a.type}`) }}</span>
        <span class="act__subject">{{ a.subject?.name }}</span>
        <span v-if="a.required && ['todo', 'late'].includes(a.state)" class="act__req">{{ t('student.required') }}</span>
      </div>
      <strong class="act__title">{{ a.title }}</strong>
      <small class="muted">{{ a.lesson?.title }}</small>
    </div>
    <div class="act__end">
      <span v-if="a.state === 'graded'" class="act__score">{{ a.score }}<small>/{{ a.maxScore }}</small></span>
      <span v-else-if="a.state === 'submitted'" class="chip" data-hue="blue"><i class="pi pi-clock" /> {{ t('student.state.submitted') }}</span>
      <span v-else class="chip" :data-hue="due.hue">{{ due.text }}</span>
      <i class="pi pi-angle-left flip act__go" />
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { dueInfo } from '@/utils/due'

const props = defineProps({ a: { type: Object, required: true } })
const { t } = useI18n()
const due = computed(() => dueInfo(props.a.due, t))
</script>

<style scoped>
.act {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: var(--surface);
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow);
  border-inline-start: 5px solid var(--c);
  transition: transform 0.15s;
}
.act:hover { transform: translateX(-3px); }
[dir='ltr'] .act:hover { transform: translateX(3px); }
.act__icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; font-size: 1.2rem; }
.act__icon i { font-size: 1.25rem; }
.act__icon--quiz { background: #ece6ff; color: #6a3fe0; }
.act__icon--homework { background: #ffe9d4; color: #d0570c; }
.act__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.act__top { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; font-size: 0.75rem; font-weight: 700; }
.act__type { color: var(--c); }
.act__subject { color: var(--muted); }
.act__req { background: #ffe1e1; color: #c22727; padding: 0 0.45rem; border-radius: 999px; }
.act__title { font-size: 0.98rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act__end { display: flex; align-items: center; gap: 0.6rem; }
.act__score { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--c); }
.act__score small { font-size: 0.8rem; color: var(--muted); }
.act__go { color: var(--muted); }
@media (max-width: 560px) { .act__go { display: none; } .act { padding: 0.75rem; gap: 0.6rem; } }
</style>
