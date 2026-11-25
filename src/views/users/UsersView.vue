<template>
  <!-- قائمة المستخدمين الموحّدة: معلمو/تلاميذ/أولياء المدرسة (SM02–SM04) أو كل المستخدمين (AD02–AD03) -->
  <div>
    <PageHeader :title="title" :subtitle="subtitle" />
    <StatTiles v-if="stats.length" :items="stats" />
    <RecordTable v-model:selection="selected" :rows="rows" :loading="loading" :columns="columns" :search-keys="['name', 'username', 'phone', 'email', 'className', 'parents', 'childrenLabel']" :filters="filters" :unit="unit" selectable>
      <template #toolbar>
        <template v-if="selected.length">
          <Button :label="`تفعيل (${selected.length})`" icon="pi pi-check" size="small" severity="success" outlined @click="bulk('active')" />
          <Button :label="`إيقاف (${selected.length})`" icon="pi pi-ban" size="small" severity="danger" outlined @click="bulk('suspended')" />
        </template>
        <Button label="تصدير" icon="pi pi-download" size="small" severity="secondary" outlined @click="exportCsv(`${unit}.csv`, rows, columns)" />
        <Button :label="addLabel" icon="pi pi-plus" size="small" @click="openAdd" />
      </template>
      <template #cell-roles="{ row }"><span class="roles"><span v-for="r in row.roles" :key="r" class="role">{{ t('roles.' + r) }}</span></span></template>
      <template #actions="{ row }"><Button icon="pi pi-pencil" text rounded size="small" title="الملف والصفات" @click="openUser(row.id)" /></template>
    </RecordTable>

    <FormDialog v-model:visible="addDlg" :title="addLabel" :fields="addFields" :value="addValue" save-label="إضافة" wide :busy="busy" @save="add" />

    <!-- ملف المستخدم: البيانات + كل صفاته (شخص واحد، صفات متعددة) -->
    <Dialog v-model:visible="userDlg" modal :header="user ? `${user.firstName} ${user.lastName}` : ''" :style="{ width: 'min(760px, 96vw)' }">
      <div v-if="user" class="ud">
        <section>
          <h4>البيانات الشخصية</h4>
          <div class="ud__grid">
            <label><span>الاسم</span><InputText v-model="user.firstName" fluid /></label>
            <label><span>اللقب</span><InputText v-model="user.lastName" fluid /></label>
            <label><span>الهاتف</span><InputText v-model="user.phone" dir="ltr" fluid /></label>
            <label><span>البريد</span><InputText v-model="user.email" dir="ltr" fluid /></label>
            <label><span>اسم الدخول</span><InputText :model-value="user.username || '— (لم يُنشأ حساب دخول)'" disabled fluid /></label>
            <label><span>الحالة</span><Select v-model="user.status" :options="STATUS_OPTS" option-label="label" option-value="value" fluid /></label>
          </div>
        </section>
        <section>
          <h4>الصفات <small class="muted">— شخص واحد قد يكون معلماً ووليّاً، أو معلماً في مدرستين</small></h4>
          <ul class="asg">
            <li v-for="a in user.assignments" :key="a.id">
              <span class="role">{{ t('roles.' + a.role) }}</span>
              <span class="asg__d">{{ a.schoolName || 'كل المدارس' }}<template v-if="a.classNames.length"> · {{ a.classNames.join('، ') }}</template><template v-if="a.childNames.length"> · الأبناء: {{ a.childNames.join('، ') }}</template><template v-if="a.subjects?.length"> · {{ a.subjects.join('، ') }}</template></span>
              <Button v-if="canEditAssignments && user.assignments.length > 1" icon="pi pi-times" text rounded size="small" severity="danger" title="إزالة الصفة" @click="dropAssignment(a)" />
            </li>
          </ul>
          <div v-if="canEditAssignments" class="add-asg">
            <Select v-model="na.role" :options="roleOptions" option-label="label" option-value="value" placeholder="صفة جديدة" />
            <Select v-if="needsSchool(na.role) && !schoolId" v-model="na.schoolId" :options="cat.schoolOptions" option-label="label" option-value="value" placeholder="المدرسة" filter />
            <MultiSelect v-if="na.role === 'teacher'" v-model="na.classIds" :options="cat.classOptions().filter((c) => !effSchool || cat.classes.find((x) => x.id === c.value)?.schoolId === effSchool)" option-label="label" option-value="value" placeholder="الأقسام" display="chip" />
            <Select v-if="na.role === 'student'" v-model="na.classId" :options="cat.classOptions().filter((c) => !effSchool || cat.classes.find((x) => x.id === c.value)?.schoolId === effSchool)" option-label="label" option-value="value" placeholder="القسم" />
            <Button label="إضافة الصفة" icon="pi pi-plus" size="small" :disabled="!na.role" @click="addAsg" />
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="إغلاق" text severity="secondary" @click="userDlg = false" />
        <Button label="حفظ البيانات" icon="pi pi-check" @click="saveUser" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import StatTiles from '@/components/ui/StatTiles.vue'
