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

const auth = useAuthStore()
const brand = useBrandStore()
const platform = usePlatformStore()
const toast = useToast()
const f = ref(null)
const busy = ref(false)
const saved = ref(null)
const canEdit = computed(() => auth.role === 'super_admin')
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
