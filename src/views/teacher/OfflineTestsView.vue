<template>
  <!-- TE17: بنك الاختبارات الحضورية — أفكار للمعلمين فقط: وثيقة الاختبار + الحلول + سلّم التنقيط.
       تُنشر مباشرة دون مصادقة، لا تُدرج في الأقسام، ولا يراها التلميذ ولا الولي. يراها معلمو المستوى نفسه. -->
  <div>
    <PageHeader title="بنك الاختبارات الحضورية" subtitle="بنك يستلهم منه معلمو المستوى: كل معلم يرفع اختباره مع الحلول وسلّم التنقيط. للمعلمين فقط — لا يصل التلاميذ ولا الأولياء." />
    <div class="tabs">
      <button type="button" class="pill" :class="{ 'is-active': tab === 'bank' }" @click="tab = 'bank'"><i class="pi pi-database" /> البنك <span class="pill__count">{{ list.length }}</span></button>
      <button type="button" class="pill" :class="{ 'is-active': tab === 'up' }" @click="tab = 'up'"><i class="pi pi-upload" /> رفع اختبار</button>
    </div>

    <template v-if="tab === 'bank'">
      <div class="fbar panel">
        <IconField class="q"><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="ابحث بالعنوان" fluid /></IconField>
        <Select v-model="fl.level" :options="levelOpts" placeholder="كل مستوياتي" show-clear option-label="label" option-value="value" />
        <Select v-model="fl.subject" :options="subjectNames" placeholder="كل المواد" show-clear option-label="label" option-value="value" />
        <Select v-model="fl.season" :options="SEASONS.map((s) => ({ label: s, value: s }))" placeholder="كل المواسم" show-clear option-label="label" option-value="value" />
        <Select v-model="fl.semester" :options="SEMESTERS" placeholder="كل السداسيات" show-clear option-label="label" option-value="value" />
      </div>
      <p class="muted cnt">{{ shown.length }} اختبار · من معلمي {{ levelOpts.map((l) => l.label).join('، ') }}</p>
      <div class="grid">
        <article v-for="t in shown" :key="t.id" class="card" :class="{ hid: t.hidden }">
          <header><span class="ic"><i class="pi pi-file" /></span><div><b>{{ t.title }}</b><small class="muted">{{ t.subjectName }} · {{ t.levelName }}</small></div></header>
          <div class="meta"><span>{{ t.kind }}</span><span>{{ t.season }}</span><span>السداسي {{ t.semester === 1 ? 'الأول' : 'الثاني' }}</span></div>
          <ul class="files">
            <li><i class="pi pi-file-pdf" /> الاختبار <small class="muted">{{ t.files.test }}</small></li>
            <li v-if="t.files.solution"><i class="pi pi-check-square" /> الحلول <small class="muted">{{ t.files.solution }}</small></li>
            <li v-if="t.files.grading"><i class="pi pi-list" /> سلّم التنقيط <small class="muted">{{ t.files.grading }}</small></li>
          </ul>
          <p v-if="t.notes" class="notes">{{ t.notes }}</p>
          <footer>
            <small class="muted"><i class="pi pi-user" /> {{ t.authorName }}</small>
            <span>
              <Button v-if="isEditor" :label="t.hidden ? 'إظهار' : 'إخفاء'" :icon="t.hidden ? 'pi pi-eye' : 'pi pi-eye-slash'" text size="small" severity="secondary" @click="hide(t)" />
              <Button v-if="t.authorId === auth.person.id" icon="pi pi-trash" text rounded size="small" severity="danger" title="حذف" @click="del(t)" />
              <Button label="تنزيل" icon="pi pi-download" size="small" outlined @click="toast.add({ severity: 'info', summary: 'يُنزَّل الملف بعد الربط بالخلفية', life: 2000 })" />
            </span>
          </footer>
        </article>
        <div v-if="!shown.length" class="panel empty">لا اختبارات بهذه التصفية.</div>
      </div>
    </template>

    <form v-else class="panel up" @submit.prevent="send">
      <label class="fl full"><span>العنوان *</span><InputText v-model="f.title" fluid placeholder="مثال: اختبار السداسي الأول — الفقه" /></label>
      <label class="fl"><span>المستوى *</span><Select v-model="f.levelId" :options="levelOpts" option-label="label" option-value="value" fluid /></label>
      <label class="fl"><span>المادة *</span><Select v-model="f.subjectId" :options="cat.subjectOptions(f.levelId)" option-label="label" option-value="value" fluid :disabled="!f.levelId" /></label>
      <label class="fl"><span>الموسم *</span><Select v-model="f.season" :options="SEASONS" fluid /></label>
      <label class="fl"><span>السداسي *</span><Select v-model="f.semester" :options="SEMESTERS" option-label="label" option-value="value" fluid /></label>
      <label class="fl"><span>النوع</span><Select v-model="f.kind" :options="['فرض', 'اختبار', 'اختبار تجريبي']" fluid /></label>
      <div class="full files-in">
        <label v-for="k in FILES" :key="k.key" class="drop" :class="{ has: f.files[k.key] }">
          <i :class="k.icon" /><b>{{ k.label }}{{ k.req ? ' *' : '' }}</b>
          <small class="muted">{{ f.files[k.key] || 'اختر ملفاً (PDF / Word / صورة)' }}</small>
          <input type="file" @change="(e) => (f.files[k.key] = e.target.files[0]?.name || null)" />
        </label>
      </div>
      <label class="fl full"><span>ملاحظات للزملاء</span><Textarea v-model="f.notes" rows="2" auto-resize fluid placeholder="مثال: يناسب حصة ساعة، ركّزت فيه على التطبيق" /></label>
      <p class="muted small full"><i class="pi pi-info-circle" /> يُنشر مباشرة في البنك لمعلمي المستوى نفسه، ويظهر في «محتواي وواجباتي وتقييماتي». لا يُدرج في الأقسام ولا يراه التلاميذ.</p>
      <div class="full act"><Button type="submit" label="نشر في البنك" icon="pi pi-upload" :loading="busy" :disabled="!valid" /></div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { offlineBank, uploadOfflineTest, removeOfflineTest, setOfflineHidden } from '@/api/teaching'
