<template>
  <!-- AD13: تخصيص المنصة — اسم المؤسسة وشعارها (يظهر في كل المنصة بجانب شعار المدرسة) -->
  <div v-if="f">
    <PageHeader title="تخصيص المنصة" subtitle="هوية المؤسسة العامة: الاسم والشعار ومعلومات الدعم. تظهر في كل الصفحات، وبجانبها شعار كل مدرسة." />
    <Message v-if="!canEdit" severity="info" class="mb"><i class="pi pi-lock" /> التعديل من صلاحية المدير العام.</Message>
    <div class="cz">
      <form class="panel cz__f" @submit.prevent="save">
        <h3>شعار المؤسسة</h3>
        <div class="logo">
          <div class="logo__pv"><InstitutionMark :size="76" /><InstitutionMark :size="40" /><span class="dk"><InstitutionMark :size="40" tone="light" /></span></div>
          <div class="logo__a">
            <label class="up" :class="{ off: !canEdit }"><input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" :disabled="!canEdit" @change="pickLogo" /><i class="pi pi-upload" /> {{ f.logo ? 'تغيير الشعار' : 'رفع الشعار' }}</label>
            <Button v-if="f.logo && canEdit" label="الرجوع للشعار الافتراضي" text size="small" severity="secondary" @click="f.logo = null; preview()" />
            <small class="muted">PNG أو SVG بخلفية شفافة، مربّع، 512×512 على الأقل.</small>
          </div>
        </div>
        <h3>الأسماء</h3>
        <div class="g2">
          <label class="fl"><span>اسم المنصة الكامل</span><InputText v-model="f.name" :disabled="!canEdit" fluid @input="preview" /></label>
          <label class="fl"><span>الاسم المختصر</span><InputText v-model="f.short" :disabled="!canEdit" fluid /></label>
          <label class="fl full"><span>الشعار النصي (صفحة الدخول)</span><InputText v-model="f.tagline" :disabled="!canEdit" fluid /></label>
        </div>
        <h3>الدعم والتواصل</h3>
        <div class="g2">
          <label class="fl"><span>بريد الدعم</span><InputText v-model="f.supportEmail" dir="ltr" :disabled="!canEdit" fluid /></label>
          <label class="fl"><span>هاتف الدعم</span><InputText v-model="f.supportPhone" dir="ltr" :disabled="!canEdit" fluid /></label>
          <label class="fl full"><span>تنبيه في صفحة الدخول (اختياري)</span><InputText v-model="f.loginNotice" :disabled="!canEdit" fluid placeholder="مثال: صيانة مبرمجة ليلة الخميس من 23:00 إلى 01:00" /></label>
        </div>
        <div v-if="canEdit" class="act"><Button type="submit" label="حفظ ونشر" icon="pi pi-check" :loading="busy" /></div>
      </form>
      <!-- التأثيرات البصرية لكل ثيم -->
      <section class="panel fx full2">
        <h3>التأثيرات البصرية</h3>
        <p class="muted small">لكل ثيم من الثيمات الأربعة تأثيراته، دون تغيير ألوانه. الهدف: منصة حيوية وأنيقة ومريحة للعين.</p>
        <div class="fx__tabs">
          <button v-for="th in FX_THEMES" :key="th.key" type="button" class="pill" :class="{ 'is-active': fxTheme === th.key }" @click="fxTheme = th.key"><i :class="th.icon" /> {{ th.label }}</button>
        </div>
        <div class="fx__body">
          <div class="fx__ctl">
            <template v-for="(o, k) in FX_OPTIONS" :key="k">
              <label v-if="o.type === 'toggle'" class="fx__row"><ToggleSwitch v-model="f.effects[fxTheme][k]" :disabled="!canEdit" /><div><b>{{ o.label }}</b><small class="muted">{{ o.hint }}</small></div></label>
              <div v-else class="fx__row col"><b>{{ o.label }}</b>
                <div class="seg"><button v-for="op in o.options" :key="op.value" type="button" :class="{ on: f.effects[fxTheme][k] === op.value }" :disabled="!canEdit" @click="f.effects[fxTheme][k] = op.value">{{ op.label }}</button></div>
                <small v-if="o.hint" class="muted">{{ o.hint }}</small>
              </div>
            </template>
            <div class="fx__act">
              <Button v-if="canEdit" label="القيم الافتراضية لهذا الثيم" icon="pi pi-undo" text size="small" @click="f.effects[fxTheme] = { ...DEFAULT_EFFECTS[fxTheme] }" />
              <Button v-if="canEdit" label="حفظ ونشر التأثيرات" icon="pi pi-check" size="small" :loading="busy" @click="save" />
            </div>
          </div>
          <div class="fx-preview" v-bind="fxAttrs(f.effects[fxTheme])" :data-theme="fxTheme">
            <div :key="JSON.stringify(f.effects[fxTheme])" class="fx-stage">
              <div class="fx-card"><i class="pi pi-book" /><b>درس اليوم</b><small>الطهارة وأحكامها</small></div>
              <div class="fx-card"><i class="pi pi-star" /><b>120 نقطة</b><small>المستوى 2</small></div>
              <div class="fx-card wide"><i class="pi pi-check-circle" /><b>واجب: أحكام البيع</b><small>آخر أجل غداً</small></div>
            </div>
          </div>
        </div>
      </section>
      <aside class="panel">
        <h3>كيف يظهر</h3>
        <div class="pv-bar"><BrandPair :school="brand.school" :branding="brand.branding" :size="34" names /></div>
        <div class="pv-login"><InstitutionMark :size="34" tone="light" /><b>{{ f.name }}</b><small>{{ f.tagline }}</small></div>
        <p class="muted small">شعار المؤسسة ثابت في كل المدارس، وشعار المدرسة يتغيّر حسب مدرسة المستخدم (يُدار من «هوية المدرسة» ويعتمده المدير العام).</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { isTop } from '@/config/roles'
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import InstitutionMark from '@/components/brand/InstitutionMark.vue'
import BrandPair from '@/components/brand/BrandPair.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrandStore } from '@/stores/brand'
import { usePlatformStore } from '@/stores/platform'
import { getPlatform, savePlatform } from '@/api/admin'
import { readImage } from '@/utils/image'
import ToggleSwitch from 'primevue/toggleswitch'
import { FX_THEMES, FX_OPTIONS, DEFAULT_EFFECTS, fxAttrs } from '@/config/effects'
const fxTheme = ref('staff')

