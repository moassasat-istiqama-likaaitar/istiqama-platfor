<template>
  <!-- SU04: فريق الدعم -->
  <div>
    <PageHeader title="فريق الدعم" subtitle="أعضاء الدعم الفني ومجالات تدخّلهم وعبء العمل الحالي." />
    <div class="team">
      <div v-for="m in rows" :key="m.id" class="panel mb">
        <span class="av" :class="m.status">{{ m.name.charAt(0) }}</span>
        <b>{{ m.name }}</b>
        <small class="muted">{{ m.role }} · {{ m.scope }}</small>
        <div class="nums"><span><b>{{ m.open }}</b> مفتوح</span><span><b>{{ m.resolved }}</b> محلول</span></div>
        <small dir="ltr" class="muted">{{ m.phone }}</small>
        <span class="state">{{ { online: 'متصل', away: 'غائب مؤقتاً', offline: 'غير متصل' }[m.status] }}</span>
      </div>
      <button type="button" class="panel add" @click="dlg = true"><i class="pi pi-user-plus" /> عضو جديد</button>
    </div>
    <FormDialog v-model:visible="dlg" title="عضو جديد في فريق الدعم" :fields="[{ key: 'name', label: 'الاسم الكامل', required: true }, { key: 'role', label: 'الدور', required: true, placeholder: 'دعم تقني' }, { key: 'scope', label: 'مجال التدخل', required: true }, { key: 'phone', label: 'الهاتف', ltr: true }]" @save="add" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import FormDialog from '@/components/ui/FormDialog.vue'
import { listTeam, saveMember } from '@/api/support'

const rows = ref([])
const dlg = ref(false)
const load = async () => (rows.value = await listTeam())
onMounted(load)
async function add(v) {
  await saveMember(v)
  dlg.value = false
  load()
}
</script>

<style scoped>
.team { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 0.85rem; }
.mb { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.3rem; position: relative; }
.av { width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--brand) 14%, #fff); color: var(--brand); display: grid; place-items: center; font-size: 1.4rem; font-weight: 800; box-shadow: 0 0 0 3px #fff, 0 0 0 5px #b8c0cc; }
.av.online { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #17a077; }
.av.away { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #f5a400; }
.nums { display: flex; gap: 1rem; margin: 0.3rem 0; font-size: 0.85rem; }
.state { position: absolute; top: 0.6rem; inset-inline-end: 0.7rem; font-size: 0.72rem; color: var(--p-text-muted-color); }
.add { border: 2px dashed var(--line); background: none; font: inherit; cursor: pointer; color: var(--brand); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem; min-height: 180px; }
</style>
