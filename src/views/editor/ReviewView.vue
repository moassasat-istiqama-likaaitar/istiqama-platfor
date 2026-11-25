<template>
  <!-- ED03/ED04: مراجعة المحتوى — قرار واحد لكل عنصر: اعتماد، اعتماد مؤقت، طلب تعديل، رفض بملاحظة -->
  <div>
    <PageHeader title="مراجعة المحتوى" subtitle="كل ما ينتظر قراراً: محتوى المكتبة المركزية، مقترحات المعلمين، والأنشطة المرسلة للمراجعة." />
    <StatTiles :items="[
      { label: 'بانتظار القرار', value: rows.length, icon: 'pi pi-inbox', tone: rows.length ? 'amber' : 'green' },
      { label: 'مقترحات المعلمين', value: rows.filter((r) => r.kind === 'upload').length, icon: 'pi pi-user', tone: 'purple' },
      { label: 'أنشطة', value: rows.filter((r) => r.kind === 'activity').length, icon: 'pi pi-question-circle', tone: 'blue' },
      { label: 'قرارات أخيرة', value: log.length, icon: 'pi pi-history', tone: 'green' }
    ]" />
    <RecordTable :rows="rows" :loading="loading" :columns="[
      { field: 'title', label: 'العنوان' }, { field: 'origin', label: 'المصدر' }, { field: 'typeLabel', label: 'النوع' }, { field: 'subjectName', label: 'المادة' },
      { field: 'levelName', label: 'المستوى' }, { field: 'authorName', label: 'المؤلف' }, { field: 'at', label: 'التاريخ', type: 'date' }, { field: 'status', label: 'الحالة', type: 'status' }
    ]" :search-keys="['title', 'authorName', 'lessonTitle']" :filters="[
      { key: 'origin', label: 'المصدر', options: [{ label: 'المكتبة', value: 'المكتبة' }, { label: 'مقترح معلم', value: 'مقترح معلم' }, { label: 'نشاط', value: 'نشاط' }] },
      { key: 'levelName', label: 'المستوى', options: levelOpts }
    ]" unit="عنصر" empty-text="لا شيء ينتظر المراجعة 🎉">
      <template #cell-title="{ row }"><b>{{ row.title }}</b><small v-if="row.lessonTitle" class="muted d">{{ row.lessonTitle }}</small></template>
      <template #actions="{ row }"><Button label="مراجعة" size="small" @click="open(row)" /></template>
    </RecordTable>

    <Dialog v-model:visible="dlg" modal :header="cur?.title" :style="{ width: 'min(900px, 96vw)' }">
      <div v-if="cur" class="rv">
        <div class="rv__view">
          <ContentViewer v-if="cur.kind === 'content' && ['video', 'slides', 'pdf', 'image'].includes(cur.type)" :item="cur" :color="subj?.color" :accent="subj?.accent" :art="subj?.art" />
          <ol v-else-if="cur.questions?.length" class="qs"><li v-for="(q, i) in cur.questions" :key="i"><b>{{ q.q }}</b><span v-for="(o, oi) in q.options" :key="oi" :class="{ right: q.answer === oi }">{{ o }}</span></li></ol>
          <div v-else class="file"><i class="pi pi-file" /><p>{{ cur.title }}</p><small class="muted">ملف مرفوع من المعلم — يُعرض هنا بعد الربط بالخلفية</small></div>
        </div>
        <aside class="rv__side">
          <dl>
            <div><dt>المصدر</dt><dd>{{ cur.origin }}</dd></div>
            <div><dt>المؤلف</dt><dd>{{ cur.authorName }}</dd></div>
            <div><dt>المادة / المستوى</dt><dd>{{ cur.subjectName }} — {{ cur.levelName || '—' }}</dd></div>
            <div v-if="cur.lessonTitle"><dt>الدرس</dt><dd>{{ cur.lessonTitle }}</dd></div>
          </dl>
          <h4>معايير المراجعة</h4>
          <label v-for="c in CHECKS" :key="c" class="chk"><Checkbox v-model="checks" :value="c" /> {{ c }}</label>
          <label class="f"><span>ملاحظة لصاحب المحتوى</span><Textarea v-model="note" rows="3" auto-resize fluid /></label>
        </aside>
      </div>
      <template #footer>
        <Button label="رفض" icon="pi pi-times" severity="danger" outlined :loading="busy === 'rejected'" @click="act('rejected')" />
        <Button label="طلب تعديل" icon="pi pi-pencil" severity="secondary" outlined :loading="busy === 'draft'" @click="act('draft')" />
        <Button label="اعتماد مؤقت" icon="pi pi-hourglass" severity="info" outlined :loading="busy === 'temp'" @click="act('temp')" />
        <Button label="اعتماد" icon="pi pi-check" severity="success" :loading="busy === 'approved'" @click="act('approved')" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import ContentViewer from '@/components/viewers/ContentViewer.vue'
