<template>
  <!-- معاينة مصغّرة لكيف تظهر هوية المدرسة داخل كل قالب — دون تغيير ثيم الطور -->
  <div class="pv" :class="'pv--' + mode" :style="vars">
    <!-- البراعم -->
    <template v-if="mode === 'kids'">
      <div class="school-ribbon" />
      <div class="k-top"><span class="k-av">أ</span><BrandPair :school="school" :branding="branding" :size="22" class="k-pair" /><span class="k-pill">★ 140</span></div>
      <div class="pv__pad"><SchoolBanner :school="school" :branding="branding" variant="kids" class="pv__banner" /></div>
      <div class="pv__pad k-tiles"><span style="--c: #e0457b" /><span style="--c: #ef7d32" /></div>
      <div class="k-dock"><i /><i /><i /><i /></div>
    </template>

    <!-- المستكشفون -->
    <template v-else-if="mode === 'juniors'">
      <div class="j-top"><BrandPair :school="school" :branding="branding" :size="22" tone="light" names /><span class="j-tabs"><i class="on" /><i /><i /></span></div>
      <div class="school-ribbon" />
      <div class="pv__pad"><SchoolBanner :school="school" :branding="branding" variant="juniors" class="pv__banner" /></div>
      <div class="pv__pad j-cards"><span /><span /><span /></div>
    </template>

    <!-- الشباب -->
    <template v-else-if="mode === 'teens'">
      <div class="t-wrap">
        <aside class="t-side"><BrandPair :school="school" :branding="branding" :size="20" tone="light" /><i /><i /><i /></aside>
        <div class="t-main">
          <div class="school-ribbon" />
          <div class="t-search" />
          <div class="pv__pad"><SchoolBanner :school="school" :branding="branding" variant="teens" class="pv__banner" /></div>
          <div class="pv__pad t-rows"><i /><i /><i /></div>
        </div>
      </div>
    </template>

    <!-- صفحة الدخول -->
    <template v-else-if="mode === 'login'">
      <div class="l-wrap">
        <div class="l-form"><b>مرحباً بكم في {{ school?.name }}</b><i /><i /><span /></div>
        <div class="l-cover" :style="{ backgroundImage: coverCss(branding) }">
          <div class="l-shade" />
          <div class="l-body"><BrandPair :school="school" :branding="branding" :size="30" tone="light" /><strong>{{ school?.name }}</strong><small>{{ branding?.welcome }}</small></div>
        </div>
      </div>
    </template>

    <!-- كشف النقاط -->
    <template v-else>
      <div class="p-sheet">
        <div class="p-head">
          <InstitutionMark :size="30" />
          <div class="p-title"><small>{{ t('app.name') }}</small><b>كشف النقاط</b><small>{{ school?.name }}</small></div>
          <SchoolLogo :school="school" :branding="branding" :size="30" />
        </div>
        <div class="p-line" />
        <div class="p-rows"><i /><i /><i /><i /></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BrandPair from './BrandPair.vue'
import SchoolBanner from './SchoolBanner.vue'
import SchoolLogo from './SchoolLogo.vue'
import InstitutionMark from './InstitutionMark.vue'
import { coverCss } from '@/utils/coverPatterns'

const props = defineProps({ school: Object, branding: Object, mode: { type: String, default: 'juniors' } })
const { t } = useI18n()
const vars = computed(() => ({ '--school-1': props.branding?.primary, '--school-2': props.branding?.secondary }))
</script>

<style scoped>
.pv { position: relative; height: 320px; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); font-size: 12px; }
.pv__pad { padding: 8px 12px 0; }
.pv__banner { min-height: 104px !important; }
.pv__banner :deep(.sb__text strong) { font-size: 0.95rem; }
.pv__banner :deep(.sb__text p) { font-size: 0.75rem; }
.pv :deep(.pair__names strong) { font-size: 0.8rem; }
.pv :deep(.pair__names small) { font-size: 0.6rem; }

/* البراعم */
.pv--kids { background: #fff7ec; }
.k-top { display: flex; align-items: center; gap: 8px; padding: 8px 12px; }
.k-av { width: 26px; height: 26px; border-radius: 50%; background: #ff6b4a; color: #fff; display: grid; place-items: center; font-weight: 800; }
.k-pair { background: #fff; padding: 2px 8px; border-radius: 999px; }
.k-pill { margin-inline-start: auto; background: #fff; padding: 2px 10px; border-radius: 999px; font-weight: 800; }
.k-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.k-tiles span { height: 54px; border-radius: 16px; background: var(--c); box-shadow: 0 4px 0 color-mix(in srgb, var(--c) 60%, #000); }
.k-dock { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: #fff; padding: 6px 10px; border-radius: 16px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1); }
.k-dock i { width: 26px; height: 26px; border-radius: 9px; background: #ffe3d6; }

/* المستكشفون */
.pv--juniors { background: #eaf6fd; }
.j-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; background: linear-gradient(120deg, #0a7fc0, #0a9bdc 60%, #22b4c8); color: #fff; }
.j-tabs { display: flex; gap: 6px; }
.j-tabs i { width: 34px; height: 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.3); }
.j-tabs i.on { background: #fff; }
.j-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.j-cards span { height: 70px; border-radius: 12px; background: #fff; border-top: 4px solid #0a9bdc; }

/* الشباب */
.t-wrap { display: flex; height: 100%; background: #f3f2fa; }
.t-side { width: 96px; background: #15132a; padding: 10px 8px; display: flex; flex-direction: column; gap: 8px; }
.t-side i { height: 10px; border-radius: 5px; background: rgba(255, 255, 255, 0.15); }
.t-main { flex: 1; min-width: 0; }
.t-search { margin: 8px 12px 0; height: 22px; border-radius: 8px; background: #fff; border: 1px solid var(--line); }
.t-rows { display: flex; flex-direction: column; gap: 6px; }
.t-rows i { height: 22px; border-radius: 6px; background: #fff; border: 1px solid var(--line); }

/* الدخول */
.l-wrap { display: grid; grid-template-columns: 1fr 1.1fr; height: 100%; }
.l-form { display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 16px; background: #f7f8fc; }
.l-form b { font-size: 0.85rem; }
.l-form i { height: 22px; border-radius: 6px; background: #fff; border: 1px solid var(--line); }
.l-form span { height: 24px; border-radius: 6px; background: #3159e8; }
.l-cover { position: relative; background-color: var(--school-1); background-size: cover; background-position: center; color: #fff; display: flex; align-items: flex-end; }
.l-shade { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)); }
.l-body { position: relative; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.l-body strong { font-size: 1.1rem; }
.l-body small { opacity: 0.9; }

/* الكشف */
.pv--print { background: #e9ecf2; display: grid; place-items: center; }
.p-sheet { width: 74%; height: 92%; background: #fff; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); padding: 14px; }
.p-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.p-title { display: flex; flex-direction: column; align-items: center; line-height: 1.3; }
.p-title b { font-size: 0.95rem; }
.p-title small { font-size: 0.62rem; color: #64748b; }
.p-line { height: 3px; margin: 10px 0; background: linear-gradient(90deg, var(--school-1), var(--school-2)); }
.p-rows { display: flex; flex-direction: column; gap: 6px; }
.p-rows i { height: 16px; background: #f1f3f8; border-radius: 3px; }
</style>
