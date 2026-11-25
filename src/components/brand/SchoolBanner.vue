<template>
  <!-- غلاف المدرسة في رئيسية التلميذ: صورة/زخرفة المدرسة + الشعاران + رسالة المدير -->
  <section v-if="school && branding" class="sb" :class="'sb--' + variant" :style="{ backgroundImage: coverCss(branding), '--p': branding.primary }">
    <div class="sb__shade" />
    <div class="sb__body">
      <BrandPair :school="school" :branding="branding" :size="variant === 'teens' ? 34 : 44" tone="light" />
      <div class="sb__text">
        <strong>{{ school.name }}</strong>
        <p v-if="branding.welcome">{{ branding.welcome }}</p>
      </div>
    </div>
    <slot />
  </section>
</template>

<script setup>
import BrandPair from './BrandPair.vue'
import { coverCss } from '@/utils/coverPatterns'

defineProps({ school: Object, branding: Object, variant: { type: String, default: 'juniors' } })
</script>

<style scoped>
.sb { position: relative; overflow: hidden; background-color: var(--p); background-size: cover; background-position: center; color: #fff; border-radius: var(--radius-lg, 20px); min-height: 130px; display: flex; align-items: flex-end; }
.sb__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.05) 75%); }
.sb__body { position: relative; display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; width: 100%; flex-wrap: wrap; }
.sb__text strong { font-size: 1.15rem; display: block; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
.sb__text p { margin: 0.15rem 0 0; opacity: 0.95; font-size: 0.92rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35); }

.sb--kids { min-height: 150px; border-radius: 28px; border-bottom: 6px solid color-mix(in srgb, var(--p) 70%, #000); }
.sb--kids .sb__text strong { font-family: var(--font-display); font-size: 1.35rem; }
.sb--juniors { min-height: 140px; }
.sb--teens { min-height: 96px; border-radius: 14px; }
.sb--teens .sb__body { padding: 0.75rem 1rem; }
.sb--teens .sb__text strong { font-size: 1rem; }
.sb--teens .sb__text p { font-size: 0.85rem; }
.sb--compact { min-height: 110px; }
</style>
