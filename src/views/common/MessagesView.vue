<template>
  <!-- CM02: الرسائل — المحادثات حسب مصفوفة المراسلة، والموسم الحالي/المواسم السابقة (للقراءة) -->
  <div>
    <PageHeader :title="t('messages.title')">
      <template #actions>
        <Button :label="t('messages.newMessage')" icon="pi pi-plus" @click="openCompose" />
      </template>
    </PageHeader>

    <div class="mail" :class="{ 'has-thread': !!threadId }">
      <!-- قائمة المحادثات -->
      <aside class="mail__list">
        <IconField class="mail__search">
          <InputIcon class="pi pi-search" />
          <InputText v-model="q" :placeholder="t('messages.search')" fluid size="small" />
        </IconField>
        <div class="seasons">
          <button type="button" class="pill" :class="{ 'is-active': !showArchive }" @click="showArchive = false">الموسم الحالي</button>
          <button type="button" class="pill" :class="{ 'is-active': showArchive }" @click="showArchive = true"><i class="pi pi-box" /> المواسم السابقة <span v-if="archivedCount" class="pill__count">{{ archivedCount }}</span></button>
        </div>
        <div v-if="filtered.length" class="conv-list">
          <button
            v-for="c in filtered"
            :key="c.id"
            type="button"
            class="conv"
            :class="{ 'is-active': c.id === threadId, 'is-unread': c.unread }"
            @click="openThread(c.id)"
          >
            <Avatar :label="c.with.name.charAt(0)" shape="circle" class="conv__avatar" />
            <span class="conv__body">
              <span class="conv__top">
                <strong>{{ c.with.name }}</strong>
                <small>{{ c.lastMessage ? timeAgo(c.lastMessage.at, t) : '' }}</small>
              </span>
              <span class="conv__subject">{{ c.subject }}</span>
              <span class="conv__last">
                <template v-if="c.lastMessage?.fromMe">{{ t('messages.you') }}: </template>{{ c.lastMessage?.body }}
              </span>
              <span class="conv__tags">
                <span class="tag">{{ t(`roles.${c.with.role}`) }}</span>
                <span v-if="auth.hasManyAssignments" class="tag tag--mine">{{ t('messages.as') }}: {{ myRoleLabel(c.myAssignmentId) }}</span>
              </span>
            </span>
          </button>
        </div>
        <EmptyState v-else icon="pi pi-envelope" :text="t('messages.empty')" />
      </aside>

      <!-- المحادثة -->
      <section class="mail__thread">
        <template v-if="thread">
          <header class="thread__head">
            <Button class="thread__back" icon="pi pi-arrow-right flip" text rounded severity="secondary" @click="closeThread" />
            <Avatar :label="thread.with.name.charAt(0)" shape="circle" class="conv__avatar" />
            <div>
              <strong>{{ thread.with.name }}</strong>
              <small>{{ t(`roles.${thread.with.role}`) }} · {{ thread.subject }}</small>
            </div>
          </header>
          <div ref="scroller" class="thread__messages">
            <div v-for="m in thread.messages" :key="m.id" class="bubble" :class="m.fromMe ? 'bubble--me' : 'bubble--them'">
              <p>{{ m.body }}</p>
              <small>{{ timeOf(m.at, locale) }}</small>
            </div>
          </div>
          <p v-if="thread.archived" class="ro"><i class="pi pi-box" /> محادثة من موسم مؤرشف — للقراءة فقط.</p>
          <form v-else class="thread__composer" @submit.prevent="send">
            <Textarea v-model="draft" :placeholder="t('messages.placeholder')" rows="1" auto-resize class="composer__input" @keydown.enter.exact.prevent="send" />
            <Button type="submit" icon="pi pi-send" :disabled="!draft.trim()" :loading="sending" rounded :aria-label="t('common.send')" />
          </form>
        </template>
        <EmptyState v-else-if="!loadingThread" icon="pi pi-comments" :text="t('messages.select')" />
      </section>
    </div>

    <!-- رسالة جديدة -->
    <Dialog v-model:visible="compose.open" :header="t('messages.newMessage')" modal :style="{ width: 'min(520px, 94vw)' }">
      <div class="form">
        <label v-if="auth.hasManyAssignments" class="field">
          <span>{{ t('messages.as') }}</span>
          <Select v-model="compose.assignmentId" :options="myAssignments" option-label="label" option-value="value" fluid @change="loadContacts" />
        </label>
        <label class="field">
          <span>{{ t('messages.to') }}</span>
          <Select
            v-model="compose.to"
            :options="compose.contacts"
            option-label="name"
            option-value="personId"
            filter
            fluid
            :empty-message="t('messages.noContacts')"
            :loading="compose.loading"
          >
            <template #option="{ option }">
              <div class="contact-opt">
                <strong>{{ option.name }}</strong>
                <small>{{ t(`roles.${option.role}`) }}<template v-if="option.detail"> · {{ option.detail }}</template></small>
              </div>
            </template>
          </Select>
        </label>
        <label class="field">
          <span>{{ t('messages.subject') }}</span>
          <InputText v-model="compose.subject" fluid />
        </label>
        <label class="field">
          <span>{{ t('messages.body') }}</span>
          <Textarea v-model="compose.body" rows="4" auto-resize fluid />
        </label>
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="compose.open = false" />
        <Button :label="t('messages.start')" icon="pi pi-send" :disabled="!canStart" :loading="compose.sending" @click="start" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import * as messagesApi from '@/api/messages'
