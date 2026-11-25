<template>
  <!-- ورقة الاختبار الحضوري A4 + ورقة الإجابات (للمعلم) -->
  <div class="pp">
    <div class="tools no-print">
      <Button label="رجوع" icon="pi pi-arrow-right flip" text severity="secondary" @click="router.back()" />
      <label class="key"><input v-model="withKey" type="checkbox" /> طباعة ورقة الإجابات أيضاً</label>
      <Button label="طباعة / حفظ PDF" icon="pi pi-print" @click="print" />
    </div>
    <article v-if="t" class="sheet" :style="vars">
      <header class="hd">
        <div class="side"><InstitutionMark :size="54" /><small>{{ tr('app.name') }}</small></div>
        <div class="mid"><small>{{ brand.school?.name }}</small><h1>{{ t.title }}</h1><small>{{ t.subjectName }} · {{ t.className }} · المدة: {{ t.duration }}</small></div>
        <div class="side"><SchoolLogo :school="brand.school" :branding="brand.branding" :size="54" /><small>{{ season }}</small></div>
      </header>
      <div class="line" />
      <div class="who"><span>الاسم واللقب: ........................................</span><span>القسم: {{ t.className }}</span><span>التاريخ: {{ t.date ? new Date(t.date).toLocaleDateString('ar-DZ') : '..../..../........' }}</span><span class="mark">العلامة: ......./{{ total }}</span></div>
      <ol class="qs">
        <li v-for="(it, i) in t.items" :key="i">
          <p><b>{{ it.q }}</b> <em>({{ it.points }} {{ it.points > 1 ? 'نقاط' : 'نقطة' }})</em></p>
          <ul v-if="it.kind === 'mcq'" class="opts"><li v-for="(o, oi) in it.options" :key="oi"><span class="box" /> {{ o }}</li></ul>
          <div v-else class="lines" :style="{ height: (it.lines || 4) * 8 + 'mm' }" />
        </li>
      </ol>
      <p class="foot">بالتوفيق والسداد</p>
    </article>
    <article v-if="t && withKey" class="sheet key-sheet">
      <h2>ورقة الإجابات — {{ t.title }}</h2>
      <ol><li v-for="(it, i) in t.items" :key="i">{{ it.kind === 'mcq' ? it.options[it.answer] : '(سؤال مقالي — حسب سلّم التنقيط)' }}</li></ol>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InstitutionMark from '@/components/brand/InstitutionMark.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import { getOfflineTest } from '@/api/teaching'

const { t: tr } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const brand = useBrandStore()
const t = ref(null)
const withKey = ref(false)
onMounted(async () => {
  await brand.sync(auth.active)
  t.value = await getOfflineTest(route.params.id)
})
const total = computed(() => t.value.items.reduce((n, x) => n + (x.points || 0), 0))
const vars = computed(() => ({ '--s1': brand.branding?.primary || '#233b85', '--s2': brand.branding?.secondary || '#ffc96b' }))
const season = (() => { const y = new Date().getFullYear(), m = new Date().getMonth(); return m >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}` })()
const print = () => window.print()
</script>

<style scoped>
.pp { min-height: 100vh; background: #e9ecf2; padding: 1.5rem 1rem 3rem; font-family: Cairo, sans-serif; color: #1a1f36; }
.tools { max-width: 210mm; margin: 0 auto 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.key { font-size: 0.9rem; display: flex; gap: 0.4rem; align-items: center; }
.sheet { width: 210mm; min-height: 297mm; margin: 0 auto 1rem; background: #fff; padding: 12mm 14mm; box-sizing: border-box; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
.hd { display: grid; grid-template-columns: 1fr 2.2fr 1fr; align-items: center; }
.side { display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
.side small { font-size: 8.5pt; color: #475569; }
.mid { text-align: center; }
.mid h1 { font-size: 16pt; margin: 3px 0; }
.mid small { font-size: 9pt; color: #475569; }
.line { height: 3px; background: linear-gradient(90deg, var(--s1), var(--s2)); margin: 6mm 0 4mm; }
.who { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 3mm 6mm; font-size: 10pt; border: 1px solid #cfd6e1; border-radius: 6px; padding: 3mm 4mm; }
.mark { font-weight: 800; }
.qs { padding-inline-start: 6mm; margin: 6mm 0 0; font-size: 11pt; }
.qs > li { margin-bottom: 5mm; }
.qs p { margin: 0 0 2mm; }
.qs em { font-style: normal; color: #64748b; font-size: 9pt; }
.opts { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 6mm; }
.box { display: inline-block; width: 3.5mm; height: 3.5mm; border: 1px solid #1a1f36; margin-inline-end: 2mm; vertical-align: middle; }
.lines { background: repeating-linear-gradient(to bottom, transparent 0 7.6mm, #cfd6e1 7.6mm 8mm); }
.foot { text-align: center; margin-top: 8mm; color: #64748b; }
.key-sheet h2 { font-size: 14pt; }
@media print {
  .pp { background: none; padding: 0; }
  .no-print { display: none !important; }
  .sheet { box-shadow: none; width: auto; min-height: 0; margin: 0; padding: 0; page-break-after: always; }
}
</style>
