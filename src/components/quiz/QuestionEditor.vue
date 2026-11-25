<template>
  <!-- محرّر سؤال واحد حسب نوعه (ثمانية أنواع) — يعدّل الكائن q مباشرة -->
  <div class="qe">
    <div class="qe__top">
      <Textarea v-model="q.q" rows="1" auto-resize fluid :placeholder="t === 'fill' ? 'نص السؤال — ضع ___ مكان كل فراغ. مثال: فرائض الوضوء ___ فرائض.' : 'نص السؤال'" />
      <label class="pts"><InputNumber v-model="q.points" :min="0.5" :max="20" :step="0.5" show-buttons button-layout="horizontal" input-class="pts__in" /><small>نقطة</small></label>
    </div>

    <!-- اختيار واحد / صح وخطأ / متعدد -->
    <div v-if="['mcq', 'tf', 'multi'].includes(t)" class="opts">
      <small class="hint">{{ t === 'multi' ? 'علّم كل الإجابات الصحيحة' : 'علّم الإجابة الصحيحة' }}</small>
      <div v-for="(o, oi) in q.options" :key="oi" class="opt" :class="{ right: isRight(oi) }">
        <button type="button" class="mark" title="صحيحة" @click="mark(oi)"><i :class="isRight(oi) ? (t === 'multi' ? 'pi pi-check-square' : 'pi pi-check-circle') : t === 'multi' ? 'pi pi-stop' : 'pi pi-circle'" /></button>
        <InputText v-model="q.options[oi]" :disabled="t === 'tf'" fluid :placeholder="`الخيار ${oi + 1}`" />
        <button v-if="t !== 'tf' && q.options.length > 2" type="button" class="rm" @click="removeOpt(oi)"><i class="pi pi-times" /></button>
      </div>
      <button v-if="t !== 'tf' && q.options.length < 6" type="button" class="add" @click="q.options.push('')"><i class="pi pi-plus" /> خيار</button>
    </div>

    <!-- الربط -->
    <div v-else-if="t === 'match'" class="opts">
      <small class="hint">اكتب الأزواج الصحيحة؛ تُخلط عند التلميذ</small>
      <div v-for="(p, pi) in q.pairs" :key="pi" class="pair">
        <InputText v-model="p.left" fluid placeholder="العنصر" />
        <i class="pi pi-arrows-h" />
        <InputText v-model="p.right" fluid placeholder="ما يقابله" />
        <button v-if="q.pairs.length > 2" type="button" class="rm" @click="q.pairs.splice(pi, 1)"><i class="pi pi-times" /></button>
      </div>
      <button v-if="q.pairs.length < 8" type="button" class="add" @click="q.pairs.push({ left: '', right: '' })"><i class="pi pi-plus" /> زوج</button>
    </div>

    <!-- الترتيب -->
    <div v-else-if="t === 'order'" class="opts">
      <small class="hint">اكتب العناصر بترتيبها الصحيح؛ تُخلط عند التلميذ</small>
      <div v-for="(x, xi) in q.items" :key="xi" class="opt">
        <span class="num">{{ xi + 1 }}</span>
        <InputText v-model="q.items[xi]" fluid />
        <button v-if="q.items.length > 2" type="button" class="rm" @click="q.items.splice(xi, 1)"><i class="pi pi-times" /></button>
      </div>
      <button v-if="q.items.length < 8" type="button" class="add" @click="q.items.push('')"><i class="pi pi-plus" /> عنصر</button>
    </div>

    <!-- ملء الفراغ -->
    <div v-else-if="t === 'fill'" class="opts">
      <small class="hint">{{ nBlanks ? `${nBlanks} فراغ — اكتب الإجابة لكل فراغ (افصل الصيغ المقبولة بفاصلة)` : 'ضع ___ في نص السؤال لإنشاء فراغ' }}</small>
      <div v-for="i in nBlanks" :key="i" class="opt">
        <span class="num">{{ i }}</span>
        <InputText :model-value="(q.blanks[i - 1] || []).join('، ')" fluid placeholder="مثال: أربع، 4" @update:model-value="(v) => setBlank(i - 1, v)" />
      </div>
    </div>

    <!-- إجابة قصيرة -->
    <div v-else-if="t === 'short'" class="opts">
      <small class="hint">كلمات مفتاحية يُصحَّح بها آلياً (اختياري). بدونها يصحّحه المعلم يدوياً.</small>
      <InputText :model-value="(q.keywords || []).join('، ')" fluid placeholder="مثال: النية، غسل الوجه" @update:model-value="(v) => (q.keywords = split(v))" />
    </div>

    <!-- مقالي -->
    <div v-else class="opts">
      <small class="hint">يصحّحه المعلم يدوياً. الإجابة النموذجية تظهر له عند التصحيح.</small>
      <Textarea v-model="q.model" rows="2" auto-resize fluid placeholder="الإجابة النموذجية / عناصر التصحيح" />
    </div>

    <InputText v-model="q.explain" fluid placeholder="شرح الإجابة (يظهر للتلميذ بعد التسليم) — اختياري" class="exp" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import { qtype, blanksCount } from '@/utils/quiz'

