<template>
  <div class="login">
    <section class="login__brand">
      <span class="login__logo">ا</span>
      <h1>{{ t('app.name') }}</h1>
      <p>{{ t('app.tagline') }}</p>
      <ul class="login__features">
        <li><i class="pi pi-building" /> {{ t('menu.schools') }}</li>
        <li><i class="pi pi-book" /> {{ t('menu.library') }}</li>
        <li><i class="pi pi-users" /> {{ t('menu.children') }}</li>
      </ul>
    </section>

    <section class="login__card">
      <h2>{{ t('auth.loginTitle') }}</h2>
      <p class="muted">{{ t('auth.loginHint') }}</p>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>{{ t('auth.login') }}</span>
          <IconField>
            <InputIcon class="pi pi-user" />
            <InputText v-model.trim="form.login" autocomplete="username" fluid :invalid="!!error" />
          </IconField>
        </label>
        <label class="field">
          <span>{{ t('auth.password') }}</span>
          <Password v-model="form.password" :feedback="false" toggle-mask fluid input-class="w-full" autocomplete="current-password" :invalid="!!error" />
        </label>
        <div class="form__row">
          <label class="check"><Checkbox v-model="form.remember" binary /> {{ t('auth.remember') }}</label>
          <RouterLink :to="{ name: 'forgot' }" class="link">{{ t('auth.forgot') }}</RouterLink>
        </div>
        <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
        <Button type="submit" :label="t('auth.submit')" icon="pi pi-sign-in" :loading="loading" fluid />
        <div class="or"><span>{{ t('auth.or') }}</span></div>
        <Button type="button" :label="t('auth.google')" icon="pi pi-google" severity="secondary" outlined fluid @click="google" />
      </form>

      <!-- وضع العرض: خاص بالنموذج التجريبي ويُحذف عند الربط بالخلفية -->
      <div class="demo">
        <button type="button" class="demo__toggle" @click="showDemo = !showDemo">
          <i class="pi pi-eye" />
          <span>{{ t('auth.demoTitle') }}</span>
          <i class="pi pi-angle-down demo__caret" :class="{ 'is-open': showDemo }" />
        </button>
        <div v-show="showDemo" class="demo__body">
          <p class="muted small">{{ t('auth.demoHint') }}</p>
          <div class="demo__list">
            <button v-for="acc in demo" :key="acc.username" type="button" class="demo__item" :disabled="loading" @click="quick(acc)">
              <Avatar :label="acc.name.charAt(0)" shape="circle" size="normal" class="demo__avatar" />
              <span class="demo__info">
                <strong>{{ acc.name }}</strong>
                <span class="demo__roles">
                  <span v-for="(r, i) in acc.roles" :key="i" class="chip">{{ t(`roles.${r}`) }}</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Avatar from 'primevue/avatar'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
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
const showDemo = ref(true)

onMounted(async () => {
  demo.value = await demoAccounts()
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
.login {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr minmax(360px, 460px);
  gap: 3rem;
  align-items: center;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 1.5rem 3rem;
}
.login__brand h1 { font-size: 2.1rem; margin: 1rem 0 0.5rem; line-height: 1.3; }
.login__brand p { color: var(--p-text-muted-color); font-size: 1.05rem; max-width: 460px; }
.login__logo {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 2rem;
  font-weight: 700;
  box-shadow: 0 10px 30px color-mix(in srgb, var(--p-primary-color) 35%, transparent);
}
.login__features { list-style: none; padding: 0; margin: 2rem 0 0; display: flex; flex-wrap: wrap; gap: 0.75rem; }
.login__features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  font-weight: 600;
  font-size: 0.875rem;
}
.login__features i { color: var(--p-primary-color); }

.login__card {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
}
.login__card h2 { margin: 0; font-size: 1.4rem; }
.muted { color: var(--p-text-muted-color); margin: 0.25rem 0 0; }
.small { font-size: 0.8rem; }

.form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
.field { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; font-size: 0.875rem; }
.form__row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.check { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.link { color: var(--p-primary-color); text-decoration: none; font-weight: 600; }
.or { display: flex; align-items: center; gap: 0.75rem; color: var(--p-text-muted-color); font-size: 0.8rem; }
.or::before, .or::after { content: ''; flex: 1; height: 1px; background: var(--p-content-border-color); }

.demo { margin-top: 1.5rem; border-top: 1px dashed var(--p-content-border-color); padding-top: 1rem; }
.demo__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  font-weight: 700;
  color: var(--p-text-color);
  cursor: pointer;
  padding: 0;
}
.demo__toggle .pi-eye { color: var(--p-primary-color); }
.demo__caret { margin-inline-start: auto; transition: transform 0.2s; }
.demo__caret.is-open { transform: rotate(180deg); }
.demo__list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; max-height: 300px; overflow: auto; }
.demo__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: start;
  font: inherit;
  color: inherit;
}
.demo__item:hover { border-color: var(--p-primary-color); background: var(--p-primary-50); }
.demo__avatar { background: var(--p-primary-100); color: var(--p-primary-700); font-weight: 700; flex-shrink: 0; }
.demo__info { display: flex; flex-direction: column; min-width: 0; }
.demo__info strong { font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.demo__roles { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.2rem; }
.chip { font-size: 0.68rem; padding: 0.05rem 0.45rem; border-radius: 999px; background: var(--p-content-hover-background); color: var(--p-text-muted-color); }

@media (max-width: 900px) {
  .login { grid-template-columns: 1fr; gap: 1.5rem; }
  .login__brand { text-align: center; }
  .login__brand h1 { font-size: 1.5rem; }
  .login__logo { margin: 0 auto; }
  .login__brand p { margin-inline: auto; }
  .login__features { display: none; }
}
@media (max-width: 480px) {
  .login__card { padding: 1.25rem; }
  .demo__list { grid-template-columns: 1fr; }
}
</style>
