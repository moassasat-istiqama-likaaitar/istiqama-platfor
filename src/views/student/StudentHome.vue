<template>
  <!-- ST01: رئيسية التلميذ — توجّه إلى ثيم الطور (البراعم / المستكشفون / الشباب) -->
  <KidsHome v-if="theme === 'kids'" />
  <JuniorsHome v-else-if="theme === 'juniors'" />
  <TeensHome v-else />
</template>

<script setup>
import { computed } from 'vue'
import KidsHome from './kids/KidsHome.vue'
import JuniorsHome from './juniors/JuniorsHome.vue'
import TeensHome from './teens/TeensHome.vue'
import { useAuthStore } from '@/stores/auth'
const theme = computed(() => useAuthStore().themeKey)
</script>
