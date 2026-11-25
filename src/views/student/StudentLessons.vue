<template>
  <div class="sl">
    <header class="sl__head">
      <h1>{{ t('student.nav.lessons') }}</h1>
      <div class="search">
        <i class="pi pi-search" />
        <input v-model="q" type="search" :placeholder="t('student.searchPlaceholder')" @input="debounced" />
      </div>
      <div class="types">
        <button v-for="ty in types" :key="ty" type="button" class="pill" :class="{ 'is-active': type === ty }" @click="setType(ty)">
          <i :class="typeIcon[ty]" /> {{ ty === 'all' ? t('common.all') : t(`student.types.${ty}`) }}
        </button>
      </div>
    </header>

    <!-- نتائج البحث -->
    <section v-if="searching">
      <div v-if="results.length" class="results">
        <RouterLink v-for="r in results" :key="r.id" :to="`/app/lesson/${r.lessonId}?c=${r.id}`" class="res" :style="{ '--c': r.subject.color }">
          <span class="res__icon"><i :class="typeIcon[r.type]" /></span>
          <div class="res__body">
            <strong>{{ r.title }}</strong>
            <small>{{ r.subject.name }} · {{ r.lessonTitle }}</small>
          </div>
          <span class="chip">{{ t(`student.types.${r.type}`) }}</span>
        </RouterLink>
      </div>
      <EmptyState v-else icon="pi pi-search" :text="t('student.searchEmpty')" />
    </section>

    <!-- المواد -->
    <div v-else class="subjects">
      <SubjectCard v-for="s in subjects" :key="s.id" :s="s" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import SubjectCard from '@/components/student/SubjectCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const student = useStudentStore()
const subjects = ref([])
const q = ref('')
const type = ref('all')
const results = ref([])
const types = ['all', 'video', 'slides', 'pdf', 'image']
const typeIcon = { all: 'pi pi-th-large', video: 'pi pi-video', slides: 'pi pi-images', pdf: 'pi pi-file-pdf', image: 'pi pi-image' }
const searching = computed(() => q.value.trim() || type.value !== 'all')

onMounted(async () => {
  const d = await student.refresh()
  subjects.value = d.subjects
})

let timer
function debounced() {
  clearTimeout(timer)
  timer = setTimeout(run, 200)
}
function setType(ty) {
  type.value = ty
  run()
}
async function run() {
  if (!searching.value) return
  results.value = await learning.search(student.levelId, q.value, type.value)
}
</script>

<style scoped>
.sl { display: flex; flex-direction: column; gap: 1.25rem; }
.sl__head h1 { margin: 0 0 0.75rem; font-size: 1.8rem; }
.search { position: relative; }
.search i { position: absolute; top: 50%; transform: translateY(-50%); inset-inline-start: 1.1rem; color: var(--muted); font-size: 1.1rem; }
.search input { width: 100%; padding: 0.95rem 1.2rem; padding-inline-start: 3rem; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); font: inherit; font-size: 1rem; color: var(--ink); box-shadow: var(--shadow); outline: none; }
.search input:focus { border-color: var(--brand); }
.types { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
.subjects { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1.1rem; }
.results { display: flex; flex-direction: column; gap: 0.6rem; }
.res { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; background: var(--surface); border-radius: var(--radius); text-decoration: none; color: inherit; box-shadow: var(--shadow); border-inline-start: 5px solid var(--c); }
.res__icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); }
.res__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.res__body small { color: var(--muted); }
@media (max-width: 560px) { .subjects { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; } }
</style>
