<template>
  <!-- AU03: نسيت كلمة المرور -->
  <div class="center">
    <section class="card">
      <span class="icon"><i :class="sent ? 'pi pi-check' : 'pi pi-key'" /></span>
      <template v-if="!sent">
        <h2>{{ t('auth.forgotTitle') }}</h2>
        <p class="muted">{{ t('auth.forgotHint') }}</p>
        <form class="form" @submit.prevent="submit">
          <label class="field">
            <span>{{ t('auth.contact') }}</span>
            <InputText v-model.trim="contact" fluid :invalid="!!error" />
          </label>
          <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
          <Button type="submit" :label="t('auth.sendLink')" icon="pi pi-send" :loading="loading" fluid />
        </form>
      </template>
      <template v-else>
        <h2>{{ t('auth.sent') }}</h2>
        <p class="muted">{{ t('auth.sentHint') }}</p>
      </template>
      <RouterLink :to="{ name: 'login' }" class="back"><i class="pi pi-arrow-right flip" /> {{ t('auth.backToLogin') }}</RouterLink>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { forgotPassword } from '@/api/auth'

const { t } = useI18n()
const contact = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await forgotPassword(contact.value)
    sent.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.center { flex: 1; display: grid; place-items: center; padding: 1rem; }
.card {
  width: min(440px, 100%);
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
}
.icon { display: inline-grid; place-items: center; width: 56px; height: 56px; border-radius: 16px; background: var(--p-primary-50); color: var(--p-primary-600); }
.icon i { font-size: 1.4rem; }
h2 { margin: 1rem 0 0.25rem; }
.muted { color: var(--p-text-muted-color); margin: 0; }
.form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; text-align: start; }
.field { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; font-size: 0.875rem; }
.back { display: inline-flex; gap: 0.4rem; align-items: center; margin-top: 1.5rem; color: var(--p-primary-color); text-decoration: none; font-weight: 600; }
</style>