import { useAuthStore } from '@/stores/auth'
import { useInboxStore } from '@/stores/inbox'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'
import { timeAgo, timeOf } from '@/utils/dates'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const inbox = useInboxStore()
const label = useAssignmentLabel()

const q = ref('')
const thread = ref(null)
const loadingThread = ref(false)
const draft = ref('')
const sending = ref(false)
const scroller = ref()

const threadId = computed(() => route.params.id || null)

const showArchive = ref(false)
const archivedCount = computed(() => inbox.conversations.filter((c) => c.archived).length)
const filtered = computed(() => {
  const s = q.value.trim()
  const list = inbox.conversations.filter((c) => !!c.archived === showArchive.value)
  if (!s) return list
  return list.filter((c) => c.with.name.includes(s) || c.subject.includes(s) || c.lastMessage?.body.includes(s))
})

const myRoleLabel = (id) => label.full(auth.assignments.find((a) => a.id === id))

watch(
  threadId,
  async (id) => {
    thread.value = null
    if (!id) return
    loadingThread.value = true
    try {
      thread.value = await messagesApi.getConversation(id, auth.person.id)
      const c = inbox.conversations.find((x) => x.id === id)
      if (c) c.unread = false
      scrollDown()
    } catch {
      router.replace({ name: 'messages' })
    } finally {
      loadingThread.value = false
    }
  },
  { immediate: true }
)

function openThread(id) {
  router.push({ name: 'messages', params: { id } })
}
function closeThread() {
  router.push({ name: 'messages' })
}
async function scrollDown() {
  await nextTick()
  if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
}

async function send() {
  const body = draft.value.trim()
  if (!body || !thread.value) return
  sending.value = true
  try {
    const msg = await messagesApi.sendMessage(thread.value.id, auth.person.id, body)
    thread.value.messages.push(msg)
    draft.value = ''
    scrollDown()
    inbox.refreshConversations(auth.person.id)
  } finally {
    sending.value = false
  }
}

// ——— رسالة جديدة ———
const compose = reactive({ open: false, assignmentId: null, to: null, subject: '', body: '', contacts: [], loading: false, sending: false })
const myAssignments = computed(() => auth.assignments.map((a) => ({ value: a.id, label: label.full(a) })))
const canStart = computed(() => compose.to && compose.subject.trim() && compose.body.trim())

