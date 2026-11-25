<template>
  <!-- AD12: الأدوار والصلاحيات — المدير العام يعدّل، المشرف العام يطّلع -->
  <div v-if="d">
    <PageHeader title="الأدوار والصلاحيات" subtitle="ما يستطيع كل دور فعله. المدير العام والمشرف العام يتشاركان الشاشات؛ الفرق في الصلاحيات فقط." />
    <Message v-if="!canEdit" severity="info" class="mb"><i class="pi pi-lock" /> تعديل الصلاحيات من صلاحية المدير العام.</Message>
    <div class="panel wrap">
      <table class="mx">
        <thead><tr><th>الصلاحية</th><th v-for="r in ROLES" :key="r">{{ t('roles.' + r) }}</th></tr></thead>
        <tbody>
          <template v-for="g in groups" :key="g">
            <tr class="grp"><td :colspan="ROLES.length + 1">{{ g }}</td></tr>
            <tr v-for="p in d.permissions.filter((x) => x.group === g)" :key="p.key">
              <td>{{ p.label }}</td>
              <td v-for="r in ROLES" :key="r" class="c"><Checkbox :model-value="matrix[r]?.includes(p.key)" binary :disabled="!canEdit || r === 'super_admin'" @update:model-value="(v) => toggle(r, p.key, v)" /></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="canEdit" class="act"><Button label="حفظ الصلاحيات" icon="pi pi-check" :disabled="!dirty" :loading="busy" @click="save" /></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { getPermissions, savePermissions } from '@/api/admin'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const ROLES = ['super_admin', 'admin', 'editor', 'school_manager', 'teacher', 'support']
const d = ref(null)
const matrix = ref({})
const dirty = ref(false)
const busy = ref(false)
const canEdit = computed(() => auth.role === 'super_admin')
const groups = computed(() => [...new Set(d.value.permissions.map((p) => p.group))])
onMounted(async () => {
  d.value = await getPermissions()
  matrix.value = JSON.parse(JSON.stringify(d.value.matrix))
})
function toggle(r, key, v) {
  const list = new Set(matrix.value[r] || [])
  v ? list.add(key) : list.delete(key)
  matrix.value[r] = [...list]
  dirty.value = true
}
async function save() {
  busy.value = true
  await savePermissions(matrix.value, auth.role)
  busy.value = false
  dirty.value = false
  toast.add({ severity: 'success', summary: 'حُفظت الصلاحيات', life: 2000 })
}
</script>

<style scoped>
.mb { margin-bottom: 1rem; }
.wrap { overflow-x: auto; padding: 0; }
.mx { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 720px; }
.mx th { padding: 0.7rem 0.5rem; font-size: 0.8rem; background: var(--bg); position: sticky; top: 0; }
.mx td { padding: 0.5rem; border-top: 1px solid var(--line); }
.mx td.c { text-align: center; }
.grp td { background: color-mix(in srgb, var(--brand) 6%, #fff); font-weight: 800; color: var(--brand); font-size: 0.82rem; }
.act { display: flex; justify-content: flex-end; margin-top: 1rem; }
</style>
