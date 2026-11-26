<template>
  <!-- SM11: هوية المدرسة — الشعار والألوان وصورة الغلاف (تعتمدها الإدارة العامة) -->
  <div v-if="draft" class="sid">
    <PageHeader :title="t('menu.school-identity')" subtitle="شعار مدرستك وألوانها وغلافها. تظهر لتلاميذك وأوليائهم ومعلميك بعد اعتماد المدير العام، دون تغيير قوالب الأطوار." />

    <!-- حالة الطلب -->
    <div class="status" :class="'status--' + state">
      <i :class="stateIcon" />
      <div>
        <strong>{{ stateTitle }}</strong>
        <p v-if="state === 'pending'">أُرسل {{ fmt(request.submittedAt) }}. الهوية الحالية تبقى ظاهرة حتى الاعتماد.</p>
        <p v-else-if="state === 'rejected'">ملاحظة المدير العام: «{{ request.note }}» — عدّل ثم أعد الإرسال.</p>
        <p v-else>أي تعديل تُرسله يمرّ على المدير العام قبل أن يظهر.</p>
      </div>
      <Button v-if="state === 'pending'" label="سحب الطلب" severity="secondary" text size="small" icon="pi pi-undo" :loading="busy" @click="cancel" />
    </div>

    <div class="sid__grid">
      <!-- النموذج -->
      <div class="sid__form">
        <!-- 1. الشعار -->
        <section class="panel blk">
          <header class="blk__h"><span>1</span><div><h2>شعار المدرسة</h2><small>يظهر بجانب شعار المؤسسة. يُفضّل مربّعاً بخلفية شفافة (PNG أو SVG).</small></div></header>
          <div class="logo-row">
            <div class="logo-sizes">
              <SchoolLogo :school="school" :branding="draft" :size="72" />
              <SchoolLogo :school="school" :branding="draft" :size="44" />
              <SchoolLogo :school="school" :branding="draft" :size="28" />
            </div>
            <div class="logo-actions">
              <label class="up"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" @change="pickLogo" /><i class="pi pi-upload" /> {{ draft.logo ? 'تغيير الشعار' : 'رفع الشعار' }}</label>
              <Button v-if="draft.logo" label="إزالة" icon="pi pi-trash" severity="danger" text size="small" @click="draft.logo = null" />
              <small class="muted">دون شعار، تُرسم شارة بالحرف الأول وبلوني المدرسة.</small>
            </div>
          </div>
        </section>

        <!-- 2. الألوان -->
        <section class="panel blk">
          <header class="blk__h"><span>2</span><div><h2>لونا المدرسة</h2><small>يُستعملان في الشريط العلوي والغلاف والشارة فقط. أزرار المنصة وألوان المواد لا تتغير.</small></div></header>
          <div class="presets">
            <button v-for="p in PRESETS" :key="p.join()" type="button" class="preset" :class="{ on: draft.primary === p[0] && draft.secondary === p[1] }" :title="p.join(' / ')" @click="setPair(p)">
              <span :style="{ background: p[0] }" /><span :style="{ background: p[1] }" />
            </button>
          </div>
          <div class="colors">
            <label v-for="k in ['primary', 'secondary']" :key="k" class="color">
              <span>{{ k === 'primary' ? 'اللون الأساسي' : 'اللون الثانوي' }}</span>
              <div class="color__in">
                <input v-model="draft[k]" type="color" />
                <input :value="draft[k]" class="hex" dir="ltr" maxlength="7" @change="setHex(k, $event.target.value)" />
              </div>
            </label>
          </div>
          <div class="checks">
            <span class="chk" :class="okPrimary ? 'ok' : 'warn'">
              <i :class="okPrimary ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'" />
              الكتابة فوق اللون الأساسي: تباين {{ ratio }} — {{ okPrimary ? 'مقروء' : 'ضعيف، اختر لوناً أغمق' }}
            </span>
            <span v-if="tooClose" class="chk warn"><i class="pi pi-exclamation-triangle" /> اللونان متقاربان جداً، الشريط لن يُميَّز</span>
          </div>
        </section>

        <!-- 3. الغلاف -->
        <section class="panel blk">
          <header class="blk__h"><span>3</span><div><h2>غلاف المدرسة</h2><small>يظهر أعلى رئيسية التلميذ وفي صفحة دخول المدرسة. زخرفة جاهزة بألوانكم أو صورة (يُنصح بـ 1600×480).</small></div></header>
          <div class="covers">
            <button v-for="(p, key) in COVER_PATTERNS" :key="key" type="button" class="cover" :class="{ on: draft.cover === 'pattern:' + key }" :style="{ backgroundImage: coverCss({ ...draft, cover: 'pattern:' + key }) }" @click="draft.cover = 'pattern:' + key">
              <span>{{ p.label }}</span>
            </button>
            <label class="cover cover--up" :class="{ on: customCover }" :style="customCover ? { backgroundImage: coverCss(draft) } : null">
              <input type="file" accept="image/png,image/jpeg,image/webp" @change="pickCover" />
              <span><i class="pi pi-image" /> {{ customCover ? 'تغيير الصورة' : 'صورة خاصة' }}</span>
            </label>
          </div>
        </section>

        <!-- 4. الترحيب -->
        <section class="panel blk">
          <header class="blk__h"><span>4</span><div><h2>رسالة الترحيب</h2><small>جملة قصيرة تظهر على الغلاف.</small></div></header>
          <Textarea v-model="draft.welcome" rows="2" maxlength="120" auto-resize fluid />
          <small class="muted count">{{ draft.welcome.length }} / 120</small>
        </section>

        <div class="actions">
          <Button label="الرجوع إلى الهوية المعتمدة" severity="secondary" text icon="pi pi-refresh" :disabled="!changedFromApproved" @click="resetToApproved" />
          <Button label="إرسال للاعتماد" icon="pi pi-send" :loading="busy" :disabled="!canSubmit" @click="submit" />
        </div>
      </div>

      <!-- المعاينة -->
      <aside class="sid__preview">
        <div class="panel">
          <header class="pv-h">
            <h2>المعاينة</h2>
            <div class="pv-tabs">
              <button v-for="m in MODES" :key="m.key" type="button" class="pill" :class="{ 'is-active': mode === m.key }" @click="mode = m.key">{{ m.label }}</button>
            </div>
          </header>
          <BrandPreview :school="school" :branding="draft" :mode="mode" />
          <p class="muted pv-note"><i class="pi pi-info-circle" /> بنية القالب وألوانه ثابتة لكل طور. مساحة المدرسة: الشعار، الشريط، الغلاف والرسالة.</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import PageHeader from '@/components/PageHeader.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import BrandPreview from '@/components/brand/BrandPreview.vue'
