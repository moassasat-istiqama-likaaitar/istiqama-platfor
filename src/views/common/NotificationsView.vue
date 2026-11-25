<template>
  <div>
    <PageHeader :title="t('notifications.title')">
      <template #actions>
        <Button
          :label="t('notifications.markAll')"
          icon="pi pi-check-circle"
          severity="secondary"
          outlined
          :disabled="!inbox.unreadNotifications"
          @click="inbox.markAllRead(auth.person.id)"
        />
      </template>
    </PageHeader>

    <div class="panel">
      <div class="filters">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="pill"
          :class="{ 'is-active': filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}<span v-if="f.count" class="pill__count">{{ f.count }}</span>
        </button>
        <Select
          v-if="auth.hasManyAssignments"
          v-model="roleFilter"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          size="small"
          class="role-select"
        />
      </div>

      <div v-if="visible.length" class="list">
        <NotificationItem v-for="n in visible" :key="n.id" :item="n" @open="inbox.markRead(n.id)" />
      </div>
      <EmptyState v-else icon="pi pi-bell" :text="t('notifications.empty')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Select from 'primevue/select'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import NotificationItem from '@/components/NotificationItem.vue'
import { useInboxStore } from '@/stores/inbox'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const { t } = useI18n()
const inbox = useInboxStore()
const auth = useAuthStore()
const label = useAssignmentLabel()

const filter = ref('all')
const roleFilter = ref('all')

const types = computed(() => Array.from(new Set(inbox.notifications.map((n) => n.type))))

const filters = computed(() => [
  { value: 'all', label: t('common.all') },
  { value: 'unread', label: t('common.unread'), count: inbox.unreadNotifications },
  ...types.value.map((ty) => ({ value: ty, label: t(`notifications.types.${ty}`) }))
])

const roleOptions = computed(() => [
  { value: 'all', label: t('layout.myRoles') + ': ' + t('common.all') },
  ...auth.assignments.map((a) => ({ value: a.id, label: label.full(a) })),
  { value: 'general', label: t('notifications.general') }
])

const visible = computed(() =>
  inbox.notifications.filter((n) => {
    if (filter.value === 'unread' && n.read) return false
    if (!['all', 'unread'].includes(filter.value) && n.type !== filter.value) return false
    if (roleFilter.value === 'general' && n.assignmentId) return false
    if (!['all', 'general'].includes(roleFilter.value) && n.assignmentId !== roleFilter.value) return false
    return true
  })
)
</script>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
.role-select { margin-inline-start: auto; min-width: 220px; }
.list { display: flex; flex-direction: column; gap: 4px; }
@media (max-width: 640px) { .role-select { margin-inline-start: 0; width: 100%; } }
</style>
