<template>
  <!-- AU02: اختيار الصفة — لمن يحمل أكثر من صفة (معلم وولي، معلم في مدرستين...) -->
  <div class="choose">
    <header class="choose__head">
      <Avatar :label="auth.initials" shape="circle" size="xlarge" class="choose__avatar" />
      <h1>{{ t('auth.hello', { name: auth.person?.firstName }) }}</h1>
      <p>{{ t('auth.chooseHint') }}</p>
    </header>

    <div class="choose__grid">
      <button v-for="a in auth.assignments" :key="a.id" type="button" class="role-card" @click="pick(a.id)">
        <span class="role-card__icon"><i :class="ROLE_ICONS[a.role]" /></span>
        <span class="role-card__body">
          <strong>{{ label.title(a) }}</strong>
          <span v-if="label.place(a)" class="role-card__place"><i class="pi pi-building" /> {{ label.place(a) }}</span>
          <span v-if="label.detail(a)" class="role-card__detail">{{ label.detail(a) }}</span>
        </span>
        <i class="pi pi-angle-left role-card__go flip" />
      </button>
    </div>

    <p class="choose__note"><i class="pi pi-info-circle" /> {{ t('auth.switchLater') }}</p>
    <Button :label="t('layout.logout')" icon="pi pi-sign-out" text severity="secondary" @click="logout" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import { ROLE_ICONS } from '@/config/menus'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const label = useAssignmentLabel()

function pick(id) {
  auth.selectAssignment(id)
  router.push({ name: 'home' })
}
function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.choose { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 1rem 1rem 3rem; gap: 1.25rem; }
.choose__head { text-align: center; }
.choose__avatar { background: var(--p-primary-color); color: var(--p-primary-contrast-color); font-weight: 700; }
.choose__head h1 { margin: 0.75rem 0 0.25rem; font-size: 1.6rem; }
.choose__head p { margin: 0; color: var(--p-text-muted-color); }
.choose__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; width: min(900px, 100%); }
.role-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 16px;
  cursor: pointer;
  text-align: start;
  font: inherit;
  color: inherit;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.role-card:hover { transform: translateY(-2px); border-color: var(--p-primary-color); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07); }
.role-card__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; background: var(--p-primary-100); color: var(--p-primary-700); flex-shrink: 0; }
.role-card__icon i { font-size: 1.35rem; }
.role-card__body { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
.role-card__body strong { font-size: 1.05rem; }
.role-card__place { font-size: 0.85rem; font-weight: 600; color: var(--p-text-color); display: flex; gap: 0.35rem; align-items: center; }
.role-card__place i { font-size: 0.75rem; color: var(--p-text-muted-color); }
.role-card__detail { font-size: 0.8rem; color: var(--p-text-muted-color); }
.role-card__go { color: var(--p-text-muted-color); }
.choose__note { color: var(--p-text-muted-color); font-size: 0.875rem; display: flex; gap: 0.4rem; align-items: center; margin: 0.5rem 0 0; }
</style>
