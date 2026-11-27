<template>
  <!-- طباعة أوراق الدخول: 8 أوراق في صفحة A4 تُقصّ على الخطوط المتقطعة. كل مجموعة (قسم، مدرسة، دور) تبدأ صفحة جديدة على رأسها اسمها -->
  <div class="pp">
    <div class="tools no-print">
      <Button label="رجوع" icon="pi pi-arrow-right flip" text severity="secondary" @click="router.back()" />
      <span v-if="data" class="muted">{{ data.schoolName }} · {{ data.count }} ورقة · {{ data.groups.length }} مجموعة</span>
      <Button label="طباعة / حفظ PDF" icon="pi pi-print" :disabled="!data" @click="print" />
    </div>
    <p v-if="!data" class="empty no-print">لا أوراق للطباعة. ولّدها من شاشة «أوراق الدخول».</p>
    <article v-for="(page, pi) in pages" :key="pi" class="sheet" :style="vars">
      <h2 class="grp">{{ page.group }}<small v-if="page.part > 1"> (تابع {{ page.part }})</small></h2>
      <div class="grid">
      <div v-for="(c, i) in page.cards" :key="i" class="card" :class="{ alt: data.category !== 'students' }">
        <header class="hd">
          <InstitutionMark :size="30" />
          <div class="hd__t"><b>{{ tr('app.name') }}</b><small>{{ c.schoolName || data.schoolName }}</small></div>
          <SchoolLogo v-if="data.schoolId" :school="brand.school" :branding="brand.branding" :size="30" />
        </header>
        <div class="who">
          <small>{{ c.sub }}</small>
          <b>{{ c.name }}</b>
        </div>
        <div class="body">
          <dl>
            <div><dt>اسم المستخدم</dt><dd dir="ltr">{{ c.username }}</dd></div>
            <div><dt>كلمة المرور المؤقتة</dt><dd dir="ltr" class="pw">{{ c.temp }}</dd></div>
          </dl>
          <img v-if="qr[c.username]" :src="qr[c.username]" alt="رمز QR لصفحة الدخول" class="qr" />
        </div>
        <p class="link" dir="ltr">{{ urlOf(c) }}</p>
        <p class="note">عند أول دخول تطلب منك المنصة كلمة مرور جديدة. احفظها ولا تعطها لأحد.</p>
      </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import QRCode from 'qrcode'
import InstitutionMark from '@/components/brand/InstitutionMark.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import { storage } from '@/utils/storage'

const { t: tr } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const brand = useBrandStore()
const data = ref(storage.get('ist.loginSheets'))
const qr = ref({})
// رابط صفحة دخول المدرسة (أو صفحة الدخول العامة للطاقم)؛ ورمز QR يفتحها واسم المستخدم مكتوب مسبقاً
const urlOf = (c) => `${location.origin}${location.pathname}#/${c.slug ? 's/' + c.slug : 'login'}`
// كل مجموعة تبدأ صفحة جديدة، 8 أوراق في الصفحة
const pages = computed(() => (data.value?.groups || []).flatMap((g) => Array.from({ length: Math.ceil(g.rows.length / 8) }, (_, i) => ({ group: g.name, part: i + 1, cards: g.rows.slice(i * 8, i * 8 + 8) }))))
const cards = computed(() => (data.value?.groups || []).flatMap((g) => g.rows))
const vars = computed(() => ({ '--s1': brand.branding?.primary || '#233b85', '--s2': brand.branding?.secondary || '#ffc96b' }))
onMounted(async () => {
  await brand.sync(auth.active)
  const out = {}
  for (const c of cards.value) out[c.username] = await QRCode.toDataURL(`${urlOf(c)}?u=${encodeURIComponent(c.username)}`, { margin: 0, width: 160 })
  qr.value = out
})
const print = () => window.print()
</script>

<style scoped>
.pp { min-height: 100vh; background: #e9ecf2; padding: 1.5rem 1rem 3rem; font-family: Cairo, sans-serif; color: #1a1f36; }
.tools { max-width: 210mm; margin: 0 auto 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.empty { text-align: center; color: #64748b; }
.sheet { width: 210mm; height: 297mm; margin: 0 auto 1rem; background: #fff; padding: 6mm 8mm 8mm; box-sizing: border-box; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); display: flex; flex-direction: column; }
.grp { margin: 0 0 3mm; font-size: 12pt; color: var(--s1); border-bottom: 1px solid #cbd5e1; padding-bottom: 1.5mm; }
.grp small { font-size: 9pt; color: #64748b; font-weight: 400; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); }
.card { border: 1px dashed #9aa6b8; padding: 4mm 5mm; display: flex; flex-direction: column; gap: 2mm; overflow: hidden; }
.card.alt { background: #fbfaf4; }
.hd { display: flex; align-items: center; gap: 2mm; border-bottom: 2px solid var(--s1); padding-bottom: 2mm; }
.hd__t { flex: 1; display: flex; flex-direction: column; line-height: 1.25; }
.hd__t b { font-size: 9pt; }
.hd__t small { font-size: 8pt; color: #475569; }
.who small { display: block; font-size: 8pt; color: #64748b; }
.who b { font-size: 12pt; }
.body { display: flex; gap: 3mm; align-items: center; }
dl { flex: 1; margin: 0; display: flex; flex-direction: column; gap: 1.5mm; }
dt { font-size: 7.5pt; color: #64748b; }
dd { margin: 0; font-family: monospace; font-size: 12pt; font-weight: 700; text-align: end; }
.pw { letter-spacing: 1.5px; background: #f1f4f9; border-radius: 4px; padding: 0.5mm 2mm; }
.qr { width: 22mm; height: 22mm; }
.link { margin: 0; font-size: 7pt; color: #475569; word-break: break-all; text-align: center; }
.note { margin: 0; font-size: 7.5pt; color: #64748b; }
@media print {
  .pp { background: none; padding: 0; }
  .no-print { display: none !important; }
  .sheet { box-shadow: none; margin: 0; page-break-after: always; }
}
</style>