import RecordTable from '@/components/ui/RecordTable.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useCatalog } from '@/composables/useCatalog'
import { exportCsv } from '@/utils/exportCsv'
import { listUsers, getUser, createUser, updateUser, setStatus, addAssignment, removeAssignment } from '@/api/people'

const props = defineProps({ role: { type: String, default: null }, scope: { type: String, default: 'school' }, title: String, subtitle: String })
const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const cat = useCatalog()
const STATUS_OPTS = [{ label: 'مفعّل', value: 'active' }, { label: 'بانتظار التفعيل', value: 'pending' }, { label: 'موقوف', value: 'suspended' }, { label: 'مؤرشف', value: 'archived' }]
const schoolId = computed(() => (props.scope === 'school' ? auth.active.school?.id : null))
const rows = ref([])
const loading = ref(true)
const selected = ref([])
const busy = ref(false)

async function load() {
  loading.value = true
  rows.value = (await listUsers({ role: props.role, schoolId: schoolId.value })).map((r) => ({ ...r, average: r.average ?? '—', rolesLabel: r.roles.map((x) => t('roles.' + x)).join('، ') }))
  loading.value = false
  selected.value = []
}
watch(() => [props.role, props.scope, auth.activeAssignmentId], load, { immediate: true })

const unit = computed(() => ({ teacher: 'معلم', student: 'تلميذ', parent: 'ولي' })[props.role] || 'مستخدم')
const addLabel = computed(() => ({ teacher: 'إضافة معلم', student: 'إضافة تلميذ', parent: 'إضافة ولي' })[props.role] || 'إضافة مستخدم')
const columns = computed(() => {
  const status = { field: 'status', label: 'الحالة', type: 'status' }
  if (props.role === 'teacher') return [{ field: 'name', label: 'المعلم', type: 'person', sub: 'phone' }, { field: 'subjects', label: 'المواد', type: 'list' }, { field: 'classesLabel', label: 'الأقسام' }, { field: 'classCount', label: 'عدد الأقسام' }, status]
  if (props.role === 'student') return [{ field: 'name', label: 'التلميذ', type: 'person', sub: 'parents' }, { field: 'className', label: 'القسم' }, { field: 'progress', label: 'التقدّم', type: 'progress' }, { field: 'average', label: 'المعدل' }, { field: 'late', label: 'متأخرات' }, status]
  if (props.role === 'parent') return [{ field: 'name', label: 'الولي', type: 'person', sub: 'phone' }, { field: 'childrenLabel', label: 'الأبناء' }, { field: 'childCount', label: 'العدد' }, status]
  return [{ field: 'name', label: 'المستخدم', type: 'person', sub: 'username' }, { field: 'roles', label: 'الصفات' }, { field: 'schoolsLabel', label: 'المدارس' }, { field: 'phone', label: 'الهاتف' }, status]
})
const filters = computed(() => {
  const f = [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }]
  if (props.role === 'student') f.push({ key: 'className', label: 'القسم', options: [...new Set(rows.value.map((r) => r.className))].filter(Boolean).map((v) => ({ label: v, value: v })) })
  if (!props.role) {
    f.push({ key: 'role', label: 'الصفة', options: Object.keys({ super_admin: 1, admin: 1, editor: 1, school_manager: 1, teacher: 1, student: 1, parent: 1, support: 1 }).map((r) => ({ label: t('roles.' + r), value: r })), match: (r, v) => r.roles.includes(v) })
    f.push({ key: 'school', label: 'المدرسة', options: cat.schools.map((s) => ({ label: s.short + ' - ' + s.commune, value: s.short })), match: (r, v) => r.schools.includes(v) })
    f.push({ key: 'demo', label: 'الحسابات', options: [{ label: 'حسابات تجريبية للدخول', value: true }], match: (r) => r.demo })
  }
  return f
})
const stats = computed(() => {
  if (!rows.value.length) return []
  const pend = rows.value.filter((r) => r.status === 'pending').length
  const base = [{ label: `عدد ${unit.value === 'مستخدم' ? 'المستخدمين' : 'السجلات'}`, value: rows.value.length, icon: 'pi pi-users' }, { label: 'بانتظار التفعيل', value: pend, icon: 'pi pi-clock', tone: pend ? 'amber' : 'green', to: props.scope === 'school' ? '/app/activation' : null }]
  if (props.role === 'student') base.push({ label: 'متوسط التقدّم', value: Math.round(rows.value.reduce((n, r) => n + r.progress, 0) / rows.value.length) + '%', icon: 'pi pi-book', tone: 'purple' }, { label: 'يحتاجون متابعة', value: rows.value.filter((r) => r.progress < 30 || r.late >= 3).length, icon: 'pi pi-exclamation-triangle', tone: 'red' })
  if (props.role === 'teacher') base.push({ label: 'الأقسام المغطاة', value: rows.value.reduce((n, r) => n + (r.classCount || 0), 0), icon: 'pi pi-th-large', tone: 'purple' })
  if (!props.role) base.push({ label: 'لهم أكثر من صفة', value: rows.value.filter((r) => r.roles.length > 1).length, icon: 'pi pi-clone', tone: 'purple', hint: 'شخص واحد = حساب واحد' })
  return base
})