import { useAuthStore } from '@/stores/auth'
import { getBranding, submitRequest, cancelRequest } from '@/api/branding'
import { COVER_PATTERNS, coverCss } from '@/utils/coverPatterns'
import { contrast, isHex } from '@/utils/color'
import { readImage } from '@/utils/image'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const PRESETS = [
  ['#0f7b5a', '#e8b54a'], ['#1f5f8b', '#f2cf5b'], ['#8e2445', '#f0a35e'], ['#6d2c91', '#f7b538'],
  ['#1b4332', '#95d5b2'], ['#14213d', '#fca311'], ['#7f4f24', '#ddb892'], ['#005f73', '#ee9b00']
]
const MODES = [
  { key: 'kids', label: 'البراعم' }, { key: 'juniors', label: 'المستكشفون' }, { key: 'teens', label: 'الشباب' },
  { key: 'login', label: 'صفحة الدخول' }, { key: 'print', label: 'الكشف المطبوع' }
]

const school = ref(null)
const approved = ref(null)
const request = ref(null)
const draft = ref(null)
const mode = ref('juniors')
const busy = ref(false)

async function load() {
  const res = await getBranding(auth.active.school.id)
  school.value = res.school
  approved.value = res.branding
  request.value = res.request
  draft.value = { ...(res.request ? res.request.data : res.branding) }
}
onMounted(load)

const state = computed(() => request.value?.status || 'approved')
const stateTitle = computed(() => ({ pending: 'طلب تعديل بانتظار اعتماد المدير العام', rejected: 'رُفض طلب التعديل الأخير', approved: 'الهوية الحالية معتمدة وظاهرة' })[state.value])
const stateIcon = computed(() => ({ pending: 'pi pi-clock', rejected: 'pi pi-times-circle', approved: 'pi pi-verified' })[state.value])

const ratio = computed(() => contrast(draft.value.primary, '#ffffff'))
const okPrimary = computed(() => ratio.value >= 3)
const tooClose = computed(() => contrast(draft.value.primary, draft.value.secondary) < 1.4)
const customCover = computed(() => draft.value.cover && !draft.value.cover.startsWith('pattern:'))
const same = (a, b) => ['logo', 'primary', 'secondary', 'cover', 'welcome'].every((k) => (a?.[k] || '') === (b?.[k] || ''))
const changedFromApproved = computed(() => !same(draft.value, approved.value))
const canSubmit = computed(() => changedFromApproved.value && okPrimary.value && !(state.value === 'pending' && same(draft.value, request.value.data)))

