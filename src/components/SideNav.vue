<template>
  <nav class="sidenav" :aria-label="t('layout.openMenu')">
    <template v-for="entry in menu" :key="entry.key">
      <div v-if="entry.children" class="sidenav__group">
        <button type="button" class="sidenav__link sidenav__group-btn" :aria-expanded="isOpen(entry)" @click="toggle(entry.key)">
          <i :class="entry.icon" />
          <span>{{ t(`menu.${entry.key}`) }}</span>
          <i class="pi pi-angle-down sidenav__caret" :class="{ 'is-open': isOpen(entry) }" />
        </button>
        <div v-show="isOpen(entry)" class="sidenav__children">
          <RouterLink
            v-for="child in entry.children"
            :key="child.key"
            :to="child.to"
            class="sidenav__link sidenav__child"
            active-class="is-active"
            @click="$emit('navigate')"
          >
            <span>{{ t(`menu.${child.key}`) }}</span>
          </RouterLink>
        </div>
      </div>
      <RouterLink v-else :to="entry.to" class="sidenav__link" active-class="is-active" @click="$emit('navigate')">
        <i :class="entry.icon" />
        <span>{{ t(`menu.${entry.key}`) }}</span>
      </RouterLink>
    </template>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { MENUS } from '@/config/menus'
import { useAuthStore } from '@/stores/auth'

defineEmits(['navigate'])

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const opened = ref(new Set())

const menu = computed(() => MENUS[auth.role] || [])

const containsActive = (entry) => entry.children.some((c) => route.path === c.to)
const isOpen = (entry) => opened.value.has(entry.key) || containsActive(entry)

function toggle(key) {
  const next = new Set(opened.value)
  next.has(key) ? next.delete(key) : next.add(key)
  opened.value = next
}
</script>

<style scoped>
.sidenav { display: flex; flex-direction: column; gap: 2px; }
.sidenav__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: var(--p-text-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border: 0;
  background: transparent;
  width: 100%;
  text-align: start;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.sidenav__link i { width: 1.1rem; text-align: center; color: var(--p-text-muted-color); }
.sidenav__link:hover { background: var(--p-content-hover-background); }
.sidenav__link.is-active { background: var(--p-primary-50); color: var(--p-primary-700); }
.sidenav__link.is-active i { color: var(--p-primary-600); }
.sidenav__caret { margin-inline-start: auto; font-size: 0.75rem; transition: transform 0.2s; }
.sidenav__caret.is-open { transform: rotate(180deg); }
.sidenav__children { display: flex; flex-direction: column; gap: 1px; padding-inline-start: 1.6rem; margin: 2px 0 4px; border-inline-start: 2px solid var(--p-content-border-color); margin-inline-start: 1.3rem; }
.sidenav__child { font-weight: 500; font-size: 0.85rem; padding: 0.5rem 0.75rem; }
</style>
