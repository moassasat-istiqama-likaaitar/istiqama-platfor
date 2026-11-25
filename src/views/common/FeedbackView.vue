<template>
  <div>
    <PageHeader :title="t('feedback.title')" />

    <Tabs v-model:value="tab">
      <TabList>
        <Tab value="new"><i class="pi pi-plus" /> {{ t('feedback.newTab') }}</Tab>
        <Tab value="mine"><i class="pi pi-list" /> {{ t('feedback.mineTab') }} <span v-if="mine.length" class="count">{{ mine.length }}</span></Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="new">
          <form class="form" @submit.prevent="submit">
            <div class="field">
              <span>{{ t('feedback.type') }}</span>
              <div class="types">
                <button
                  v-for="ty in types"
                  :key="ty.value"
                  type="button"
                  class="type-card"
                  :class="{ 'is-active': form.type === ty.value }"
                  @click="form.type = ty.value"
                >
                  <i :class="ty.icon" />
                  <span>{{ t(`feedback.types.${ty.value}`) }}</span>
                </button>
              </div>
            </div>
            <label class="field">
              <span>{{ t('feedback.subject') }}</span>
              <InputText v-model="form.title" fluid />
            </label>
            <label class="field">
              <span>{{ t('feedback.description') }}</span>
              <Textarea v-model="form.description" rows="5" auto-resize fluid />
            </label>
            <Button type="button" :label="t('feedback.attach')" icon="pi pi-paperclip" severity="secondary" outlined class="attach" @click="attach" />
            <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
            <div><Button type="submit" :label="t('feedback.submit')" icon="pi pi-send" :loading="saving" /></div>
          </form>
        </TabPanel>
        <TabPanel value="mine">
          <div v-if="mine.length" class="reports">
            <article v-for="r in mine" :key="r.id" class="report">
              <span class="report__icon"><i :class="typeIcon(r.type)" /></span>
              <div class="report__body">
                <div class="report__top">
                  <strong>{{ r.title }}</strong>
                  <Tag :value="t(`feedback.status.${r.status}`)" :severity="statusSeverity[r.status]" rounded />
                </div>
                <p>{{ r.description }}</p>
                <small>{{ t(`feedback.types.${r.type}`) }} · {{ gregorian(r.at, locale) }}</small>
              </div>
            </article>
          </div>
          <EmptyState v-else icon="pi pi-flag" :text="t('feedback.empty')" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import * as reportsApi from '@/api/reports'
import { useAuthStore } from '@/stores/auth'
import { gregorian } from '@/utils/dates'

const { t, locale } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const tab = ref('new')
const mine = ref([])
const saving = ref(false)
const error = ref('')
const form = reactive({ type: 'technical', title: '', description: '' })

const types = [
  { value: 'content', icon: 'pi pi-book' },
  { value: 'technical', icon: 'pi pi-exclamation-triangle' },
  { value: 'suggestion', icon: 'pi pi-lightbulb' }
]
const typeIcon = (v) => types.find((x) => x.value === v)?.icon
const statusSeverity = { new: 'info', in_progress: 'warn', done: 'success' }

onMounted(load)
async function load() {
  mine.value = await reportsApi.listMine(auth.person.id)
}

async function submit() {
  error.value = ''
  saving.value = true
  try {
    await reportsApi.create(auth.person.id, auth.activeAssignmentId, form)
    toast.add({ severity: 'success', summary: t('feedback.sent'), life: 2500 })
    Object.assign(form, { title: '', description: '' })
    await load()
    tab.value = 'mine'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function attach() {
  toast.add({ severity: 'info', summary: t('feedback.attach'), detail: t('common.comingSoon'), life: 2500 })
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 1.1rem; max-width: 640px; padding-top: 0.5rem; }
.field { display: flex; flex-direction: column; gap: 0.45rem; font-weight: 600; font-size: 0.875rem; }
.types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.9rem 0.5rem;
  border: 1.5px solid var(--p-content-border-color);
  border-radius: 14px;
  background: var(--p-content-background);
  cursor: pointer;
  font: inherit;
  color: inherit;
  font-weight: 600;
}
.type-card i { font-size: 1.2rem; color: var(--p-text-muted-color); }
.type-card.is-active { border-color: var(--p-primary-color); background: var(--p-primary-50); color: var(--p-primary-700); }
.type-card.is-active i { color: var(--p-primary-600); }
.attach { align-self: flex-start; }
.count { font-size: 0.7rem; background: var(--p-primary-100); color: var(--p-primary-700); padding: 0 0.45rem; border-radius: 999px; margin-inline-start: 0.3rem; }
.reports { display: flex; flex-direction: column; gap: 0.75rem; padding-top: 0.5rem; }
.report { display: flex; gap: 0.85rem; padding: 1rem; border: 1px solid var(--p-content-border-color); border-radius: 14px; background: var(--p-content-background); }
.report__icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--p-primary-50); color: var(--p-primary-600); flex-shrink: 0; }
.report__body { flex: 1; min-width: 0; }
.report__top { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; }
.report__body p { margin: 0.3rem 0; color: var(--p-text-muted-color); font-size: 0.875rem; }
.report__body small { color: var(--p-text-muted-color); font-size: 0.75rem; }
@media (max-width: 480px) { .types { grid-template-columns: 1fr; } }
</style>
