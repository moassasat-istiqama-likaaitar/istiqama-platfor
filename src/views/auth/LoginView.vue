<template>
  <!-- AU01: تسجيل الدخول — صفحة المؤسسة العامة أو صفحة كل مدرسة (#/s/اسم-المدرسة) والحسابات التجريبية -->
  <div class="login">
    <!-- اللوحة الترحيبية: حيادية لكل الفئات -->
    <section class="brand" :class="{ 'brand--school': sb }" :style="sb ? { backgroundImage: coverCss(sb.branding), '--sp': sb.branding.primary } : null">
      <svg v-if="!sb" class="pattern" aria-hidden="true">
        <defs>
          <pattern id="star8" width="72" height="72" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1.2">
              <rect x="20" y="20" width="32" height="32" />
              <rect x="20" y="20" width="32" height="32" transform="rotate(45 36 36)" />
              <circle cx="36" cy="36" r="6" />
            </g>
          </pattern>
        </defs>
        <rect width="200%" height="200%" fill="url(#star8)" class="pattern__move" />
      </svg>
      <!-- صفحة دخول المدرسة: غلافها + الشعاران + رسالتها -->
      <div v-if="sb" class="brand__inner">
        <BrandPair :school="sb.school" :branding="sb.branding" :size="56" tone="light" />
        <h1>{{ sb.school.name }}</h1>
        <p v-if="sb.branding.welcome" class="brand__welcome">{{ sb.branding.welcome }}</p>
        <div class="brand__foot">
          <span><i class="pi pi-map-marker" /> {{ sb.school.commune }}</span>
          <span><i class="pi pi-sitemap" /> {{ t('app.name') }}</span>
        </div>
      </div>
      <div v-else class="brand__inner">
        <div class="brand__logo"><InstitutionMark :size="46" tone="light" />{{ t('app.name') }}</div>
        <h1>فضاء تعليمي واحد<br /><span>لكل المدارس والأطوار</span></h1>
        <p>{{ t('app.tagline') }}</p>

        <div class="aud">
          <div v-for="(a, i) in audiences" :key="a.t" class="aud__card" :style="{ animationDelay: i * 0.12 + 's' }">
            <span class="aud__icon"><i :class="a.i" /></span>
            <div><strong>{{ a.t }}</strong><small>{{ a.d }}</small></div>
          </div>
        </div>

        <div class="brand__foot">
          <span><i class="pi pi-building" /> مدارس متعددة</span>
          <span><i class="pi pi-desktop" /> حضوري وعن بعد</span>
          <span><i class="pi pi-globe" /> عربية · Français · English</span>
        </div>
      </div>
    </section>

    <!-- النموذج -->
    <section class="form-side">
      <div class="card">
        <h2 v-if="sb">مرحباً بكم في {{ sb.school.name }}</h2>
        <h2 v-else>{{ t('auth.welcome') }} 👋</h2>
        <p class="muted">{{ t('auth.loginHint') }}</p>
        <Message v-if="slugError" severity="warn" size="small">{{ slugError }}</Message>

        <form class="form" @submit.prevent="submit">
          <label class="field">
            <span>{{ t('auth.login') }}</span>
            <IconField>
              <InputIcon class="pi pi-user" />
              <InputText v-model.trim="form.login" autocomplete="username" fluid size="large" :invalid="!!error" />
            </IconField>
          </label>
          <label class="field">
            <span>{{ t('auth.password') }}</span>
            <Password v-model="form.password" :feedback="false" toggle-mask fluid size="large" autocomplete="current-password" :invalid="!!error" />
          </label>
          <div class="form__row">
            <label class="check"><Checkbox v-model="form.remember" binary /> {{ t('auth.remember') }}</label>
            <RouterLink :to="{ name: 'forgot' }" class="link">{{ t('auth.forgot') }}</RouterLink>
          </div>
          <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
          <Button type="submit" :label="t('auth.submit')" icon="pi pi-arrow-left flip" icon-pos="right" :loading="loading" fluid size="large" />
          <Button type="button" :label="t('auth.google')" icon="pi pi-google" severity="secondary" outlined fluid @click="google" />
        </form>
        <RouterLink v-if="sb" :to="{ name: 'login' }" class="other-school"><i class="pi pi-arrow-right flip" /> ليست مدرستك؟ الصفحة العامة للمؤسسة</RouterLink>
      </div>

      <!-- وضع العرض: خاص بالنموذج التجريبي -->
      <div class="demo">
        <div class="demo__head"><i class="pi pi-eye" /> {{ t('auth.demoTitle') }} <small>{{ t('auth.demoHint') }}</small></div>
        <div v-if="!sb" class="demo__group">
          <h4>صفحات دخول المدارس (رابط خاص بكل مدرسة)</h4>
          <div class="demo__list">
            <RouterLink v-for="s in schoolLinks" :key="s.school.id" :to="`/s/${s.school.slug}`" class="acc acc--school">
              <SchoolLogo :school="s.school" :branding="s.branding" :size="34" />
              <span class="acc__info"><strong>{{ s.school.name }}</strong><small dir="ltr">#/s/{{ s.school.slug }}</small></span>
            </RouterLink>
          </div>
        </div>
        <p v-if="sb && !groups.length" class="muted demo__empty">لا توجد حسابات تجريبية في هذه المدرسة بعد. جرّب رابط مدرسة النور أو الفرقان.</p>
        <div v-for="g in groups" :key="g.key" class="demo__group">
          <h4>{{ g.title }}</h4>
          <div class="demo__list">
            <button v-for="acc in g.items" :key="acc.username" type="button" class="acc" :disabled="loading" :style="{ '--ac': acc.color }" @click="quick(acc)">
              <span class="acc__av">{{ acc.name.charAt(0) }}</span>
              <span class="acc__info">
                <strong>{{ acc.name }}</strong>
                <small>{{ acc.caption }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useAuthStore } from '@/stores/auth'
import { demoAccounts } from '@/api/auth'
import { getBySlug, listSchools } from '@/api/branding'
import { coverCss } from '@/utils/coverPatterns'
import BrandPair from '@/components/brand/BrandPair.vue'
import SchoolLogo from '@/components/brand/SchoolLogo.vue'
import InstitutionMark from '@/components/brand/InstitutionMark.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const audiences = [
  { i: 'pi pi-book', t: 'التلاميذ', d: 'دروس، أنشطة، ومتابعة التقدّم بواجهة تناسب كل طور' },
  { i: 'pi pi-users', t: 'الأولياء', d: 'متابعة الأبناء والتواصل مع المدرسة' },
  { i: 'pi pi-graduation-cap', t: 'المعلمون', d: 'مكتبة مشتركة، تحضير، وتصحيح' },
  { i: 'pi pi-chart-bar', t: 'الإدارة', d: 'تسيير المدارس والمحتوى والتقارير' }
]
const form = reactive({ login: '', password: '', remember: true })
const loading = ref(false)
const error = ref('')
const demo = ref([])