async function openCompose(preset = {}) {
  Object.assign(compose, { open: true, assignmentId: auth.activeAssignmentId, to: null, subject: '', body: '' })
  await loadContacts()
  if (preset.to) Object.assign(compose, { to: preset.to, subject: preset.subject || '' })
}
// فتح رسالة جديدة مباشرة من شاشة أخرى: #/app/messages?to=<personId>&subject=...
if (route.query.to) openCompose({ to: route.query.to, subject: route.query.subject })
async function loadContacts() {
  compose.loading = true
  compose.to = null
  compose.contacts = await messagesApi.contacts(compose.assignmentId)
  compose.loading = false
}
async function start() {
  compose.sending = true
  try {
    const c = await messagesApi.startConversation(auth.person.id, compose.assignmentId, compose.to, compose.subject.trim(), compose.body.trim())
    await inbox.refreshConversations(auth.person.id)
    compose.open = false
    openThread(c.id)
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  } finally {
    compose.sending = false
  }
}
</script>

<style scoped>
.seasons { display: flex; gap: 0.35rem; margin: 0.5rem 0; flex-wrap: wrap; }
.ro { margin: 0; padding: 0.8rem 1rem; background: var(--bg); border-top: 1px solid var(--line); font-size: 0.86rem; color: var(--p-text-muted-color); }
.mail {
  display: grid;
  grid-template-columns: 340px 1fr;
  height: calc(100vh - 190px);
  min-height: 460px;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 18px;
  overflow: hidden;
}
.mail__list { border-inline-end: 1px solid var(--p-content-border-color); display: flex; flex-direction: column; min-height: 0; }
.mail__search { padding: 0.75rem; }
.conv-list { overflow-y: auto; flex: 1; padding: 0 0.5rem 0.5rem; display: flex; flex-direction: column; gap: 2px; }
.conv {
  display: flex;
  gap: 0.7rem;
  padding: 0.75rem;
  border: 0;
  border-radius: 12px;
  background: transparent;
  text-align: start;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.conv:hover { background: var(--p-content-hover-background); }
.conv.is-active { background: var(--p-primary-50); }
.conv__avatar { background: var(--p-primary-100); color: var(--p-primary-700); font-weight: 700; flex-shrink: 0; }
.conv__body { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; min-width: 0; }
.conv__top { display: flex; justify-content: space-between; gap: 0.5rem; }
.conv__top small { color: var(--p-text-muted-color); font-size: 0.7rem; white-space: nowrap; }
.conv__subject { font-size: 0.8rem; font-weight: 600; }
.conv__last { font-size: 0.8rem; color: var(--p-text-muted-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv.is-unread .conv__last { color: var(--p-text-color); font-weight: 700; }
.conv__tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.2rem; }
.tag { font-size: 0.66rem; padding: 0.05rem 0.45rem; border-radius: 999px; background: var(--p-content-hover-background); color: var(--p-text-muted-color); }
.tag--mine { background: var(--p-primary-50); color: var(--p-primary-700); }

.mail__thread { display: flex; flex-direction: column; min-height: 0; }
.thread__head { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--p-content-border-color); }
.thread__head div { display: flex; flex-direction: column; line-height: 1.3; }
.thread__head small { color: var(--p-text-muted-color); font-size: 0.78rem; }
.thread__back { display: none; }
.thread__messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; background: var(--p-surface-50); }
.bubble { max-width: min(75%, 520px); padding: 0.6rem 0.9rem; border-radius: 16px; }
.bubble p { margin: 0; white-space: pre-wrap; }
.bubble small { display: block; font-size: 0.68rem; opacity: 0.7; margin-top: 0.2rem; }
.bubble--me { align-self: flex-start; background: var(--p-primary-color); color: var(--p-primary-contrast-color); border-end-start-radius: 4px; }
.bubble--them { align-self: flex-end; background: var(--p-content-background); border: 1px solid var(--p-content-border-color); border-end-end-radius: 4px; }
.thread__composer { display: flex; gap: 0.5rem; align-items: flex-end; padding: 0.75rem; border-top: 1px solid var(--p-content-border-color); }
.composer__input { flex: 1; max-height: 140px; }

.form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; font-size: 0.875rem; }
.contact-opt { display: flex; flex-direction: column; }
.contact-opt small { color: var(--p-text-muted-color); }

@media (max-width: 860px) {
  .mail { grid-template-columns: minmax(0, 1fr); height: calc(100vh - 170px); }
  .mail__thread { display: none; }
  .mail.has-thread .mail__list { display: none; }
  .mail.has-thread .mail__thread { display: flex; }
  .thread__back { display: inline-flex; }
}
</style>
