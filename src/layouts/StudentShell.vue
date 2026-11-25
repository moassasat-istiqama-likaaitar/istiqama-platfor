<template>
  <!-- لكل طور قالبه الخاص: بنية التنقل وترتيب الشاشة يختلفان، لا الألوان فقط -->
  <KidsShell v-if="theme === 'kids'"><slot /></KidsShell>
  <JuniorsShell v-else-if="theme === 'juniors'"><slot /></JuniorsShell>
  <TeensShell v-else><slot /></TeensShell>
  <CelebrationDialog />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import KidsShell from './student/KidsShell.vue'
import JuniorsShell from './student/JuniorsShell.vue'
import TeensShell from './student/TeensShell.vue'
import CelebrationDialog from '@/components/student/CelebrationDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'

const auth = useAuthStore()
const student = useStudentStore()
const theme = computed(() => auth.themeKey)
onMounted(() => student.refresh())
</script>
