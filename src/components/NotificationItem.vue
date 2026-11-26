<template>
  <button type="button" class="notif" :class="{ 'is-unread': !item.read, 'notif--compact': compact }" @click="$emit('open', item)">
    <span class="notif__icon" :data-hue="type.hue"><i :class="type.icon" /></span>
    <span class="notif__body">
      <span class="notif__title">{{ item.title }}</span>
      <span class="notif__text">{{ item.body }}</span>
      <span class="notif__meta">
        <span>{{ timeAgo(item.at, t) }}</span>
        <span v-if="roleLabel" class="notif__role">{{ roleLabel }}</span>
      </span>
    </span>
    <span v-if="!item.read" class="notif__dot" :aria-label="t('common.unread')" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { timeAgo } from '@/utils/dates'
import { NOTIFICATION_TYPES } from '@/config/notificationTypes'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const props = defineProps({ item: { type: Object, required: true }, compact: Boolean })
defineEmits(['open'])

const { t } = useI18n()
const auth = useAuthStore()
const label = useAssignmentLabel()

const type = computed(() => NOTIFICATION_TYPES[props.item.type] || NOTIFICATION_TYPES.announcement)

// وسم الدور يظهر فقط لمن له أكثر من دور
const roleLabel = computed(() => {
  if (!auth.hasManyAssignments) return ''
  if (!props.item.assignmentId) return t('notifications.general')
  return label.full(auth.assignments.find((a) => a.id === props.item.assignmentId))
})
</script>

<style scoped>
.notif {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 0;
  border-radius: 12px;
  background: transparent;
  text-align: start;
  font: inherit;
  color: inherit;
  cursor: pointer;
  position: relative;
}
.notif:hover { background: var(--p-content-hover-background); }
.notif.is-unread { background: color-mix(in srgb, var(--p-primary-color) 6%, transparent); }
.notif--compact { padding: 0.6rem 0.7rem; }
.notif__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
}
.notif__body { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
.notif__title { font-weight: 700; font-size: 0.875rem; }
.notif__text { color: var(--p-text-muted-color); font-size: 0.82rem; }
.notif--compact .notif__text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif__meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.72rem; color: var(--p-text-muted-color); margin-top: 0.15rem; }
.notif__role {
  background: var(--p-content-hover-background);
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
}
.notif__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--p-primary-color);
  margin-top: 0.4rem;
  flex-shrink: 0;
}
</style>
