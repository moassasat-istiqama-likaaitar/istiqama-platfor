<template>
  <div class="date-badge" :title="`${g} — ${h}`">
    <i class="pi pi-calendar" />
    <div class="date-badge__text">
      <span class="date-badge__g">{{ day }} {{ g }}</span>
      <span class="date-badge__h">{{ h }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { gregorian, hijri, weekday } from '@/utils/dates'

const { locale } = useI18n()
const today = new Date()
const g = computed(() => gregorian(today, locale.value))
const h = computed(() => hijri(today, locale.value))
const day = computed(() => weekday(today, locale.value))
</script>

<style scoped>
.date-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--p-content-hover-background);
  color: var(--p-text-muted-color);
  font-size: 0.8rem;
  line-height: 1.25;
}
.date-badge i { color: var(--p-primary-color); }
.date-badge__text { display: flex; flex-direction: column; }
.date-badge__g { color: var(--p-text-color); font-weight: 600; }
</style>
