<template>
  <!-- التحكم في فتح درس: مفتوح / مجدول بتاريخ / مغلق -->
  <div class="oc">
    <span v-if="locked" class="chip lock" :title="locked"><i class="pi pi-lock" /> {{ locked }}</span>
    <template v-else>
      <span class="chip" :class="state"><i :class="ICON[state]" /> {{ label }}</span>
      <template v-if="!readonly">
        <input v-if="editing" v-model="date" type="datetime-local" class="dt" @keyup.enter="saveDate" />
        <button v-if="editing" type="button" class="b ok" title="حفظ" @click="saveDate"><i class="pi pi-check" /></button>
        <template v-else>
          <button v-if="state !== 'open'" type="button" class="b" title="افتح الآن" @click="$emit('set', new Date().toISOString())"><i class="pi pi-lock-open" /></button>
          <button type="button" class="b" title="جدولة بتاريخ" @click="startEdit"><i class="pi pi-calendar" /></button>
          <button v-if="state !== 'closed'" type="button" class="b" title="أغلق" @click="$emit('set', null)"><i class="pi pi-times" /></button>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ at: { type: String, default: null }, locked: { type: String, default: '' }, readonly: Boolean })
const emit = defineEmits(['set'])
const ICON = { open: 'pi pi-lock-open', scheduled: 'pi pi-clock', closed: 'pi pi-lock' }
const state = computed(() => (!props.at ? 'closed' : props.at <= new Date().toISOString() ? 'open' : 'scheduled'))
const fmt = (d) => new Date(d).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' })
const label = computed(() => ({ open: 'مفتوح', scheduled: `يُفتح ${fmt(props.at)}`, closed: 'مغلق' })[state.value])
const editing = ref(false)
const date = ref('')
function startEdit() {
  date.value = (props.at && state.value === 'scheduled' ? props.at : new Date(Date.now() + 7 * 864e5).toISOString()).slice(0, 16)
  editing.value = true
}
function saveDate() {
  if (date.value) emit('set', new Date(date.value).toISOString())
  editing.value = false
}
</script>

<style scoped>
.oc { display: inline-flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
.chip { font-size: 0.76rem; padding: 0.15rem 0.55rem; border-radius: 999px; white-space: nowrap; }
.chip.open { background: #e5f6ee; color: #17733f; }
.chip.scheduled { background: #fff3d6; color: #8a5a00; }
.chip.closed, .chip.lock { background: #f0f1f4; color: #6b6b7b; }
.b { border: 1px solid var(--line); background: var(--surface); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: var(--p-text-muted-color); }
.b:hover { color: var(--brand); border-color: var(--brand); }
.b.ok { color: #17733f; }
.dt { border: 1px solid var(--line); border-radius: 8px; padding: 0.2rem 0.4rem; font: inherit; font-size: 0.8rem; }
</style>
