<template>
  <Button
    :label="compact ? undefined : current.label"
    icon="pi pi-globe"
    text
    rounded
    severity="secondary"
    :aria-label="t('layout.language')"
    v-tooltip.bottom="compact ? t('layout.language') : null"
    @click="menu.toggle($event)"
  />
  <Menu ref="menu" :model="items" popup />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrimeVue } from 'primevue/config'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { LOCALES, applyDirection } from '@/i18n'
import { primeLocales } from '@/i18n/primeLocales'
import { storage } from '@/utils/storage'

defineProps({ compact: { type: Boolean, default: false } })

const { t, locale } = useI18n()
const primevue = usePrimeVue()
const menu = ref()

const current = computed(() => LOCALES.find((l) => l.code === locale.value) || LOCALES[0])

const items = computed(() =>
  LOCALES.map((l) => ({
    label: l.label,
    icon: l.code === locale.value ? 'pi pi-check' : 'pi pi-circle-off',
    command: () => setLocale(l.code)
  }))
)

function setLocale(code) {
  locale.value = code
  applyDirection(code)
  primevue.config.locale = primeLocales[code]
  storage.set('ist.locale', code)
}
</script>
