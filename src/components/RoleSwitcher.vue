<template>
  <button
    type="button"
    class="role-switcher"
    :class="{ 'role-switcher--static': !auth.hasManyAssignments }"
    :aria-label="t('layout.switchRole')"
    @click="auth.hasManyAssignments && pop.toggle($event)"
  >
    <span class="role-switcher__icon"><i :class="ROLE_ICONS[auth.role]" /></span>
    <span class="role-switcher__text">
      <span class="role-switcher__role">{{ label.title(auth.active) }}</span>
      <span v-if="label.place(auth.active)" class="role-switcher__place">{{ label.place(auth.active) }}</span>
    </span>
    <i v-if="auth.hasManyAssignments" class="pi pi-angle-down role-switcher__caret" />
  </button>

  <Popover ref="pop">
    <div class="role-list">
      <div class="role-list__title">{{ t('layout.myRoles') }}</div>
      <button
        v-for="a in auth.assignments"
        :key="a.id"
        type="button"
        class="role-list__item"
        :class="{ 'is-active': a.id === auth.activeAssignmentId }"
        @click="choose(a.id)"
      >
        <span class="role-list__icon"><i :class="ROLE_ICONS[a.role]" /></span>
        <span class="role-list__text">
          <strong>{{ label.full(a) }}</strong>
          <small v-if="label.detail(a)">{{ label.detail(a) }}</small>
        </span>
        <i v-if="a.id === auth.activeAssignmentId" class="pi pi-check role-list__check" />
      </button>
    </div>
  </Popover>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Popover from 'primevue/popover'
import { useAuthStore } from '@/stores/auth'
import { ROLE_ICONS } from '@/config/menus'
import { useAssignmentLabel } from '@/composables/useAssignmentLabel'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const label = useAssignmentLabel()
const pop = ref()

function choose(id) {
  pop.value.hide()
  if (id === auth.activeAssignmentId) return
  auth.selectAssignment(id)
  router.push({ name: 'home' })
  toast.add({ severity: 'info', summary: t('layout.currentRole'), detail: label.full(auth.active), life: 2500 })
}
</script>

<style scoped>
.role-switcher {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.5rem 0.3rem 0.75rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 12px;
  background: var(--p-content-background);
  cursor: pointer;
  font: inherit;
  color: inherit;
  max-width: 260px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.role-switcher:hover:not(.role-switcher--static) { border-color: var(--p-primary-color); }
.role-switcher--static { cursor: default; }
.role-switcher__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  flex-shrink: 0;
}
.role-switcher__text { display: flex; flex-direction: column; text-align: start; min-width: 0; line-height: 1.25; }
.role-switcher__role { font-weight: 700; font-size: 0.85rem; }
.role-switcher__place {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-switcher__caret { color: var(--p-text-muted-color); font-size: 0.8rem; }

.role-list { display: flex; flex-direction: column; gap: 0.25rem; min-width: 300px; max-width: 360px; }
.role-list__title { font-size: 0.75rem; color: var(--p-text-muted-color); padding: 0 0.5rem 0.4rem; font-weight: 600; }
.role-list__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: start;
}
.role-list__item:hover { background: var(--p-content-hover-background); }
.role-list__item.is-active { background: var(--p-primary-50); }
.role-list__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  flex-shrink: 0;
}
.role-list__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.role-list__text strong { font-size: 0.875rem; }
.role-list__text small { color: var(--p-text-muted-color); font-size: 0.75rem; }
.role-list__check { color: var(--p-primary-color); }

@media (max-width: 640px) {
  .role-switcher__text { display: none; }
  .role-switcher { padding: 0.25rem; }
}
</style>