const props = defineProps({ q: { type: Object, required: true } })
const q = props.q
const t = computed(() => qtype(q))
const nBlanks = computed(() => blanksCount(q))
const split = (v) => String(v).split(/[،,]/).map((x) => x.trim()).filter(Boolean)
const isRight = (oi) => (t.value === 'multi' ? (q.answers || []).includes(oi) : q.answer === oi)
function mark(oi) {
  if (t.value !== 'multi') return (q.answer = oi)
  const a = new Set(q.answers || [])
  a.has(oi) ? a.delete(oi) : a.add(oi)
  q.answers = [...a].sort()
}
function removeOpt(oi) {
  q.options.splice(oi, 1)
  if (t.value === 'multi') q.answers = (q.answers || []).filter((x) => x !== oi).map((x) => (x > oi ? x - 1 : x))
  else if (q.answer >= q.options.length) q.answer = 0
}
function setBlank(i, v) {
  const b = [...(q.blanks || [])]
  b[i] = split(v)
  q.blanks = b
}
// عند تغيّر عدد الفراغات نضبط طول المصفوفة
watch(nBlanks, (n) => {
  if (t.value === 'fill') q.blanks = Array.from({ length: n }, (_, i) => (q.blanks || [])[i] || [])
})
</script>

<style scoped>
.qe { display: flex; flex-direction: column; gap: 0.6rem; }
.qe__top { display: flex; gap: 0.6rem; align-items: flex-start; }
.pts { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
.pts small { font-size: 0.72rem; color: var(--p-text-muted-color); }
.pts :deep(.pts__in) { width: 3.2rem; text-align: center; padding-inline: 0.2rem; }
.opts { display: flex; flex-direction: column; gap: 0.4rem; }
.hint { font-size: 0.78rem; color: var(--p-text-muted-color); }
.opt, .pair { display: flex; align-items: center; gap: 0.4rem; }
.pair > i { color: var(--p-text-muted-color); }
.opt.right :deep(input) { border-color: #17a077; background: #f0fbf6; }
.mark, .rm { border: 0; background: none; cursor: pointer; font-size: 1.1rem; color: var(--p-text-muted-color); }
.opt.right .mark { color: #17a077; }
.num { width: 24px; height: 24px; border-radius: 50%; background: #eef1f6; display: grid; place-items: center; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
.add { align-self: flex-start; border: 1px dashed var(--line); background: none; border-radius: 8px; padding: 0.3rem 0.7rem; cursor: pointer; font: inherit; font-size: 0.82rem; color: var(--brand); }
.exp { font-size: 0.85rem; }
</style>
