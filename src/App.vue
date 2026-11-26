<template>
  <Toast position="bottom-left" />
  <RouterView />
</template>

<script setup>
import { watchEffect } from 'vue'
import Toast from 'primevue/toast'
import { useAuthStore } from '@/stores/auth'
import { usePlatformStore } from '@/stores/platform'
import { applyEffects } from '@/config/effects'

// التأثيرات البصرية حسب ثيم المستخدم الحالي (تُضبط من «تخصيص المنصة»)
const auth = useAuthStore()
const platform = usePlatformStore()
watchEffect(() => applyEffects(platform.effects, auth.themeKey || 'staff'))
</script>
