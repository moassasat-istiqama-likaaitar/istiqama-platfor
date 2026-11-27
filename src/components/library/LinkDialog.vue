<template>
  <!-- الإدراج في القسم: في أي قسم (أو المستوى كله للمحرر)، وفي أي درس (أو بلا درس)، وآخر أجل للواجبات والتقييمات.
       يمكن ربط عنصر من مستوى آخر بدرس من مستوى القسم (مثلاً محتوى الرابعة في درس من الثالثة). -->
  <Dialog :visible="visible" modal :header="`إدراج: ${item?.title || ''}`" :style="{ width: 'min(560px, 95vw)' }" @update:visible="$emit('update:visible', $event)">
    <div v-if="item" class="ld">
      <label class="fl"><span>{{ tg.isEditor.value ? 'أين؟ (المستوى كقسم واحد أو قسم بعينه)' : 'في أي قسم؟' }}</span>
        <MultiSelect v-model="targets" :options="targetOpts" option-label="label" option-value="value" option-disabled="disabled" display="chip" placeholder="اختر" fluid />
        <small v-if="!targetOpts.length" class="warn">لا أقسام لك.</small>
        <small v-else-if="multiLevel" class="muted">أقسام من مستوى واحد في كل إدراج، لأن لكل مستوى دروسه.</small>
      </label>
      <label class="fl"><span>في أي درس تريد إدراجه؟</span>
        <Select v-model="lessonId" :placeholder="targetLevel ? '— بلا درس —' : 'اختر القسم أولاً'" :disabled="!targetLevel" :options="lessonGroups" option-label="label" option-value="value" option-disabled="disabled" option-group-label="label" option-group-children="items" filter fluid />
        <small class="muted">«بلا درس»: يظهر في مكتبة القسم فقط، ويجده التلميذ بالتصفية. الدروس المقفلة لم يفتحها المحرر بعد.</small>
      </label>
      <p v-if="cross" class="note note--cross"><i class="pi pi-arrows-h" /> هذا العنصر من مستوى <b>{{ levelName(itemLevel) }}</b>، وسيُربط بدرس من <b>{{ levelName(targetLevel) }}</b>. يظهر للتلاميذ حين يُفتح الدرس الذي تختاره.</p>
      <label v-if="kind === 'activity'" class="fl"><span>آخر أجل للتسليم</span><InputText v-model="due" type="datetime-local" fluid /></label>
      <p v-if="tg.isEditor.value && targets.some((t) => t.startsWith('L:'))" class="note"><i class="pi pi-lock" /> ما تدرجه على المستوى يصل كل أقسامه ويكون <b>إجبارياً</b>: لا يستطيع المعلم إزالته.</p>
    </div>
    <template #footer>
      <Button label="إلغاء" text severity="secondary" @click="$emit('update:visible', false)" />
      <Button label="إدراج" icon="pi pi-plus" :disabled="!targets.length" :loading="busy" @click="save" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { useTargets } from '@/composables/useTargets'
import { linkItem } from '@/api/bank'

const props = defineProps({ visible: Boolean, item: Object, kind: { type: String, default: 'content' } })
const emit = defineEmits(['update:visible', 'done'])
const auth = useAuthStore()
const cat = useCatalog()
const tg = useTargets()
const toast = useToast()
const targets = ref([])
const lessonId = ref(null)
const due = ref('')
const busy = ref(false)
const itemLevel = computed(() => props.item?.levelId || props.item?.level?.id)
const subjectId = computed(() => props.item?.subjectId || props.item?.subject?.id)
const levelName = (id) => cat.levels.find((l) => l.id === id)?.name || ''
// كل أقسام المعلم (أو مستويات المحرر)، لا أقسام مستوى العنصر فقط
const allTargets = computed(() => tg.options(null))
const multiLevel = computed(() => new Set(allTargets.value.map((o) => tg.levelOf(o.value))).size > 1)
// مستوى الإدراج = مستوى أول قسم مختار؛ أقسام المستويات الأخرى تُعطَّل
const targetLevel = computed(() => (targets.value.length ? tg.levelOf(targets.value[0]) : null))
const targetOpts = computed(() => allTargets.value.map((o) => ({ ...o, disabled: !!targetLevel.value && tg.levelOf(o.value) !== targetLevel.value })))
const cross = computed(() => !!targetLevel.value && targetLevel.value !== itemLevel.value)
// دروس مستوى القسم المختار، مجمّعة حسب المادة، ومادة العنصر أولاً
const itemSubjectName = computed(() => cat.subjects.find((x) => x.id === subjectId.value)?.name)
const lessonGroups = computed(() => {
  if (!targetLevel.value) return []
  const subs = cat.subjects.filter((x) => x.levelId === targetLevel.value).sort((a, b) => (b.name === itemSubjectName.value) - (a.name === itemSubjectName.value) || (a.order ?? 0) - (b.order ?? 0))
  return [{ label: 'عام', items: [{ label: '— بلا درس (عام للقسم) —', value: null }] }, ...subs.map((x) => ({ label: x.name, items: cat.linkLessonOptions(x.id) })).filter((g) => g.items.length)]
})
const openLesson = (id) => lessonGroups.value.some((g) => g.items.some((o) => o.value === id && !o.disabled))
watch(() => props.visible, (v) => {
  if (!v) return
  const same = allTargets.value.filter((o) => tg.levelOf(o.value) === itemLevel.value)
  targets.value = allTargets.value.length === 1 ? [allTargets.value[0].value] : same.length === 1 ? [same[0].value] : []
  due.value = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16)
  pickLesson(targetLevel.value)
})
// درس العنصر نفسه إن كان الإدراج في مستواه، وإلا بلا درس حتى يختار المعلم
function pickLesson(lv) {
  const want = props.item?.lessonId || props.item?.lesson?.id || null
  lessonId.value = lv && lv === itemLevel.value && want && openLesson(want) ? want : null
}
watch(targetLevel, pickLesson)
async function save() {
  busy.value = true
  try {
    const r = await linkItem(auth.person, auth.role, { itemKind: props.kind, itemId: props.item.id, targets: tg.decode(targets.value), lessonId: lessonId.value, due: props.kind === 'activity' ? due.value : null })
    toast.add({ severity: r.created ? 'success' : 'info', summary: r.created ? `أُدرج في ${r.classes} قسم` : 'مُدرج مسبقاً في هذا المكان', life: 2500 })
    emit('done')
    emit('update:visible', false)
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.ld { display: flex; flex-direction: column; gap: 1rem; }
.fl { display: flex; flex-direction: column; gap: 0.35rem; }
.fl > span { font-weight: 700; font-size: 0.88rem; }
.warn { color: #a15c00; }
.note { margin: 0; padding: 0.6rem 0.8rem; background: #fff6e0; border-radius: 10px; font-size: 0.86rem; }
.note--cross { background: #eaf1ff; }
</style>

<style>
/* عناوين المجموعات في قوائم الاختيار (المادة فوق دروسها) */
.p-select-option-group { font-weight: 700; color: var(--p-primary-color); }
</style>