const sb = ref(null) // هوية المدرسة عند الدخول من رابطها
const slugError = ref('')
const schoolLinks = ref([])

onMounted(async () => {
  demo.value = await demoAccounts()
})
// نفس الصفحة تخدم الرابط العام وروابط المدارس، فنتابع تغيّر الرابط
watch(() => route.params.slug, async (slug) => {
  sb.value = null
  slugError.value = ''
  if (slug) {
    try {
      sb.value = await getBySlug(slug)
    } catch (e) {
      slugError.value = e.message
    }
  } else if (!schoolLinks.value.length) {
    schoolLinks.value = (await listSchools()).slice(0, 3) // المدارس التي فيها حسابات تجريبية
  }
}, { immediate: true })

// تعليق توضيحي لكل حساب تجريبي
const CAPTIONS = {
  anas: ['البراعم · الثالثة ابتدائي', '#ff6b4a'], salma: ['البراعم · الأولى ابتدائي', '#ff6b4a'],
  yahya: ['المستكشفون · الأولى متوسط', '#0a9bdc'], maryam: ['الشباب · الرابعة متوسط', '#6550e0'], ishaq: ['الشباب · الثانية ثانوي', '#6550e0']
}
const groups = computed(() => {
  const roleCaption = (a) => a.roles.map((r) => t(`roles.${r}`)).join(' + ')
  const inSchool = (a) => !sb.value || a.schoolIds.includes(sb.value.school.id)
  const pick = (fn) => demo.value.filter((a) => inSchool(a) && fn(a)).map((a) => ({ ...a, caption: CAPTIONS[a.username]?.[0] || roleCaption(a), color: CAPTIONS[a.username]?.[1] || '#3159e8' }))
  return [
    { key: 's', title: 'التلاميذ', items: pick((a) => a.roles.includes('student')) },
    { key: 'p', title: 'الأولياء والمعلمون', items: pick((a) => !a.roles.includes('student') && !a.roles.includes('school_manager') && a.roles.some((r) => ['parent', 'teacher'].includes(r))) },
    { key: 'm', title: 'إدارة المدرسة', items: pick((a) => a.roles.includes('school_manager')) },
    { key: 'a', title: 'الإدارة والدعم', items: pick((a) => a.roles.some((r) => ['super_admin', 'admin', 'editor', 'support'].includes(r)) && !a.roles.includes('parent')) }
  ].filter((g) => g.items.length)
})