/* ——— الإضافة ——— */
const addDlg = ref(false)
const addValue = ref({})
const needsSchool = (r) => ['school_manager', 'teacher', 'student'].includes(r)
const roleOptions = computed(() => (props.scope === 'school' ? ['teacher', 'student', 'parent'] : ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'student', 'parent', 'support']).map((r) => ({ label: t('roles.' + r), value: r })))
const schoolClasses = computed(() => cat.classOptions().filter((c) => !schoolId.value || cat.classes.find((x) => x.id === c.value)?.schoolId === schoolId.value))
const addFields = computed(() => {
  const f = [
    { key: 'firstName', label: 'الاسم', required: true }, { key: 'lastName', label: 'اللقب', required: true },
    { key: 'gender', label: 'الجنس', type: 'select', options: [{ label: 'ذكر', value: 'male' }, { label: 'أنثى', value: 'female' }], required: true }
  ]
  if (!props.role) f.push({ key: 'role', label: 'الصفة', type: 'select', options: roleOptions.value, required: true }, { key: 'schoolId', label: 'المدرسة', type: 'select', options: cat.schoolOptions, hint: 'لمدير المدرسة والمعلم والتلميذ' })
  if (props.role === 'student') f.push({ key: 'classId', label: 'القسم', type: 'select', options: schoolClasses.value, required: true }, { key: 'birthDate', label: 'تاريخ الميلاد', type: 'date' })
  if (props.role === 'teacher') f.push({ key: 'classIds', label: 'الأقسام', type: 'multi', options: schoolClasses.value }, { key: 'subjects', label: 'المواد', type: 'multi', options: cat.subjectNames })
  if (props.role === 'parent') f.push({ key: 'childIds', label: 'الأبناء', type: 'multi', options: [], hint: 'يُربط الأبناء من ملف الولي بعد الإنشاء أو بالاستيراد' })
  if (props.role !== 'student') f.push({ key: 'phone', label: 'الهاتف', ltr: true }, { key: 'email', label: 'البريد الإلكتروني', ltr: true })
  f.push({ key: 'username', label: 'اسم الدخول', ltr: true, hint: 'اتركه فارغاً لإنشاء السجل دون حساب دخول الآن' })
  return f
})
function openAdd() {
  addValue.value = { gender: 'male', role: props.role }
  addDlg.value = true
}
async function add(v) {
  busy.value = true
  try {
    await createUser({ ...v, role: props.role || v.role, schoolId: schoolId.value || v.schoolId, status: 'pending' })
    toast.add({ severity: 'success', summary: 'أُضيف', detail: 'الحساب بانتظار التفعيل', life: 2500 })
    addDlg.value = false
    load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.message, life: 3000 })
  } finally {
    busy.value = false
  }
}

