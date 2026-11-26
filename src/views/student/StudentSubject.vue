<template>
  <!-- ST03: المادة — دروسها المفتوحة والمقفلة -->
  <template v-if="s">
    <KidsSubject v-if="theme === 'kids'" :s="s" />
    <JuniorsSubject v-else-if="theme === 'juniors'" :s="s" />
    <TeensSubject v-else :s="s" />
  </template>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import KidsSubject from './kids/KidsSubject.vue'
import JuniorsSubject from './juniors/JuniorsSubject.vue'
import TeensSubject from './teens/TeensSubject.vue'
import * as learning from '@/api/learning'
import { useStudentStore } from '@/stores/student'

const route = useRoute()
const student = useStudentStore()
const s = ref(null)
const theme = computed(() => student.theme)
watch(() => route.params.id, async (id) => { if (id) s.value = await learning.subject(student.personId, id) }, { immediate: true })
</script>
