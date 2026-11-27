<template>
  <!-- نموذج موحّد (إضافة / تعديل) يُبنى من وصف الحقول -->
  <Dialog :visible="visible" modal :header="title" :style="{ width: wide ? 'min(760px, 96vw)' : 'min(520px, 96vw)' }" @update:visible="$emit('update:visible', $event)">
    <form class="fd" @submit.prevent="save">
      <label v-for="f in fields" :key="f.key" class="fd__f" :class="{ full: f.full || f.type === 'textarea' }">
        <span>{{ f.label }}<b v-if="f.required" class="req">*</b></span>
        <Select v-if="f.type === 'select'" v-model="model[f.key]" :options="f.options" option-label="label" option-value="value" :placeholder="f.placeholder || 'اختر…'" :filter="(f.options || []).length > 8" fluid />
        <MultiSelect v-else-if="f.type === 'multi'" v-model="model[f.key]" :options="f.options" option-label="label" option-value="value" :placeholder="f.placeholder || 'اختر…'" display="chip" :filter="(f.options || []).length > 8" fluid />
        <Textarea v-else-if="f.type === 'textarea'" v-model="model[f.key]" :rows="f.rows || 3" auto-resize fluid />
        <div v-else-if="f.type === 'switch'" class="fd__sw"><ToggleSwitch v-model="model[f.key]" /> <small class="muted">{{ f.hint }}</small></div>
        <InputText v-else v-model="model[f.key]" :type="f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'time' ? 'time' : 'text'" :placeholder="f.placeholder" :dir="f.ltr ? 'ltr' : undefined" fluid />
        <small v-if="f.hint && f.type !== 'switch'" class="muted">{{ f.hint }}</small>
        <small v-if="errors[f.key]" class="err">{{ errors[f.key] }}</small>
      </label>
      <slot :model="model" />
    </form>
    <template #footer>
      <Button label="إلغاء" text severity="secondary" @click="$emit('update:visible', false)" />
      <Button :label="saveLabel" icon="pi pi-check" :loading="busy" @click="save" />
    </template>
  </Dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import ToggleSwitch from 'primevue/toggleswitch'

const props = defineProps({ visible: Boolean, title: String, fields: { type: Array, default: () => [] }, value: { type: Object, default: () => ({}) }, saveLabel: { type: String, default: 'حفظ' }, busy: Boolean, wide: Boolean })
const emit = defineEmits(['update:visible', 'save'])
const model = reactive({})
const errors = reactive({})
watch(() => [props.visible, props.value], () => {
  if (!props.visible) return
  Object.keys(model).forEach((k) => delete model[k])
  Object.keys(errors).forEach((k) => delete errors[k])
  props.fields.forEach((f) => (model[f.key] = props.value?.[f.key] ?? (f.type === 'multi' ? [] : f.type === 'switch' ? false : f.default ?? '')))
  Object.assign(model, { ...props.value, ...model })
}, { immediate: true })

function save() {
  Object.keys(errors).forEach((k) => delete errors[k])
  props.fields.forEach((f) => {
    const v = model[f.key]
    if (f.required && (v === '' || v === null || v === undefined || (Array.isArray(v) && !v.length))) errors[f.key] = 'حقل إجباري'
  })
  if (Object.keys(errors).length) return
  emit('save', { ...model })
}
</script>

<style scoped>
.fd { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1rem; }
.fd__f { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.fd__f > span { font-size: 0.86rem; font-weight: 700; }
.fd__f.full { grid-column: 1 / -1; }
.fd__sw { display: flex; align-items: center; gap: 0.6rem; }
.req { color: #e5484d; margin-inline-start: 0.2rem; }
.err { color: #b42318; }
@media (max-width: 560px) { .fd { grid-template-columns: minmax(0, 1fr); } }
</style>
