<template>
  <div class="login">
    <!-- اللوحة الترحيبية -->
    <section class="brand">
      <div class="brand__inner">
        <div class="brand__logo"><span class="brand__mark"><Mascot :color="'#ffd54a'" :accent="'#fff'" /></span>{{ t('app.short') }}</div>
        <h1>تعلّم، العب، وتقدّم<br /><span>كل يوم خطوة</span></h1>
        <p>{{ t('app.tagline') }}</p>

        <div class="scene" aria-hidden="true">
          <div class="scene__mascot"><Mascot bounce mood="happy" :color="'#ffd54a'" :accent="'#ff6b4a'" /></div>
          <div class="float f1"><i class="pi pi-video" /> درس جديد: سورة الفيل</div>
          <div class="float f2"><i class="pi pi-star-fill" /> +20 نجمة</div>
          <div class="float f3"><i class="pi pi-bolt" /> 7 أيام متتالية</div>
          <div class="float f4"><i class="pi pi-check-circle" /> 9/10 في الاختبار</div>
        </div>

        <div class="themes">
          <span class="th th--kids">البراعم <small>1-3 ابتدائي</small></span>
          <span class="th th--juniors">المستكشفون <small>4-5 ابتدائي و1 متوسط</small></span>
          <span class="th th--teens">الشباب <small>من 2 متوسط</small></span>
        </div>
      </div>
    </section>

    <!-- النموذج -->
    <section class="form-side">
      <div class="card">
        <h2>{{ t('auth.welcome') }} 👋</h2>
        <p class="muted">{{ t('auth.loginHint') }}</p>

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
      </div>

      <!-- وضع العرض: خاص بالنموذج التجريبي -->
      <div class="demo">
        <div class="demo__head"><i class="pi pi-eye" /> {{ t('auth.demoTitle') }} <small>{{ t('auth.demoHint') }}</small></div>
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
import { ref, reactive, computed, onMounted } from 'vue'
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
import Mascot from '@/components/art/Mascot.vue'
import { useAuthStore } from '@/stores/auth'
import { demoAccounts } from '@/api/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const form = reactive({ login: '', password: '', remember: true })
const loading = ref(false)
const error = ref('')
const demo = ref([])

onMounted(async () => {
  demo.value = await demoAccounts()
})

// تعليق توضيحي لكل حساب تجريبي
const CAPTIONS = {
  anas: ['البراعم · الثالثة ابتدائي', '#ff6b4a'], salma: ['البراعم · الأولى ابتدائي', '#ff6b4a'],
  yahya: ['المستكشفون · الأولى متوسط', '#0a9bdc'], maryam: ['الشباب · الرابعة متوسط', '#6550e0'], ishaq: ['الشباب · الثانية ثانوي', '#6550e0']
}
const groups = computed(() => {
  const roleCaption = (a) => a.roles.map((r) => t(`roles.${r}`)).join(' + ')
  const pick = (fn) => demo.value.filter(fn).map((a) => ({ ...a, caption: CAPTIONS[a.username]?.[0] || roleCaption(a), color: CAPTIONS[a.username]?.[1] || '#3159e8' }))
  return [
    { key: 's', title: 'التلاميذ', items: pick((a) => a.roles.includes('student')) },
    { key: 'p', title: 'الأولياء والمعلمون', items: pick((a) => !a.roles.includes('student') && a.roles.some((r) => ['parent', 'teacher'].includes(r))) },
    { key: 'a', title: 'الإدارة والدعم', items: pick((a) => a.roles.some((r) => ['super_admin', 'admin', 'editor', 'support'].includes(r)) && !a.roles.includes('parent')) }
  ]
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
.brand {
  position: relative;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 20% 15%, rgba(255, 213, 74, 0.45), transparent 35%),
    radial-gradient(circle at 85% 85%, rgba(255, 107, 74, 0.5), transparent 40%),
    linear-gradient(150deg, #2448d8 0%, #3a6cf4 45%, #19a3d9 100%);
}
.brand::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1.5px, transparent 2px); background-size: 26px 26px; pointer-events: none; }
.brand__inner { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; padding: clamp(1.5rem, 4vw, 3rem); gap: 1rem; }
.brand__logo { display: flex; align-items: center; gap: 0.6rem; font-family: 'Baloo Bhaijaan 2', Cairo, sans-serif; font-weight: 700; font-size: 1.5rem; }
.brand__mark { width: 50px; height: 50px; border-radius: 16px; background: rgba(255, 255, 255, 0.18); padding: 5px; display: grid; place-items: center; }
.brand h1 { font-family: 'Baloo Bhaijaan 2', Cairo, sans-serif; font-size: clamp(2rem, 4.2vw, 3.3rem); line-height: 1.15; margin: 1rem 0 0; }
.brand h1 span { color: #ffd54a; }
.brand p { margin: 0; font-size: 1.05rem; opacity: 0.92; max-width: 460px; }

.scene { position: relative; flex: 1; min-height: 260px; }
.scene__mascot { position: absolute; width: 230px; height: 230px; inset: 0; margin: auto; filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.25)); }
.float { position: absolute; display: flex; gap: 0.45rem; align-items: center; background: #fff; color: #1d2433; font-weight: 700; font-size: 0.9rem; padding: 0.55rem 0.95rem; border-radius: 14px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18); animation: float 5s ease-in-out infinite; white-space: nowrap; }
.float i { font-size: 1rem; }
.f1 { top: 8%; inset-inline-start: 4%; } .f1 i { color: #3159e8; }
.f2 { top: 14%; inset-inline-end: 6%; animation-delay: 1.2s; } .f2 i { color: #f5a400; }
.f3 { bottom: 16%; inset-inline-start: 8%; animation-delay: 2.1s; } .f3 i { color: #ff6b2c; }
.f4 { bottom: 8%; inset-inline-end: 4%; animation-delay: 0.6s; } .f4 i { color: #16a34a; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.themes { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.th { display: flex; flex-direction: column; padding: 0.5rem 0.9rem; border-radius: 14px; font-weight: 800; background: rgba(255, 255, 255, 0.16); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.25); line-height: 1.3; }
.th small { font-weight: 600; opacity: 0.85; font-size: 0.72rem; }
.th--kids { border-inline-start: 4px solid #ff8a5b; }
.th--juniors { border-inline-start: 4px solid #8ac926; }
.th--teens { border-inline-start: 4px solid #b9a8ff; }

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
  .scene { min-height: 200px; }
  .scene__mascot { width: 150px; height: 150px; }
  .float { font-size: 0.75rem; padding: 0.4rem 0.7rem; }
}
@media (max-width: 480px) {
  .demo__list { grid-template-columns: 1fr; }
  .card { padding: 1.4rem; }
  .f2, .f4 { display: none; }
}
</style>