/* ——— الملف والصفات ——— */
const userDlg = ref(false)
const user = ref(null)
const na = reactive({ role: null, schoolId: null, classIds: [], classId: null })
const canEditAssignments = computed(() => props.scope === 'all' || ['teacher', 'student', 'parent'].includes(props.role))
const effSchool = computed(() => schoolId.value || na.schoolId)
async function openUser(id) {
  user.value = await getUser(id)
  Object.assign(na, { role: null, schoolId: null, classIds: [], classId: null })
  userDlg.value = true
}
async function saveUser() {
  await updateUser(user.value.id, user.value)
  toast.add({ severity: 'success', summary: 'حُفظت البيانات', life: 1800 })
  userDlg.value = false
  load()
}
async function addAsg() {
  await addAssignment(user.value.id, { ...na, schoolId: effSchool.value })
  user.value = await getUser(user.value.id)
  Object.assign(na, { role: null, schoolId: null, classIds: [], classId: null })
  toast.add({ severity: 'success', summary: 'أُضيفت الصفة', detail: 'سيختار الشخص صفته عند الدخول', life: 2500 })
  load()
}
async function dropAssignment(a) {
  await removeAssignment(a.id)
  user.value = await getUser(user.value.id)
  load()
}
async function bulk(status) {
  const n = await setStatus(selected.value.map((r) => r.id), status)
  toast.add({ severity: 'success', summary: status === 'active' ? `فُعّل ${n} حساباً` : `أُوقف ${n} حساباً`, life: 2200 })
  load()
}
</script>

<style scoped>
.roles { display: flex; gap: 0.25rem; flex-wrap: wrap; }
.role { font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; background: color-mix(in srgb, var(--brand) 10%, #fff); color: var(--brand); font-weight: 700; white-space: nowrap; }
.ud { display: flex; flex-direction: column; gap: 1.25rem; }
.ud h4 { margin: 0 0 0.6rem; font-size: 0.95rem; }
.ud__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem 1rem; }
.ud__grid label { display: flex; flex-direction: column; gap: 0.25rem; }
.ud__grid label span { font-size: 0.82rem; font-weight: 700; }
.asg { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
.asg li { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.7rem; border: 1px solid var(--line); border-radius: 10px; }
.asg__d { font-size: 0.86rem; flex: 1; }
.add-asg { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; padding: 0.7rem; background: var(--bg); border-radius: 10px; }
.add-asg > * { min-width: 150px; }
@media (max-width: 600px) { .ud__grid { grid-template-columns: 1fr; } }
</style>
