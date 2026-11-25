<template>
  <div class="sa">
    <header class="sa__head">
      <h1>{{ t('student.nav.assignments') }}</h1>
      <div class="sa__tabs">
        <button v-for="tb in tabs" :key="tb" type="button" class="pill" :class="{ 'is-active': tab === tb }" @click="tab = tb">
          {{ t(`student.tabs.${tb}`) }} <span class="pill__count">{{ grouped[tb].length }}</span>
        </button>
      </div>
      <div class="sa__subjects">
        <button type="button" class="pill" :class="{ 'is-active': !subject }" @click="subject = null">{{ t('common.all') }}</button>
        <button v-for="s in subjects" :key="s.id" type="button" class="pill" :class="{ 'is-active': subject === s.id }" :style="{ '--brand': s.color }" @click="subject = s.id">{{ s.name }}</button>
      </div>
    </header>

    <div v-if="visible.length" class="sa__list">
      <ActivityCard v-for="a in visible" :key="a.id" :a="a" />
    </div>
    <div v-else class="sa__empty">
      <div class="sa__mascot"><Mascot mood="happy" bounce :color="'#ffd54a'" :accent="'var(--brand)'" /></div>
      <p>{{ t('student.noUpcoming') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActivityCard from '@/components/student/ActivityCard.vue'
import Mascot from '@/components/art/Mascot.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const student = useStudentStore()
const all = ref([])
const tab = ref('todo')
const subject = ref(null)
const tabs = ['todo', 'submitted', 'graded']

onMounted(async () => {
  all.value = await learning.myActivities(student.personId, student.levelId)
})

const subjects = computed(() => {
  const m = new Map()
  all.value.forEach((a) => a.subject && m.set(a.subject.id, a.subject))
  return [...m.values()]
})
const grouped = computed(() => {
  const f = all.value.filter((a) => !subject.value || a.subject?.id === subject.value)
  return {
    todo: f.filter((a) => ['todo', 'late'].includes(a.state)).sort((a, b) => (a.state === 'late' ? -1 : 1) - (b.state === 'late' ? -1 : 1) || a.due.localeCompare(b.due)),
    submitted: f.filter((a) => a.state === 'submitted'),
    graded: f.filter((a) => a.state === 'graded').sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
  }
})
const visible = computed(() => grouped.value[tab.value])
</script>

<style scoped>
.sa { display: flex; flex-direction: column; gap: 1.1rem; }
.sa__head h1 { margin: 0 0 0.75rem; font-size: 1.8rem; }
.sa__tabs, .sa__subjects { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.sa__subjects { margin-top: 0.6rem; }
.sa__subjects .pill { font-size: 0.78rem; padding: 0.3rem 0.75rem; }
.sa__list { display: flex; flex-direction: column; gap: 0.65rem; }
.sa__empty { text-align: center; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.sa__mascot { width: 130px; height: 130px; margin: 0 auto; }
.sa__empty p { font-weight: 800; font-size: 1.1rem; }
</style>