function setPair([p, s]) {
  draft.value.primary = p
  draft.value.secondary = s
}
function setHex(k, v) {
  const val = v.startsWith('#') ? v : '#' + v
  if (isHex(val)) draft.value[k] = val.toLowerCase()
}
function resetToApproved() {
  draft.value = { ...approved.value }
}
async function pickLogo(e) {
  try {
    draft.value.logo = (await readImage(e.target.files[0], { maxSide: 256, maxBytes: 1024 * 1024 })).url
  } catch (err) {
    toast.add({ severity: 'warn', summary: 'الشعار', detail: err.message, life: 3500 })
  }
  e.target.value = ''
}
async function pickCover(e) {
  try {
    const img = await readImage(e.target.files[0], { maxSide: 1600, type: 'image/jpeg', quality: 0.8, maxBytes: 4 * 1024 * 1024 })
    draft.value.cover = img.url
    if (img.width && img.width < 1000) toast.add({ severity: 'info', summary: 'الغلاف', detail: 'الصورة صغيرة وقد تظهر مشوّشة على الشاشات الكبيرة', life: 3500 })
  } catch (err) {
    toast.add({ severity: 'warn', summary: 'الغلاف', detail: err.message, life: 3500 })
  }
  e.target.value = ''
}
async function submit() {
  busy.value = true
  try {
    const res = await submitRequest(school.value.id, { ...draft.value }, auth.person.id)
    request.value = res.request
    toast.add({ severity: 'success', summary: 'أُرسل الطلب', detail: 'سيظهر التعديل بعد اعتماد المدير العام', life: 3000 })
  } finally {
    busy.value = false
  }
}
async function cancel() {
  busy.value = true
  try {
    const res = await cancelRequest(request.value.id)
    request.value = res.request
    draft.value = { ...res.branding }
  } finally {
    busy.value = false
  }
}
const fmt = (iso) => new Date(iso).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.status { display: flex; align-items: center; gap: 0.9rem; padding: 0.85rem 1.1rem; border-radius: var(--radius-lg); margin-bottom: 1.25rem; border: 1px solid; }
.status > i { font-size: 1.4rem; }
.status strong { display: block; }
.status p { margin: 0.15rem 0 0; font-size: 0.88rem; opacity: 0.85; }
.status .p-button { margin-inline-start: auto; }
.status--approved { background: #ecfdf3; border-color: #b7ebc9; color: #146c3c; }
.status--pending { background: #fff8e6; border-color: #f5dd9a; color: #8a5a00; }
.status--rejected { background: #fdeeee; border-color: #f3c2c2; color: #a12a2a; }

.sid__grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
.sid__form { display: flex; flex-direction: column; gap: 1rem; }
.sid__preview { position: sticky; top: 80px; }
.blk__h { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.blk__h > span { width: 28px; height: 28px; border-radius: 50%; background: var(--brand); color: #fff; display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
.blk__h h2 { margin: 0; font-size: 1.05rem; }
.blk__h small { color: var(--p-text-muted-color); }

.logo-row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.logo-sizes { display: flex; align-items: flex-end; gap: 0.9rem; padding: 0.75rem 1rem; background: var(--bg); border-radius: 12px; }
.logo-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; }
.up { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 1rem; border-radius: 10px; border: 1.5px dashed var(--brand); color: var(--brand); font-weight: 700; cursor: pointer; }
.up input, .cover--up input { display: none; }

.presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.preset { display: flex; width: 54px; height: 30px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; padding: 0; cursor: pointer; box-shadow: 0 0 0 1px var(--line); }
.preset span { flex: 1; }
.preset.on { border-color: var(--ink); }
.colors { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.color > span { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.3rem; }
.color__in { display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--line); border-radius: 10px; padding: 0.3rem; background: var(--surface); }
.color__in input[type='color'] { width: 40px; height: 32px; border: 0; padding: 0; background: none; cursor: pointer; }
.hex { flex: 1; min-width: 0; border: 0; font: inherit; font-family: monospace; background: none; color: var(--ink); outline: none; }
.checks { display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.85rem; }
.chk { font-size: 0.84rem; display: flex; gap: 0.4rem; align-items: center; }
.chk.ok { color: #146c3c; }
.chk.warn { color: #a15c00; }

.covers { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.6rem; }
.cover { position: relative; height: 72px; border-radius: 12px; border: 3px solid transparent; background-size: cover; background-position: center; cursor: pointer; padding: 0; display: flex; align-items: flex-end; overflow: hidden; box-shadow: 0 0 0 1px var(--line); }
.cover span { position: relative; width: 100%; padding: 0.2rem 0.5rem; font-size: 0.78rem; font-weight: 700; color: #fff; background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent); text-align: start; }
.cover.on { border-color: var(--ink); }
.cover--up { background-color: var(--bg); justify-content: center; align-items: center; }
.cover--up:not(.on) span { background: none; color: var(--brand); text-align: center; }
.count { display: block; text-align: end; margin-top: 0.25rem; }

.actions { display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.pv-h { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
.pv-h h2 { margin: 0; font-size: 1.05rem; }
.pv-tabs { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.pv-tabs .pill { padding: 0.3rem 0.7rem; font-size: 0.78rem; }
.pv-note { font-size: 0.8rem; margin: 0.75rem 0 0; }

@media (max-width: 1100px) {
  .sid__grid { grid-template-columns: 1fr; }
  .sid__preview { position: static; order: -1; }
}
</style>