const auth = useAuthStore()
const brand = useBrandStore()
const platform = usePlatformStore()
const toast = useToast()
const f = ref(null)
const busy = ref(false)
const saved = ref(null)
const canEdit = computed(() => isTop(auth.role))
onMounted(async () => {
  saved.value = await getPlatform()
  f.value = { ...saved.value }
})
// معاينة مباشرة في كل الصفحة (تُلغى إن لم يُحفظ)
const preview = () => platform.set({ logo: f.value.logo, name: f.value.name })
async function pickLogo(e) {
  try {
    f.value.logo = (await readImage(e.target.files[0], { maxSide: 512, maxBytes: 2 * 1024 * 1024 })).url
    preview()
  } catch (err) {
    toast.add({ severity: 'warn', summary: err.message, life: 3000 })
  }
  e.target.value = ''
}
async function save() {
  busy.value = true
  try {
    saved.value = await savePlatform({ ...f.value }, auth.role)
    platform.set(saved.value)
    toast.add({ severity: 'success', summary: 'نُشرت هوية المؤسسة', detail: 'تظهر الآن في كل صفحات المنصة', life: 2600 })
  } catch (err) {
    toast.add({ severity: 'error', summary: err.message, life: 3000 })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.full2 { grid-column: 1 / -1; order: 3; }
.small { font-size: 0.82rem; }
.fx__tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; margin: 0.6rem 0 1rem; }
.fx__body { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.2rem; align-items: start; }
.fx__ctl { display: flex; flex-direction: column; gap: 0.9rem; }
.fx__row { display: flex; gap: 0.6rem; align-items: center; }
.fx__row.col { flex-direction: column; align-items: flex-start; gap: 0.35rem; }
.fx__row small { display: block; font-size: 0.76rem; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.seg button { border: 0; background: var(--surface); padding: 0.35rem 0.8rem; font: inherit; font-size: 0.84rem; cursor: pointer; color: inherit; }
.seg button + button { border-inline-start: 1px solid var(--line); }
.seg button.on { background: var(--brand); color: #fff; }
.fx__act { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.fx-preview { border-radius: 18px; padding: 1.4rem; min-height: 230px; border: 1px solid var(--line); overflow: hidden; }
.fx-stage { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
.fx-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
.fx-card.wide { grid-column: 1 / -1; }
.fx-card i { color: var(--brand); font-size: 1.2rem; }
.fx-card small { color: var(--p-text-muted-color); font-size: 0.8rem; }
@media (max-width: 900px) { .fx__body { grid-template-columns: 1fr; } }
.mb { margin-bottom: 1rem; }
.cz { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1rem; align-items: start; }
.cz__f h3, aside h3 { margin: 0 0 0.75rem; font-size: 1rem; }
.cz__f h3:not(:first-child) { margin-top: 1.25rem; }
.logo { display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap; }
.logo__pv { display: flex; gap: 0.9rem; align-items: flex-end; padding: 0.75rem 1rem; background: var(--bg); border-radius: 12px; }
.dk { background: #1b2a5e; padding: 6px; border-radius: 10px; display: inline-grid; }
.logo__a { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; }
.up { display: inline-flex; gap: 0.45rem; align-items: center; padding: 0.5rem 1rem; border: 1.5px dashed var(--brand); color: var(--brand); border-radius: 10px; font-weight: 700; cursor: pointer; }
.up.off { opacity: 0.5; cursor: not-allowed; }
.up input { display: none; }
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1rem; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.act { display: flex; justify-content: flex-end; margin-top: 1.25rem; }
.pv-bar { border: 1px solid var(--line); border-radius: 12px; padding: 0.75rem; margin-bottom: 0.75rem; }
.pv-login { background: linear-gradient(140deg, #1b2a5e, #2d4bb1); color: #fff; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.pv-login small { opacity: 0.85; }
.small { font-size: 0.82rem; margin-top: 0.75rem; }
@media (max-width: 900px) { .cz { grid-template-columns: 1fr; } .g2 { grid-template-columns: 1fr; } }
</style>
