<template>
  <!-- الإدراج في القسم: في أي قسم (أو المستوى كله للمحرر)، وفي أي درس (أو بلا درس)، وآخر أجل للأنشطة -->
  <Dialog :visible="visible" modal :header="`إدراج: ${item?.title || ''}`" :style="{ width: 'min(560px, 95vw)' }" @update:visible="$emit('update:visible', $event)">
    <div v-if="item" class="ld">
      <label class="fl"><span>{{ tg.isEditor.value ? 'أين؟ (المستوى كقسم واحد أو قسم بعينه)' : 'في أي قسم؟' }}</span>
        <MultiSelect v-model="targets" :options="targetOpts" option-label="label" option-value="value" display="chip" placeholder="اختر" fluid />
        <small v-if="!targetOpts.length" class="warn">لا أقسام لك في مستوى هذا العنصر ({{ item.levelName || item.level?.name }}).</small>
      </label>
      <label class="fl"><span>في أي درس تريد إدراجه؟</span>
        <Select v-model="lessonId" :options="lessonOpts" option-label="label" option-value="value" filter fluid />
        <small class="muted">«بلا درس»: يظهر في مكتبة القسم فقط، ويجده التلميذ بالتصفية.</small>
      </label>
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
const levelId = computed(() => props.item?.levelId || props.item?.level?.id)
const targetOpts = computed(() => tg.options(levelId.value))
const subjectId = computed(() => props.item?.subjectId || props.item?.subject?.id)
const lessonOpts = computed(() => [{ label: '— بلا درس (عام للقسم) —', value: null }, ...cat.lessonOptions(subjectId.value)])
watch(() => props.visible, (v) => {
  if (!v) return
  targets.value = targetOpts.value.length === 1 ? [targetOpts.value[0].value] : []
  lessonId.value = props.item?.lessonId || props.item?.lesson?.id || null
  due.value = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16)
})
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
</style>
