<template>
  <!-- كشف النقاط للطباعة (A4): شعار المؤسسة + شعار المدرسة — لا يتأثر بثيم الطور -->
  <div class="rc-page">
    <div class="rc-tools no-print">
      <Button label="رجوع" icon="pi pi-arrow-right flip" text severity="secondary" @click="router.back()" />
      <Button label="طباعة / حفظ PDF" icon="pi pi-print" @click="print" />
    </div>

    <article v-if="r" class="sheet" :style="vars">
      <header class="sheet__head">
        <div class="side">
          <InstitutionMark :size="64" />
          <small>{{ t('app.name') }}</small>
        </div>
        <div class="mid">
          <small>{{ brand.school?.name }} — {{ brand.school?.commune }}</small>
          <h1>كشف النقاط والتقدّم</h1>
          <small>الموسم الدراسي {{ season }}</small>
        </div>
        <div class="side">
          <SchoolLogo :school="brand.school" :branding="brand.branding" :size="64" />
          <small>{{ brand.school?.name }}</small>
        </div>
      </header>
      <div class="sheet__line" />

      <section class="info">
        <div><span>التلميذ(ة)</span><b>{{ auth.fullName }}</b></div>
        <div><span>القسم</span><b>{{ auth.active.class?.name }}</b></div>
        <div><span>المستوى</span><b>{{ auth.active.level?.name }}</b></div>
        <div><span>تاريخ الإصدار</span><b>{{ today }}</b></div>
      </section>

      <table class="grid">
        <thead>
          <tr><th>المادة</th><th>الدروس المنجزة</th><th>نسبة التقدّم</th><th>الاختبارات</th><th>الواجبات</th><th>المعدل /20</th><th>التقدير</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in r.subjects" :key="s.id">
            <td class="subj">{{ s.name }}</td>
            <td>{{ s.doneCount }} / {{ s.lessonsCount }}</td>
            <td><div class="bar"><span :style="{ width: s.progress + '%' }" /></div>{{ s.progress }}%</td>
            <td>{{ s.quizzesDone }} / {{ s.quizzesTotal }}</td>
            <td>{{ s.homeworkDone }} / {{ s.homeworkTotal }}</td>
            <td class="avg">{{ s.average ?? '—' }}</td>
            <td>{{ grade(s.average) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr><td>المجموع</td><td>{{ r.totals.lessons }} / {{ r.totals.lessonsAll }}</td><td>{{ overall }}%</td><td colspan="2">{{ r.totals.activities }} عملاً منجزاً</td><td class="avg">{{ generalAvg ?? '—' }}</td><td>{{ grade(generalAvg) }}</td></tr>
        </tfoot>
      </table>

      <section class="remarks">
        <div><h3>ملاحظات المعلمين</h3><p class="lines" /></div>
        <div><h3>ملاحظة المدير</h3><p class="lines" /></div>
      </section>

      <footer class="sign">
        <div><span>توقيع الولي</span></div>
        <div><span>ختم وتوقيع مدير المدرسة</span></div>
      </footer>
      <p class="foot">وثيقة صادرة عن {{ t('app.name') }} — {{ brand.school?.name }}</p>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InstitutionMark from '@/components/brand/InstitutionMark.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import * as learning from '@/api/learning'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const brand = useBrandStore()
const r = ref(null)

onMounted(async () => {
  await brand.sync(auth.active)
  r.value = await learning.progressReport(auth.person.id, auth.active.level.id)
})

const vars = computed(() => ({ '--s1': brand.branding?.primary || '#233b85', '--s2': brand.branding?.secondary || '#ffc96b' }))
const today = new Date().toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
const season = (() => { const y = new Date().getFullYear(), m = new Date().getMonth(); return m >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}` })()
const overall = computed(() => (r.value.totals.lessonsAll ? Math.round((r.value.totals.lessons / r.value.totals.lessonsAll) * 100) : 0))
const generalAvg = computed(() => {
  const xs = r.value.subjects.map((s) => s.average).filter((x) => x !== null)
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null
})
const grade = (v) => (v === null || v === undefined ? '—' : v >= 16 ? 'ممتاز' : v >= 14 ? 'جيد جداً' : v >= 12 ? 'جيد' : v >= 10 ? 'مقبول' : 'يحتاج دعماً')
const print = () => window.print()
</script>

<style scoped>
.rc-page { min-height: 100vh; background: #e9ecf2; padding: 1.5rem 1rem 3rem; font-family: Cairo, sans-serif; color: #1a1f36; }
.rc-tools { max-width: 210mm; margin: 0 auto 1rem; display: flex; justify-content: space-between; }
.sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 14mm 14mm 10mm; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); box-sizing: border-box; display: flex; flex-direction: column; }
.sheet__head { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; }
.side { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.side small { font-size: 9pt; color: #475569; }
.mid { text-align: center; }
.mid h1 { margin: 4px 0; font-size: 18pt; }
.mid small { font-size: 9.5pt; color: #475569; }
.sheet__line { height: 4px; margin: 8mm 0 6mm; background: linear-gradient(90deg, var(--s1), var(--s2)); border-radius: 2px; }
.info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-bottom: 6mm; }
.info div { border: 1px solid #dbe1ea; border-radius: 6px; padding: 2.5mm 3mm; }
.info span { display: block; font-size: 8.5pt; color: #64748b; }
.info b { font-size: 10.5pt; }
.grid { width: 100%; border-collapse: collapse; font-size: 10pt; }
.grid th { background: color-mix(in srgb, var(--s1) 12%, #fff); color: #1a1f36; font-weight: 700; padding: 2.5mm 2mm; border: 1px solid #cfd6e1; }
.grid td { padding: 2.5mm 2mm; border: 1px solid #dbe1ea; text-align: center; }
.grid td.subj { text-align: start; font-weight: 700; }
.grid td.avg { font-weight: 800; }
.grid tfoot td { font-weight: 700; background: #f6f8fb; }
.bar { display: inline-block; width: 18mm; height: 2mm; background: #e5e9f0; border-radius: 1mm; overflow: hidden; vertical-align: middle; margin-inline-end: 2mm; }
.bar span { display: block; height: 100%; background: var(--s1); }
.remarks { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 8mm; }
.remarks h3 { font-size: 10.5pt; margin: 0 0 2mm; }
.lines { height: 22mm; margin: 0; background: repeating-linear-gradient(to bottom, transparent 0 6.8mm, #cfd6e1 6.8mm 7mm); }
.sign { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: auto; padding-top: 10mm; }
.sign div { height: 24mm; border: 1px dashed #b8c2d1; border-radius: 6px; padding: 2mm 3mm; font-size: 9.5pt; color: #64748b; }
.foot { text-align: center; font-size: 8pt; color: #94a3b8; margin: 5mm 0 0; }

@media print {
  .rc-page { background: none; padding: 0; }
  .no-print { display: none !important; }
  .sheet { box-shadow: none; width: auto; min-height: 0; height: 277mm; padding: 0; }
}
@media screen and (max-width: 860px) {
  .sheet { width: 100%; min-height: 0; padding: 6mm; }
  .info { grid-template-columns: 1fr 1fr; }
  .grid { font-size: 8.5pt; }
}
</style>
<style>
@page { size: A4; margin: 10mm; }
@media print { body { background: #fff !important; } }
</style>
