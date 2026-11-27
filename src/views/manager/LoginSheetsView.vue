<template>
  <!-- SM12/AD21: أوراق الدخول — عمل إداري: طباعة أوراق الدخول للتلاميذ والأولياء والمعلمين (والطاقم الإداري للإدارة العامة) -->
  <div>
    <PageHeader title="أوراق الدخول" subtitle="عند إدراج الحسابات تُطبع أوراق الجميع مرتبة بالأقسام وتُوزَّع. بعدها: الجدد فقط، أو ورقة لمن نسي. عند أول دخول يختار كل واحد كلمة مرور خاصة به." />

    <section class="panel top">
      <SelectButton v-model="category" :options="categories" option-label="label" option-value="value" :allow-empty="false" />
      <label v-if="isTop" class="school"><span>المدرسة</span>
        <Select v-model="schoolId" :options="schoolOpts" option-label="label" option-value="value" filter fluid />
      </label>
      <p v-else class="muted school-name"><i class="pi pi-building" /> {{ mySchoolName }}</p>
    </section>

    <div class="cards">
      <!-- 1. الجميع -->
      <section class="panel card">
        <h3><i class="pi pi-print" /> طباعة الجميع</h3>
        <p>عند إدراج الحسابات أول مرة. {{ orderHint }}</p>
        <p class="num"><b>{{ sum.toPrint }}</b> ورقة<small v-if="sum.logged"> · {{ sum.logged }} دخلوا بكلمة مرورهم فلا تُطبع لهم</small></p>
        <Button label="طباعة الجميع" icon="pi pi-print" :disabled="!sum.toPrint" :loading="busy === 'all'" @click="issue('all')" />
      </section>

      <!-- 2. الجدد -->
      <section class="panel card">
        <h3><i class="pi pi-user-plus" /> الجدد فقط</h3>
        <p>من سُجّل لاحقاً ولم تُطبع له ورقة بعد.</p>
        <p class="num"><b>{{ sum.fresh }}</b> ورقة</p>
        <Button label="طباعة الجدد" icon="pi pi-print" severity="secondary" :disabled="!sum.fresh" :loading="busy === 'new'" @click="issue('new')" />
      </section>

      <!-- 3. شخص -->
      <section class="panel card">
        <h3><i class="pi pi-search" /> ورقة لشخص</h3>
        <p>نسي ورقته أو أراد تغيير كلمة مروره: ابحث بالاسم أو اللقب.</p>
        <IconField><InputIcon class="pi pi-search" /><InputText v-model="q" placeholder="الاسم أو اللقب" fluid /></IconField>
        <ul v-if="found.length" class="found">
          <li v-for="f in found" :key="f.id">
            <div><b>{{ f.name }}</b><small>{{ f.sub }}<template v-if="f.printedAt"> · آخر طباعة {{ fmt(f.printedAt) }}</template></small>
              <small v-if="f.otherSchools.length" class="warn"><i class="pi pi-exclamation-triangle" /> يعمل أيضاً في {{ f.otherSchools.join('، ') }}: ستتغيّر كلمة مروره هناك أيضاً</small>
            </div>
            <Button label="ورقة جديدة" icon="pi pi-print" size="small" text :loading="busy === f.id" @click="issue('one', f.id)" />
          </li>
        </ul>
        <small v-else-if="q.trim().length >= 2" class="muted">لا نتائج</small>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { isTop as topRole } from '@/config/roles'
import { sheetsSummary, searchSheetPeople, issueSheets } from '@/api/credentials'
import { storage } from '@/utils/storage'

const auth = useAuthStore()
const cat = useCatalog()
const router = useRouter()
const toast = useToast()
const isTop = computed(() => topRole(auth.role))
const categories = computed(() => [
  { label: 'التلاميذ', value: 'students' }, { label: 'الأولياء', value: 'parents' }, { label: 'المعلمون', value: 'teachers' },
  ...(isTop.value ? [{ label: 'الطاقم الإداري', value: 'staff' }] : [])
])
const category = ref('students')
// المدير: مدرسته فقط؛ الإدارة العامة: تصفية بالمدرسة (أو كل المدارس)
const schoolOpts = computed(() => [{ label: 'كل المدارس', value: null }, ...cat.schools.map((s) => ({ label: s.name, value: s.id }))])
const schoolId = ref(isTop.value ? cat.schools[0]?.id || null : auth.active?.schoolId)
const mySchoolName = computed(() => cat.schools.find((s) => s.id === auth.active?.schoolId)?.name)
const orderHint = computed(() => ({ students: 'مرتبة بالأقسام، وكل قسم في صفحات مستقلة.', parents: 'مرتبة بأقسام الأبناء؛ ورقة واحدة للولي في قسم أكبر أبنائه.', teachers: 'مرتبة أبجدياً.', staff: 'مرتبة بالدور.' }[category.value]))

const sum = ref({ total: 0, toPrint: 0, fresh: 0, logged: 0 })
const q = ref('')
const found = ref([])
const busy = ref(null)
const fmt = (d) => new Date(d).toLocaleDateString('ar-DZ')

async function refresh() {
  sum.value = await sheetsSummary(category.value, schoolId.value)
  found.value = q.value.trim().length >= 2 ? await searchSheetPeople(category.value, schoolId.value, q.value) : []
}
watch([category, schoolId], () => { q.value = ''; refresh() }, { immediate: true })
watch(q, refresh)

async function issue(mode, personId = null) {
  busy.value = personId || mode
  try {
    const data = await issueSheets({ category: category.value, schoolId: schoolId.value, mode, personId }, auth.person)
    // تُمرَّر لصفحة الطباعة فقط؛ في الخادم الحقيقي لا تُحفظ كلمات المرور المؤقتة في المتصفح
    storage.set('ist.loginSheets', data)
    router.push({ name: 'login-sheets-print' })
  } catch (e) {
    toast.add({ severity: 'warn', summary: e.message, life: 3000 })
  } finally {
    busy.value = null
  }
}
</script>

<style scoped>
.top { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; justify-content: space-between; margin-bottom: 1rem; }
.school { display: flex; flex-direction: column; gap: 0.35rem; min-width: min(280px, 100%); font-size: 0.85rem; font-weight: 700; }
.school-name { margin: 0; }
/* الهاتف: الفئات في شبكة متساوية (2×2) بدل صف ينكسر */
@media (max-width: 600px) { .top :deep(.p-selectbutton) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; } }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 1rem; align-items: start; }
.card { display: flex; flex-direction: column; gap: 0.6rem; }
.card h3 { margin: 0; font-size: 1.02rem; display: flex; gap: 0.5rem; align-items: center; }
.card h3 i { color: var(--p-primary-color); }
.card p { margin: 0; font-size: 0.88rem; color: var(--muted); }
.card .num { color: inherit; }
.num b { font-size: 1.6rem; }
.num small { color: var(--muted); }
.found { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; max-height: 360px; overflow: auto; }
.found li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.45rem 0.6rem; border: 1px solid var(--line, #e5e7eb); border-radius: 10px; }
.found li > div { display: flex; flex-direction: column; min-width: 0; }
.found small { font-size: 0.76rem; color: var(--muted); }
.found .warn { color: #a15c00; }
</style>
