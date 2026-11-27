<template>
  <!-- TE/ED: بنك الواجبات والتقييمات — واجبات وتقييمات المنصة والمعتمدة من المعلمين؛ يربطها أي معلم بقسمه -->
  <div>
    <PageHeader title="بنك الواجبات والتقييمات" subtitle="واجبات وتقييمات جاهزة من المنصة ومن زملائك (المعتمدة). اختر واجباً أو تقييماً وأدرجه في قسمك بدرسه وآخر أجله." />
    <div class="abar panel">
      <IconField class="q"><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="ابحث بالعنوان أو الدرس" fluid /></IconField>
      <Select v-model="level" :options="levelOpts" placeholder="كل المستويات" show-clear option-label="label" option-value="value" />
      <Select v-model="subject" :options="subjectOpts" placeholder="كل المواد" show-clear option-label="label" option-value="value" />
      <Select v-model="kind" :options="[{ label: 'التقييمات', value: 'quiz' }, { label: 'الواجبات', value: 'homework' }]" option-label="label" option-value="value" placeholder="التقييمات والواجبات" show-clear />
      <Select v-model="qt" :options="Object.entries(QTYPES).map(([value, x]) => ({ value, label: x.label }))" option-label="label" option-value="value" placeholder="كل أنواع الأسئلة" show-clear />
      <span class="grow" />
      <RouterLink to="/app/quiz-builder" class="p-button p-component p-button-sm"><i class="pi pi-plus" />&nbsp;تقييم جديد</RouterLink>
      <RouterLink to="/app/new-homework" class="p-button p-component p-button-sm p-button-outlined">واجب جديد</RouterLink>
    </div>
    <p class="muted cnt">{{ list.length }} عنصر</p>
    <div class="grid">
      <article v-for="a in list" :key="a.id" class="card" :style="{ '--c': a.subjectColor || 'var(--brand)' }">
        <header><span class="ic"><i :class="a.type === 'quiz' ? 'pi pi-question-circle' : 'pi pi-pencil'" /></span><div><b>{{ a.title }}</b><small class="muted">{{ a.subjectName }} · {{ a.levelName }}</small></div></header>
        <p class="ls muted"><i class="pi pi-bookmark" /> {{ a.lessonTitle || 'بلا درس' }}</p>
        <div class="meta">
          <span>{{ a.type === 'quiz' ? `${a.questions?.length || 0} سؤال · ${a.maxScore} ن` : 'واجب منزلي' }}</span>
          <span>{{ a.origin === 'platform' ? 'المنصة' : a.authorName }}</span>
          <StatusTag v-if="a.origin !== 'platform' && a.status !== 'approved'" :status="a.status" />
        </div>
        <div v-if="a.qtypes?.length" class="qt"><span v-for="t in a.qtypes" :key="t">{{ QTYPES[t]?.label }}</span></div>
        <footer>
          <Button label="معاينة" text size="small" icon="pi pi-eye" @click="cur = a" />
          <Button label="إدراج في قسمي" size="small" icon="pi pi-plus" :disabled="!canLink(a)" @click="link(a)" />
        </footer>
      </article>
    </div>

    <Dialog :visible="!!cur" modal :header="cur?.title" :style="{ width: 'min(760px, 96vw)' }" @update:visible="cur = null">
      <div v-if="cur">
        <p v-if="cur.instructions" class="ins">{{ cur.instructions }}</p>
        <ol class="qs">
          <li v-for="(qq, i) in cur.questions || []" :key="i"><b>{{ qq.q }}</b> <small class="muted">({{ QTYPES[qtype(qq)].label }} · {{ qpoints(qq) }} ن)</small><div class="ans">✓ {{ correctText(qq) }}</div></li>
        </ol>
      </div>
      <template #footer><Button label="إدراج في قسمي" icon="pi pi-plus" :disabled="!cur || !canLink(cur)" @click="link(cur)" /></template>
    </Dialog>
    <LinkDialog v-model:visible="linkOpen" :item="linkIt" kind="activity" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import LinkDialog from '@/components/library/LinkDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { activitiesBank } from '@/api/bank'
import { QTYPES, qtype, qpoints, correctText } from '@/utils/quiz'

const auth = useAuthStore()
const cat = useCatalog()
const all = ref([])
const q = ref('')
const level = ref(null)
const subject = ref(null)
const kind = ref(null)
const qt = ref(null)
const cur = ref(null)
const linkOpen = ref(false)
const linkIt = ref(null)
const myLevels = computed(() => (auth.role === 'editor' ? (auth.active.levels || []).map((l) => l.id) : [...new Set((auth.active.classIds || []).map(cat.levelOfClass))]))
onMounted(async () => {
  all.value = await activitiesBank({ personId: auth.person.id, scopeLevels: auth.role === 'editor' ? myLevels.value : null })
  level.value = myLevels.value.length === 1 ? myLevels.value[0] : null
})
const levelOpts = computed(() => cat.levelOptions.filter((o) => all.value.some((a) => a.levelId === o.value)))
const subjectOpts = computed(() => [...new Map(all.value.filter((a) => !level.value || a.levelId === level.value).map((a) => [a.subjectName, { label: a.subjectName, value: a.subjectName }])).values()])
const list = computed(() => all.value.filter((a) => (!level.value || a.levelId === level.value) && (!subject.value || a.subjectName === subject.value) && (!kind.value || a.type === kind.value) && (!qt.value || a.qtypes?.includes(qt.value)) && (!q.value || [a.title, a.lessonTitle].some((v) => v?.includes(q.value)))))
const canLink = (a) => myLevels.value.includes(a.levelId) && (a.origin === 'platform' || a.status === 'approved' || a.authorId === auth.person.id)
function link(a) {
  linkIt.value = a
  cur.value = null
  linkOpen.value = true
}
</script>

<style scoped>
.abar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.q { min-width: 220px; flex: 1; }
.grow { flex: 1; }
.cnt { margin: 0.75rem 0; font-size: 0.85rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(290px, 100%), 1fr)); gap: 0.9rem; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.card header { display: flex; gap: 0.6rem; align-items: flex-start; }
.card header b { display: block; }
.card header small { font-size: 0.78rem; }
.ic { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); flex-shrink: 0; }
.ls { margin: 0; font-size: 0.82rem; }
.meta { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; font-size: 0.8rem; }
.qt { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.qt span { font-size: 0.72rem; background: #f0f2f6; border-radius: 999px; padding: 0.1rem 0.5rem; }
.card footer { margin-top: auto; display: flex; justify-content: space-between; }
.qs { padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.ans { color: #17733f; font-size: 0.86rem; margin-top: 0.2rem; }
.ins { white-space: pre-wrap; }
</style>
