<template>
  <!-- AD05: الحسابات المكررة — الدمج يحفظ كل الأدوار في حساب واحد -->
  <div>
    <PageHeader title="الحسابات المكررة" subtitle="أشخاص لهم أكثر من حساب (نفس الاسم واللقب أو نفس تاريخ الميلاد). الدمج ينقل كل الأدوار إلى حساب واحد: شخص واحد = حساب واحد." />
    <div v-for="g in groups" :key="g.id" class="panel grp">
      <header><b>{{ g.name }}</b><span class="muted">{{ g.reason }} · {{ g.people.length }} حسابات</span></header>
      <table class="t">
        <thead><tr><th>الاحتفاظ</th><th>الأدوار</th><th>المدرسة</th><th>الميلاد</th><th>الهاتف</th></tr></thead>
        <tbody><tr v-for="p in g.people" :key="p.id"><td><RadioButton v-model="keep[g.id]" :value="p.id" /></td><td>{{ p.roles.map((r) => t('roles.' + r)).join('، ') }}</td><td>{{ p.school }}</td><td>{{ p.birthDate }}</td><td dir="ltr">{{ p.phone }}</td></tr></tbody>
      </table>
      <footer>
        <small class="muted">قد يكون شخصين مختلفين بنفس الاسم — تحقّق قبل الدمج.</small>
        <Button label="ليسا نفس الشخص" text size="small" severity="secondary" @click="groups = groups.filter((x) => x.id !== g.id)" />
        <Button label="دمج في الحساب المختار" icon="pi pi-clone" size="small" :disabled="!keep[g.id]" @click="merge(g)" />
      </footer>
    </div>
    <EmptyState v-if="loaded && !groups.length" icon="pi pi-check-circle" title="لا حسابات مكررة" text="" class="panel" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { duplicates, mergeUsers } from '@/api/people'

const { t } = useI18n()
const toast = useToast()
const groups = ref([])
const keep = reactive({})
const loaded = ref(false)
onMounted(async () => {
  groups.value = await duplicates()
  loaded.value = true
})
async function merge(g) {
  await mergeUsers(keep[g.id], g.people.map((p) => p.id).filter((id) => id !== keep[g.id]))
  toast.add({ severity: 'success', summary: `دُمجت حسابات ${g.name}`, detail: 'انتقلت كل الأدوار إلى الحساب المختار', life: 2600 })
  groups.value = groups.value.filter((x) => x.id !== g.id)
}
</script>

<style scoped>
.grp { margin-bottom: 0.85rem; }
.grp header { display: flex; gap: 0.75rem; align-items: baseline; margin-bottom: 0.6rem; }
.t { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.t th { text-align: start; font-size: 0.78rem; color: var(--p-text-muted-color); padding: 0.35rem; border-bottom: 1px solid var(--line); }
.t td { padding: 0.4rem 0.35rem; border-bottom: 1px solid var(--line); }
.grp footer { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.grp footer small { margin-inline-end: auto; }
</style>