import { semesterOf, SEMESTER_NAMES } from '@/api/admin'

const auth = useAuthStore()
const cat = useCatalog()
const toast = useToast()
const SEASONS = ['2026 / 2027', '2025 / 2026', '2024 / 2025']
// السداسي الافتراضي يُحسب من تواريخ الموسم النشط التي تضبطها الإدارة العامة
const SEMESTERS = SEMESTER_NAMES.map((label, i) => ({ label, value: i + 1 }))
const FILES = [{ key: 'test', label: 'وثيقة الاختبار', icon: 'pi pi-file-pdf', req: true }, { key: 'solution', label: 'الحلول', icon: 'pi pi-check-square' }, { key: 'grading', label: 'سلّم التنقيط', icon: 'pi pi-list' }]
const isEditor = computed(() => auth.role === 'editor')
const myLevels = computed(() => (isEditor.value ? (auth.active.levels || []).map((l) => l.id) : [...new Set((auth.active.classIds || []).map(cat.levelOfClass))]))
const levelOpts = computed(() => cat.levelOptions.filter((o) => myLevels.value.includes(o.value)))
const tab = ref('bank')
const list = ref([])
const q = ref('')
const fl = reactive({ level: null, subject: null, season: null, semester: null })
const blank = () => ({ title: '', levelId: myLevels.value[0] || null, subjectId: null, season: SEASONS[0], semester: semesterOf(), kind: 'اختبار', files: { test: null, solution: null, grading: null }, notes: '' })
const f = reactive(blank())
const busy = ref(false)
const valid = computed(() => f.title.trim() && f.subjectId && f.files.test)
const subjectNames = computed(() => [...new Set(list.value.map((t) => t.subjectName))].map((n) => ({ label: n, value: n })))
const shown = computed(() => list.value.filter((t) => (!fl.level || t.levelId === fl.level) && (!fl.subject || t.subjectName === fl.subject) && (!fl.season || t.season === fl.season) && (!fl.semester || t.semester === fl.semester) && (!q.value || t.title.includes(q.value))))
const load = async () => (list.value = await offlineBank({ levels: myLevels.value, curator: isEditor.value }))
onMounted(load)
async function send() {
  busy.value = true
  try {
    await uploadOfflineTest(auth.person, JSON.parse(JSON.stringify(f)))
    toast.add({ severity: 'success', summary: 'نُشر في البنك', detail: 'متاح لمعلمي المستوى، ويظهر في «محتواي وواجباتي وتقييماتي»', life: 2800 })
    Object.assign(f, blank())
    tab.value = 'bank'
    load()
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 2500 })
  } finally {
    busy.value = false
  }
}
async function hide(t) {
  await setOfflineHidden(t.id, !t.hidden)
  load()
}
async function del(t) {
  await removeOfflineTest(t.id)
  toast.add({ severity: 'info', summary: 'حُذف', life: 1800 })
  load()
}
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.fbar { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.q { flex: 1; min-width: 200px; }
.cnt { margin: 0.75rem 0; font-size: 0.85rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.9rem; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; gap: 0.55rem; }
.card.hid { opacity: 0.55; border-style: dashed; }
.card header { display: flex; gap: 0.6rem; }
.card header b { display: block; }
.ic { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; background: color-mix(in srgb, var(--brand) 12%, transparent); color: var(--brand); flex-shrink: 0; }
.meta { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.meta span { font-size: 0.74rem; background: #f0f2f6; border-radius: 999px; padding: 0.1rem 0.55rem; }
.files { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; }
.files i { color: var(--brand); margin-inline-end: 0.3rem; }
.notes { margin: 0; font-size: 0.84rem; background: var(--bg); padding: 0.4rem 0.6rem; border-radius: 8px; }
.card footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.empty { text-align: center; padding: 2rem; grid-column: 1 / -1; }
.up { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem 1rem; max-width: 900px; }
.full { grid-column: 1 / -1; }
.fl { display: flex; flex-direction: column; gap: 0.3rem; }
.fl > span { font-weight: 700; font-size: 0.86rem; }
.files-in { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.drop { border: 2px dashed var(--line); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; text-align: center; cursor: pointer; }
.drop.has { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, transparent); }
.drop i { font-size: 1.5rem; color: var(--brand); }
.drop input { display: none; }
.small { font-size: 0.8rem; margin: 0; }
.act { display: flex; justify-content: flex-end; }
@media (max-width: 860px) { .up, .files-in { grid-template-columns: minmax(0, 1fr); } }
</style>