async function submit() {
  error.value = ''
  if (!form.login || !form.password) {
    error.value = t('common.required')
    return
  }
  loading.value = true
  try {
    await auth.login(form.login, form.password, form.remember)
    // الدخول من رابط مدرسة: تُختار صفة تلك المدرسة مباشرة (مثلاً معلم يدرّس في مدرستين)
    const match = sb.value && auth.assignments.find((a) => a.school?.id === sb.value.school.id)
    if (match) auth.selectAssignment(match.id)
    if (auth.active) router.push(route.query.next || { name: 'home' })
    else router.push({ name: 'choose-role' })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
function quick(acc) {
  form.login = acc.username
  form.password = '1234'
  submit()
}
function google() {
  toast.add({ severity: 'info', summary: t('auth.google'), detail: t('common.comingSoon'), life: 2500 })
}
</script>

<style scoped>
.login { flex: 1; display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }

/* اللوحة الترحيبية */
.brand { position: relative; overflow: hidden; color: #fff; background: linear-gradient(155deg, #1b2a5c 0%, #233b85 55%, #2b55b8 100%); }
.pattern { position: absolute; inset: 0; width: 100%; height: 100%; }
.pattern__move { animation: drift 60s linear infinite; }
@keyframes drift { to { transform: translate(-72px, -72px); } }
.brand::after { content: ''; position: absolute; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 196, 80, 0.22), transparent 65%); bottom: -200px; inset-inline-end: -160px; }
.brand__inner { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; padding: clamp(1.5rem, 4vw, 3rem); gap: 1rem; }
.brand__logo { display: flex; align-items: center; gap: 0.7rem; font-weight: 700; font-size: 1.1rem; }
.brand--school { background-color: var(--sp); background-size: cover; background-position: center; }
.brand--school::before { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.6)); }
.brand--school::after { display: none; }
.brand--school .brand__inner { justify-content: flex-end; }
@media (min-width: 901px) { .brand--school { position: sticky; top: 0; height: 100vh; align-self: start; } }
.brand--school h1 { margin-top: 0.5rem; }
.brand__welcome { font-size: 1.2rem !important; opacity: 0.95 !important; }
.demo__empty { font-size: 0.85rem; }
.other-school { display: block; margin-top: 1rem; text-align: center; font-size: 0.86rem; color: var(--p-text-muted-color); text-decoration: none; }
.other-school:hover { color: var(--brand); }
.acc--school { text-decoration: none; color: inherit; }
.brand__mark { width: 46px; height: 46px; border-radius: 14px; background: #fff; color: #233b85; display: grid; place-items: center; font-size: 1.5rem; font-weight: 800; }
.brand h1 { font-size: clamp(1.9rem, 3.8vw, 3rem); line-height: 1.25; margin: 1.5rem 0 0; }
.brand h1 span { color: #ffc96b; }
.brand p { margin: 0; font-size: 1.02rem; opacity: 0.85; max-width: 470px; }
.aud { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: auto; }
.aud__card { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.9rem; border-radius: 16px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.14); backdrop-filter: blur(6px); animation: rise 0.6s both; transition: background 0.2s; }
.aud__card:hover { background: rgba(255, 255, 255, 0.14); }
.aud__icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255, 201, 107, 0.18); color: #ffc96b; display: grid; place-items: center; flex-shrink: 0; }
.aud__card strong { display: block; }
.aud__card small { opacity: 0.8; font-size: 0.78rem; line-height: 1.5; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.brand__foot { display: flex; gap: 1.2rem; flex-wrap: wrap; font-size: 0.82rem; opacity: 0.8; margin-top: 1rem; }
.brand__foot i { margin-inline-end: 0.3rem; }

/* النموذج */
.form-side { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; padding: clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 3rem); background: var(--bg); overflow-y: auto; }
.card { width: min(440px, 100%); background: var(--surface); border-radius: 26px; padding: 2rem; box-shadow: var(--shadow-lg); }
.card h2 { margin: 0; font-size: 1.6rem; }
.form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.4rem; }
.field { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 700; font-size: 0.875rem; }
.form__row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.check { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.link { color: var(--brand); text-decoration: none; font-weight: 700; }

.demo { width: min(440px, 100%); }
.demo__head { font-weight: 800; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-bottom: 0.6rem; }
.demo__head i { color: var(--brand); }
.demo__head small { flex-basis: 100%; font-weight: 600; color: var(--muted); }
.demo__group h4 { margin: 0.75rem 0 0.4rem; font-size: 0.8rem; color: var(--muted); }
.demo__list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.acc { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem; border: 1.5px solid var(--line); border-radius: 14px; background: var(--surface); cursor: pointer; text-align: start; font: inherit; color: inherit; transition: all 0.15s; }
.acc:hover { border-color: var(--ac); transform: translateY(-2px); box-shadow: var(--shadow); }
.acc__av { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: var(--ac); color: #fff; font-weight: 800; flex-shrink: 0; }
.acc__info { display: flex; flex-direction: column; min-width: 0; line-height: 1.3; }
.acc__info strong { font-size: 0.85rem; }
.acc__info small { font-size: 0.7rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 960px) {
  .login { grid-template-columns: 1fr; }
  .brand__inner { padding-bottom: 1.5rem; }
  .aud { display: none; }
  .brand h1 { margin-top: 0.5rem; }
}
@media (max-width: 480px) {
  .demo__list { grid-template-columns: 1fr; }
  .card { padding: 1.4rem; }
}
</style>
