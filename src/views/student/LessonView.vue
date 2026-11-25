<template>
  <template v-if="l">
    <KidsLesson v-if="theme === 'kids'" :key="l.id" :l="l" />
    <JuniorsLesson v-else-if="theme === 'juniors'" :key="l.id" :l="l" :initial="initial" />
    <TeensLesson v-else :key="l.id" :l="l" :initial="initial" />
  </template>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import KidsLesson from './kids/KidsLesson.vue'
import JuniorsLesson from './juniors/JuniorsLesson.vue'
import TeensLesson from './teens/TeensLesson.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const route = useRoute()
const student = useStudentStore()
const l = ref(null)
const initial = ref(0)
const theme = computed(() => student.theme)

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    l.value = await learning.lesson(student.personId, id)
    const i = l.value.contents.findIndex((c) => c.id === route.query.c)
    initial.value = i >= 0 ? i : 0
  },
  { immediate: true }
)
</script>
