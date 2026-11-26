<template>
  <!-- لكل طور قالبه الخاص: بنية التنقل وترتيب الشاشة يختلفان، لا الألوان فقط -->
  <!-- داخل الدرس والتقييم: وضع التركيز (بلا إشعارات ولا مكافآت ولا قوائم) -->
  <FocusShell v-if="focus"><slot /></FocusShell>
  <KidsShell v-else-if="theme === 'kids'"><slot /></KidsShell>
  <JuniorsShell v-else-if="theme === 'juniors'"><slot /></JuniorsShell>
  <TeensShell v-else><slot /></TeensShell>
  <CelebrationDialog />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import FocusShell from './student/FocusShell.vue'
import KidsShell from './student/KidsShell.vue'
import JuniorsShell from './student/JuniorsShell.vue'
import TeensShell from './student/TeensShell.vue'
import CelebrationDialog from '@/components/student/CelebrationDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const student = useStudentStore()
const theme = computed(() => auth.themeKey)
const route = useRoute()
const focus = computed(() => ['lesson', 'activity'].includes(route.name))
onMounted(() => student.refresh())
</script>
