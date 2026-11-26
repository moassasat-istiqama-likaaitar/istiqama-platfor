<template>
  <!-- CM04: الملف الشخصي — البيانات وكلمة المرور والصفات -->
  <div>
    <PageHeader :title="t('profile.title')" />

    <div class="grid">
      <section class="panel side">
        <Avatar :label="auth.initials" shape="circle" size="xlarge" class="big-avatar" />
        <strong class="name">{{ auth.fullName }}</strong>
        <small class="muted">@{{ auth.person.username }}</small>
        <Button :label="t('profile.changePhoto')" icon="pi pi-camera" size="small" severity="secondary" outlined @click="soon" />

        <div class="roles">
          <div class="roles__title">{{ t('profile.myRoles') }}</div>
          <div v-for="a in auth.assignments" :key="a.id" class="role-row" :class="{ 'is-active': a.id === auth.activeAssignmentId }">
            <i :class="ROLE_ICONS[a.role]" />
            <div>
              <strong>{{ label.full(a) }}</strong>
              <small v-if="label.detail(a)">{{ label.detail(a) }}</small>
            </div>
          </div>
        </div>
      </section>

      <div class="main">
        <section class="panel">
          <h2 class="panel__title">{{ t('profile.personal') }}</h2>
          <form class="form two" @submit.prevent="save">
            <label class="field"><span>{{ t('profile.lastName') }}</span><InputText v-model="form.lastName" fluid /></label>
            <label class="field"><span>{{ t('profile.firstName') }}</span><InputText v-model="form.firstName" fluid /></label>
            <label class="field"><span>{{ t('profile.email') }}</span><InputText v-model="form.email" type="email" fluid dir="ltr" /></label>
            <label class="field"><span>{{ t('profile.phone') }}</span><InputText v-model="form.phone" fluid dir="ltr" /></label>
            <label class="field"><span>{{ t('profile.username') }}</span><InputText :model-value="auth.person.username" disabled fluid dir="ltr" /></label>
            <div class="actions"><Button type="submit" :label="t('common.save')" icon="pi pi-check" :loading="saving" /></div>
          </form>
        </section>

        <section class="panel">
          <h2 class="panel__title">{{ t('profile.security') }}</h2>
          <form class="form two" @submit.prevent="changePwd">
            <label class="field"><span>{{ t('profile.currentPassword') }}</span><Password v-model="pwd.current" :feedback="false" toggle-mask fluid /></label>
            <span class="hide-sm" />
            <label class="field"><span>{{ t('profile.newPassword') }}</span><Password v-model="pwd.next" toggle-mask fluid /></label>
            <label class="field"><span>{{ t('profile.confirmPassword') }}</span><Password v-model="pwd.confirm" :feedback="false" toggle-mask fluid /></label>
            <Message v-if="pwdError" severity="error" size="small" variant="simple" class="full">{{ pwdError }}</Message>
            <div class="actions"><Button type="submit" :label="t('profile.changePassword')" icon="pi pi-lock" severity="secondary" :loading="pwdSaving" /></div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/auth'
import { ROLE_ICONS } from '@/config/menus'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const label = useAssignmentLabel()

const p = auth.person
const form = reactive({ lastName: p.lastName, firstName: p.firstName, email: p.email || '', phone: p.phone || '' })
const saving = ref(false)

async function save() {
  saving.value = true
  try {
    auth.updatePerson(await updateProfile(p.id, form))
    toast.add({ severity: 'success', summary: t('common.saved'), life: 2000 })
  } finally {
    saving.value = false
  }
}

const pwd = reactive({ current: '', next: '', confirm: '' })
const pwdError = ref('')
const pwdSaving = ref(false)

async function changePwd() {
  pwdError.value = ''
  if (pwd.next !== pwd.confirm) {
    pwdError.value = t('profile.mismatch')
    return
  }
  pwdSaving.value = true
  try {
    await changePassword(p.id, pwd.current, pwd.next)
    Object.assign(pwd, { current: '', next: '', confirm: '' })
    toast.add({ severity: 'success', summary: t('profile.passwordChanged'), life: 2000 })
  } catch (e) {
    pwdError.value = e.message
  } finally {
    pwdSaving.value = false
  }
}

function soon() {
  toast.add({ severity: 'info', summary: t('profile.changePhoto'), detail: t('common.comingSoon'), life: 2500 })
}
</script>

<style scoped>
.grid { display: grid; grid-template-columns: 300px 1fr; gap: 1.25rem; align-items: start; }
.main { display: flex; flex-direction: column; gap: 1.25rem; }
.side { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
.big-avatar { width: 96px !important; height: 96px !important; font-size: 2.2rem !important; background: var(--p-primary-color); color: var(--p-primary-contrast-color); font-weight: 700; }
.name { font-size: 1.1rem; margin-top: 0.5rem; }
.muted { color: var(--p-text-muted-color); direction: ltr; }
.roles { width: 100%; margin-top: 1.25rem; text-align: start; display: flex; flex-direction: column; gap: 0.4rem; }
.roles__title { font-size: 0.78rem; font-weight: 700; color: var(--p-text-muted-color); }
.role-row { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.6rem; border-radius: 10px; border: 1px solid var(--p-content-border-color); }
.role-row.is-active { border-color: var(--p-primary-color); background: var(--p-primary-50); }
.role-row i { color: var(--p-primary-600); margin-top: 0.2rem; }
.role-row div { display: flex; flex-direction: column; }
.role-row strong { font-size: 0.85rem; }
.role-row small { color: var(--p-text-muted-color); font-size: 0.75rem; }
.panel__title { font-size: 1.05rem; margin: 0 0 1rem; }
.form { display: grid; gap: 1rem; }
.form.two { grid-template-columns: 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; font-size: 0.875rem; }
.actions, .full { grid-column: 1 / -1; }
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .form.two { grid-template-columns: 1fr; }
  .hide-sm { display: none; }
}
</style>
