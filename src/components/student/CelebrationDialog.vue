<template>
  <Dialog :visible="!!c" modal :closable="false" :show-header="false" :style="{ width: 'min(380px, 92vw)' }" content-class="celeb-wrap" @update:visible="close">
    <div v-if="c" class="celeb">
      <div v-if="theme === 'kids'" class="celeb__mascot"><Mascot mood="happy" bounce :color="'#ffc93c'" :accent="'var(--brand)'" /></div>
      <div v-else class="celeb__icon" :class="`celeb__icon--${theme}`"><i :class="theme === 'juniors' ? 'pi pi-trophy' : 'pi pi-check'" /></div>
      <h2>{{ c.title || t(`student.bravo.${theme}`) }}</h2>
      <div v-if="c.gained" class="celeb__gain"><i class="pi pi-star-fill" /> <bdi dir="ltr">{{ t('student.gained', { n: c.gained }) }}<template v-if="theme === 'juniors'"> XP</template></bdi></div>
      <div v-for="b in c.badges" :key="b.id" class="celeb__badge">
        <span class="celeb__badge-icon"><i :class="b.icon" /></span>
        <div><small>{{ t('student.newBadge') }}</small><strong>{{ b.title }}</strong></div>
      </div>
      <Button :label="t('common.close')" class="celeb__btn" @click="close" />
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Mascot from '@/components/art/Mascot.vue'
import { useStudentStore } from '@/stores/student'

const { t } = useI18n()
const student = useStudentStore()
const c = computed(() => student.celebration)
const theme = computed(() => student.theme)
const close = () => student.closeCelebration()
</script>

<style scoped>
.celeb { text-align: center; padding: 1.5rem 0.5rem 0.5rem; }
.celeb__mascot { width: 130px; height: 130px; margin: -10px auto 0.5rem; }
.celeb__icon { width: 84px; height: 84px; border-radius: 50%; margin: 0 auto 0.75rem; display: grid; place-items: center; color: #fff; }
.celeb__icon i { font-size: 2.2rem; }
.celeb__icon--juniors { background: #8ac926; box-shadow: 0 5px 0 #5f9a12; }
.celeb__icon--teens { background: var(--brand); }
.celeb h2 { margin: 0 0 0.5rem; font-size: 1.6rem; }
.celeb__gain { display: inline-flex; gap: 0.4rem; align-items: center; font-size: 1.6rem; font-weight: 800; color: #e19400; background: #fff4d0; padding: 0.3rem 1.2rem; border-radius: 999px; }
.celeb__badge { display: flex; gap: 0.75rem; align-items: center; margin: 1rem auto 0; padding: 0.7rem 1rem; border-radius: 16px; background: var(--brand-soft); text-align: start; max-width: 280px; }
.celeb__badge-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--brand); color: #fff; }
.celeb__badge small { display: block; color: var(--muted); font-size: 0.75rem; }
.celeb__btn { margin-top: 1.25rem; width: 100%; }
</style>