import { useCatalog } from '@/composables/useCatalog'
import { reviewQueue, decide, recentDecisions } from '@/api/editorial'

const toast = useToast()
const cat = useCatalog()
const CHECKS = ['المحتوى مطابق للمنهاج والدرس', 'خالٍ من الأخطاء العلمية واللغوية', 'مناسب للمستوى العمري', 'جودة الصوت والصورة مقبولة', 'يحترم الضوابط الشرعية والتربوية']
const rows = ref([])
const log = ref([])
const loading = ref(true)
const dlg = ref(false)
const cur = ref(null)
const note = ref('')
const checks = ref([])
const busy = ref(null)
const subj = computed(() => cat.subjects.find((s) => s.name === cur.value?.subjectName))
const levelOpts = computed(() => [...new Set(rows.value.map((r) => r.levelName).filter(Boolean))].map((v) => ({ label: v, value: v })))
async function load() {
  loading.value = true
  rows.value = (await reviewQueue()).map((r) => ({ ...r, typeLabel: cat.TYPE_LABEL[r.type] || (r.type === 'quiz' ? 'اختبار' : r.type) }))
  log.value = await recentDecisions()
  loading.value = false
}
onMounted(load)
function open(r) {
  cur.value = r
  note.value = ''
  checks.value = []
  dlg.value = true
}
async function act(decision) {
  busy.value = decision
  try {
    await decide(cur.value, decision, note.value)
    toast.add({ severity: 'success', summary: { approved: 'اعتُمد المحتوى', temp: 'اعتُمد مؤقتاً', draft: 'أُعيد لصاحبه للتعديل', rejected: 'رُفض المحتوى' }[decision], life: 2200 })
    dlg.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = null
  }
}
</script>

<style scoped>
.d { display: block; font-size: 0.78rem; }
.rv { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1rem; }
.rv__view { min-width: 0; }
.qs { margin: 0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.qs b { display: block; margin-bottom: 0.3rem; }
.qs span { display: inline-block; margin: 0.15rem; padding: 0.2rem 0.6rem; border: 1px solid var(--line); border-radius: 8px; font-size: 0.85rem; }
.qs span.right { border-color: #17a077; background: #f0fbf6; }
.file { text-align: center; padding: 2.5rem 1rem; border: 2px dashed var(--line); border-radius: 14px; }
.file i { font-size: 2.5rem; color: var(--brand); }
.rv__side dl { margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.rv__side dt { font-size: 0.78rem; color: var(--p-text-muted-color); }
.rv__side dd { margin: 0; font-weight: 700; }
.rv__side h4 { margin: 0 0 0.4rem; font-size: 0.9rem; }
.chk { display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; margin-bottom: 0.35rem; }
.f { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.75rem; }
.f > span { font-weight: 700; font-size: 0.86rem; }
@media (max-width: 820px) { .rv { grid-template-columns: 1fr; } }
</style>
