<template>
  <!-- حقل إجابة سؤال واحد حسب نوعه (ثمانية أنواع) — للتلميذ، وللمعاينة عند المعلم -->
  <div class="qf" :class="'qf--' + t">
    <!-- اختيار واحد / صح وخطأ -->
    <div v-if="t === 'mcq' || t === 'tf'" class="opts" :class="{ two: q.options.length === 2 }">
      <button v-for="(o, k) in q.options" :key="k" type="button" class="opt" :class="{ on: modelValue === k }" :disabled="readonly" @click="set(k)">
        <span class="opt__k">{{ LETTERS[k] }}</span><span>{{ o }}</span>
      </button>
    </div>

    <!-- اختيار متعدد -->
    <template v-else-if="t === 'multi'">
      <small class="hint">اختر كل الإجابات الصحيحة</small>
      <div class="opts">
        <button v-for="(o, k) in q.options" :key="k" type="button" class="opt" :class="{ on: (modelValue || []).includes(k) }" :disabled="readonly" @click="toggle(k)">
          <span class="opt__k"><i :class="(modelValue || []).includes(k) ? 'pi pi-check-square' : 'pi pi-stop'" /></span><span>{{ o }}</span>
        </button>
      </div>
    </template>

    <!-- الربط -->
    <template v-else-if="t === 'match'">
      <small class="hint">اختر لكل عنصر ما يناسبه</small>
      <div class="match">
        <div v-for="(l, i) in q.lefts" :key="i" class="match__row">
          <span class="match__l">{{ l }}</span>
          <i class="pi pi-arrow-left flip" />
          <Select :model-value="(modelValue || [])[i]" :options="rightOptions" option-label="label" option-value="value" placeholder="اختر…" :disabled="readonly" class="match__r" @update:model-value="(v) => setAt(i, v)" />
        </div>
      </div>
    </template>

    <!-- الترتيب -->
    <template v-else-if="t === 'order'">
      <small class="hint">رتّب العناصر بالأسهم</small>
      <ol class="order">
        <li v-for="(idx, pos) in orderList" :key="idx">
          <span class="order__n">{{ pos + 1 }}</span>
          <span class="order__t">{{ q.items[idx] }}</span>
          <span v-if="!readonly" class="order__b">
            <button type="button" :disabled="!pos" @click="move(pos, -1)"><i class="pi pi-arrow-up" /></button>
            <button type="button" :disabled="pos === orderList.length - 1" @click="move(pos, 1)"><i class="pi pi-arrow-down" /></button>
          </span>
        </li>
      </ol>
    </template>

    <!-- ملء الفراغ -->
    <p v-else-if="t === 'fill'" class="fill">
      <template v-for="(part, i) in parts" :key="i">
        <span>{{ part }}</span>
        <input v-if="i < parts.length - 1" class="fill__in" :value="(modelValue || [])[i] || ''" :disabled="readonly" :placeholder="`${i + 1}`" @input="(e) => setAt(i, e.target.value)" />
      </template>
    </p>

    <!-- إجابة قصيرة -->
    <InputText v-else-if="t === 'short'" :model-value="modelValue || ''" :disabled="readonly" fluid placeholder="اكتب إجابتك باختصار" @update:model-value="set" />

    <!-- مقالي -->
    <Textarea v-else :model-value="modelValue || ''" :disabled="readonly" rows="5" auto-resize fluid placeholder="اكتب إجابتك" @update:model-value="set" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { qtype } from '@/utils/quiz'

const props = defineProps({ q: { type: Object, required: true }, modelValue: { default: undefined }, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']
const t = computed(() => qtype(props.q))
const set = (v) => emit('update:modelValue', v)
const setAt = (i, v) => {
  const arr = [...(props.modelValue || [])]
  arr[i] = v
  emit('update:modelValue', arr)
}
const toggle = (k) => {
  const s = new Set(props.modelValue || [])
  s.has(k) ? s.delete(k) : s.add(k)
  emit('update:modelValue', [...s].sort())
}
const rightOptions = computed(() => (props.q.rightOrder || props.q.rights?.map((_, i) => i) || []).map((i) => ({ label: props.q.rights[i], value: i })))
const orderList = computed(() => props.modelValue || props.q.startOrder || props.q.items?.map((_, i) => i) || [])
function move(pos, d) {
  const arr = [...orderList.value]
  ;[arr[pos], arr[pos + d]] = [arr[pos + d], arr[pos]]
  emit('update:modelValue', arr)
}
// الترتيب: الترتيب الابتدائي يُعتبر إجابة (حتى لا يبقى السؤال «بلا إجابة»)
watch(() => props.q, () => {
  if (t.value === 'order' && !props.modelValue && !props.readonly) emit('update:modelValue', [...orderList.value])
}, { immediate: true })
const parts = computed(() => String(props.q.q || '').split(/_{3,}/))
</script>

<style scoped>
.hint { display: block; color: var(--p-text-muted-color); margin-bottom: 0.5rem; }
.opts { display: grid; grid-template-columns: 1fr; gap: 0.55rem; }
.opts.two { grid-template-columns: 1fr 1fr; }
.opt { display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 2px solid var(--line); border-radius: 14px; background: var(--surface); font: inherit; font-size: 1.02rem; color: var(--ink); text-align: start; cursor: pointer; }
.opt:hover:not(:disabled) { border-color: var(--c, var(--brand)); }
.opt.on { border-color: var(--c, var(--brand)); background: color-mix(in srgb, var(--c, var(--brand)) 9%, #fff); font-weight: 700; }
.opt__k { width: 30px; height: 30px; border-radius: 50%; background: var(--bg); display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
.opt.on .opt__k { background: var(--c, var(--brand)); color: #fff; }
.match { display: flex; flex-direction: column; gap: 0.55rem; }
.match__row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.6rem; }
.match__l { padding: 0.65rem 0.9rem; background: var(--bg); border-radius: 10px; font-weight: 700; }
.match__r { width: 100%; }
.order { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
.order li { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.8rem; border: 2px solid var(--line); border-radius: 12px; background: var(--surface); }
.order__n { width: 26px; height: 26px; border-radius: 50%; background: var(--c, var(--brand)); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; }
.order__t { flex: 1; }
.order__b { display: flex; gap: 0.2rem; }
.order__b button { border: 1px solid var(--line); background: var(--surface); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; }
.order__b button:disabled { opacity: 0.3; }
.fill { font-size: 1.1rem; line-height: 2.4; margin: 0; }
.fill__in { width: 130px; margin: 0 0.3rem; padding: 0.3rem 0.5rem; border: 0; border-bottom: 2px solid var(--c, var(--brand)); background: color-mix(in srgb, var(--c, var(--brand)) 6%, #fff); font: inherit; text-align: center; border-radius: 6px 6px 0 0; }
@media (max-width: 600px) { .match__row { grid-template-columns: 1fr; } .match__row > i { display: none; } .opts.two { grid-template-columns: 1fr; } }
</style>
